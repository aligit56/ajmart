const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static images

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp|jpg)$/i)) {
            return cb(new Error('Allowed formats: JPG, PNG, WebP (max 5 MB)'));
        }
        cb(null, true);
    }
});

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error("Database connection error: " + err.message);
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_string_123';

app.get('/', (req, res) => {
    res.send('AJMart Backend API is running!');
});

// --- MIDDLEWARE ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: "No token provided" });
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Unauthorized" });
        req.user = decoded;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ error: "Admin access required" });
    }
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        req.user = null;
        return next();
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (!err && decoded) {
            req.user = decoded;
        } else {
            req.user = null;
        }
        next();
    });
};

// --- AUTH ENDPOINTS ---
app.post('/api/auth/register', (req, res) => {
    const { name, email, phone, address, password } = req.body;
    if (!name || !email || !password || !phone) {
        return res.status(400).json({ error: "Please fill in all required fields (Name, Email, Phone, Password)" });
    }
    const cleanEmail = email.trim().toLowerCase();
    const hash = bcrypt.hashSync(password, 10);
    db.run(`INSERT INTO Users (name, email, phone, address, password) VALUES (?, ?, ?, ?, ?)`,
        [name.trim(), cleanEmail, phone.trim(), address ? address.trim() : '', hash], function(err) {
            if (err) {
                if (err.message && err.message.includes('UNIQUE constraint')) {
                    return res.status(400).json({ error: "An account with this email already exists. Please login." });
                }
                return res.status(400).json({ error: err.message });
            }
            const userId = this.lastID;
            const newUser = { id: userId, name: name.trim(), email: cleanEmail, phone: phone.trim(), address: address ? address.trim() : '', role: 'customer', points: 0 };
            const token = jwt.sign({ id: userId, role: 'customer' }, JWT_SECRET, { expiresIn: '24h' });
            res.status(201).json({ message: "Registration successful", token, user: newUser });
        });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Please enter your email and password" });
    }
    const cleanEmail = email.trim().toLowerCase();
    db.get(`SELECT * FROM Users WHERE LOWER(email) = ?`, [cleanEmail], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: "No account found with this email. Please check or register." });
        
        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
            // Don't send password hash back
            const { password, ...userWithoutPassword } = user;
            res.json({ token, user: userWithoutPassword });
        } else {
            res.status(401).json({ error: "Incorrect password. Please try again." });
        }
    });
});

app.get('/api/auth/profile', verifyToken, (req, res) => {
    db.get(`SELECT id, name, email, phone, address, role, points, created_at FROM Users WHERE id = ?`, [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(user);
    });
});

// --- CATEGORIES ENDPOINTS ---
app.get('/api/categories', (req, res) => {
    db.all(`SELECT * FROM Categories`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/categories', verifyToken, isAdmin, (req, res) => {
    const { name, description, image_url } = req.body;
    db.run(`INSERT INTO Categories (name, description, image_url) VALUES (?, ?, ?)`, [name, description, image_url], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name, description, image_url });
    });
});

app.put('/api/categories/:id', verifyToken, isAdmin, (req, res) => {
    const { name, description, image_url } = req.body;
    db.run(`UPDATE Categories SET name = COALESCE(?, name), description = COALESCE(?, description), image_url = COALESCE(?, image_url) WHERE id = ?`,
        [name, description, image_url, req.params.id], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: "Category updated", changes: this.changes });
        });
});

app.delete('/api/categories/:id', verifyToken, isAdmin, (req, res) => {
    db.run(`DELETE FROM Categories WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Category deleted" });
    });
});

// --- PRODUCTS ENDPOINTS ---
const attachGalleryImages = (products) => {
    return new Promise((resolve, reject) => {
        if (!products || products.length === 0) return resolve(products);
        const productIds = products.map(p => p.id);
        const placeholders = productIds.map(() => '?').join(',');
        const sql = `SELECT product_id, image_url, image_type, sort_order FROM product_images WHERE product_id IN (${placeholders}) ORDER BY sort_order ASC, id ASC`;
        db.all(sql, productIds, (err, rows) => {
            if (err) return reject(err);
            const imagesMap = {};
            for (const row of rows || []) {
                if (!imagesMap[row.product_id]) imagesMap[row.product_id] = [];
                imagesMap[row.product_id].push({
                    image_url: row.image_url,
                    image_type: row.image_type,
                    sort_order: row.sort_order
                });
            }
            for (const prod of products) {
                const prodImages = imagesMap[prod.id] || [];
                if (prodImages.length === 0 && prod.image_url) {
                    prodImages.push({
                        image_url: prod.image_url,
                        image_type: 'main',
                        sort_order: 0
                    });
                }
                prod.images = prodImages;
                if (prodImages.length > 0) {
                    const handImg = prodImages.find(img => img.image_type === 'hand');
                    const mainImg = prodImages.find(img => img.image_type === 'main');
                    prod.image_url = handImg ? handImg.image_url : (mainImg ? mainImg.image_url : prodImages[0].image_url);
                }
            }
            resolve(products);
        });
    });
};

app.get('/api/products/search', (req, res) => {
    const query = req.query.q?.toLowerCase() || '';
    if (!query) return res.status(400).json({ error: 'Query required' });
    
    db.all(`
        SELECT p.* FROM Products p
        LEFT JOIN Categories c ON p.category_id = c.id
        WHERE (LOWER(p.name) LIKE ? OR LOWER(c.name) LIKE ? OR LOWER(p.brand) LIKE ?)
        AND p.is_active = 1
    `, [`%${query}%`, `%${query}%`, `%${query}%`], async (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        try {
            await attachGalleryImages(rows);
            res.json(rows);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
});

app.get('/api/products/featured', (req, res) => {
    db.all(`SELECT * FROM Products WHERE is_active = 1 AND is_featured = 1 LIMIT 8`, [], async (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows && rows.length > 0) {
            try {
                await attachGalleryImages(rows);
                return res.json(rows);
            } catch (e) {
                return res.status(500).json({ error: e.message });
            }
        }
        db.all(`SELECT * FROM Products WHERE is_active = 1 ORDER BY created_at DESC LIMIT 8`, [], async (e2, newest) => {
            if (e2) return res.status(500).json({ error: e2.message });
            try {
                await attachGalleryImages(newest);
                res.json(newest);
            } catch (e) {
                res.status(500).json({ error: e.message });
            }
        });
    });
});

app.get('/api/products/new-arrivals', (req, res) => {
    db.all(`SELECT * FROM Products WHERE is_active = 1 ORDER BY created_at DESC LIMIT 8`, [], async (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        try {
            await attachGalleryImages(rows);
            res.json(rows);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
});

app.get('/api/products/deals', (req, res) => {
    const query = `
        SELECT p.*, d.discount_percent, d.valid_until,
               ROUND(p.price * (100.0 - d.discount_percent) / 100.0, 2) AS discounted_price
        FROM Products p
        JOIN Discounts d ON p.id = d.product_id
        WHERE p.is_active = 1 AND d.valid_until >= datetime('now')
        ORDER BY d.discount_percent DESC
    `;
    db.all(query, [], async (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        try {
            await attachGalleryImages(rows);
            res.json(rows);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
});

app.get('/api/products', (req, res) => {
    const category_id = req.query.category;
    let query = `SELECT * FROM Products WHERE is_active = 1`;
    let params = [];
    if (category_id) {
        query += ` AND category_id = ?`;
        params.push(category_id);
    }
    db.all(query, params, async (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        try {
            await attachGalleryImages(rows);
            res.json(rows);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
});

app.get('/api/products/:id', (req, res) => {
    db.get(`SELECT * FROM Products WHERE id = ?`, [req.params.id], async (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Product not found" });
        try {
            await attachGalleryImages([row]);
            res.json(row);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
});

app.post('/api/products', verifyToken, isAdmin, (req, res) => {
    const { name, category_id, brand, price, stock, image_url, description, variants, is_featured } = req.body;
    db.run(`INSERT INTO Products (name, category_id, brand, price, stock, image_url, description, variants, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, category_id, brand || 'AJ Brand', price, stock, image_url, description, variants ? JSON.stringify(variants) : null, is_featured ? 1 : 0], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: "Product created" });
        });
});

app.put('/api/products/:id', verifyToken, isAdmin, (req, res) => {
    const { name, category_id, brand, price, stock, image_url, description, is_active, variants, is_featured } = req.body;
    db.run(`UPDATE Products SET name = COALESCE(?, name), category_id = COALESCE(?, category_id), brand = COALESCE(?, brand), price = COALESCE(?, price), stock = COALESCE(?, stock), image_url = COALESCE(?, image_url), description = COALESCE(?, description), is_active = COALESCE(?, is_active), variants = COALESCE(?, variants), is_featured = COALESCE(?, is_featured) WHERE id = ?`,
        [name, category_id, brand, price, stock, image_url, description, is_active, variants !== undefined ? (typeof variants === 'string' ? variants : JSON.stringify(variants)) : null, is_featured !== undefined ? (is_featured ? 1 : 0) : null, req.params.id], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: "Product updated", changes: this.changes });
        });
});

app.delete('/api/products/:id', verifyToken, isAdmin, (req, res) => {
    db.run(`UPDATE Products SET is_active = 0 WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Product soft deleted (deactivated)" });
    });
});

app.post('/api/products/upload-image', verifyToken, isAdmin, (req, res) => {
    upload.single('image')(req, res, async (uploadErr) => {
        if (uploadErr) {
            return res.status(400).json({ error: uploadErr.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        try {
            const productId = req.body.productId;
            let productName = req.body.name;
            let categoryName = req.body.category_name;
            let categoryId = req.body.category_id;

            const slugify = (str) => {
                return (str || '')
                    .toLowerCase()
                    .replace(/&/g, 'and')
                    .replace(/[^a-z0-9\s-]/g, '')
                    .trim()
                    .replace(/\s+/g, '-');
            };

            // If existing product ID, fetch details from DB if not provided
            if (productId && productId !== 'new') {
                const prod = await new Promise((resolve, reject) => {
                    db.get(`SELECT p.id, p.name, p.category_id, c.name as category_name 
                            FROM Products p 
                            LEFT JOIN Categories c ON p.category_id = c.id 
                            WHERE p.id = ?`, [productId], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
                if (prod) {
                    productName = productName || prod.name;
                    categoryName = categoryName || prod.category_name;
                    categoryId = categoryId || prod.category_id;
                }
            } else if (categoryId && !categoryName) {
                const cat = await new Promise((resolve, reject) => {
                    db.get('SELECT name FROM Categories WHERE id = ?', [categoryId], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
                if (cat) categoryName = cat.name;
            }

            const categorySlug = slugify(categoryName || 'general');
            const productSlug = slugify(productName || `product-${Date.now()}`);
            const filename = `${productSlug}.jpg`;
            const targetDir = path.join(__dirname, 'public/images/products', categorySlug);

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const targetFilePath = path.join(targetDir, filename);

            // Task 4 standard: 800x800 canvas, pure white #FFFFFF, product centered (approx 80-85% fill = max 680px), JPG quality 85
            const resizedBuffer = await sharp(req.file.buffer)
                .flatten({ background: '#ffffff' })
                .resize(680, 680, { fit: 'inside' })
                .toBuffer();

            const meta = await sharp(resizedBuffer).metadata();
            const top = Math.floor((800 - meta.height) / 2);
            const bottom = 800 - meta.height - top;
            const left = Math.floor((800 - meta.width) / 2);
            const right = 800 - meta.width - left;

            await sharp(resizedBuffer)
                .extend({ top, bottom, left, right, background: '#ffffff' })
                .jpeg({ quality: 85 })
                .toFile(targetFilePath);

            const relativeUrl = `/images/products/${categorySlug}/${filename}`;
            const csvImageFilename = `${categorySlug}/${filename}`;

            // Update database if productId exists
            if (productId && productId !== 'new') {
                await new Promise((resolve, reject) => {
                    db.run('UPDATE Products SET image_url = ? WHERE id = ?', [relativeUrl, productId], function(err) {
                        if (err) reject(err);
                        else resolve(this);
                    });
                });
            }

            // Update CSV template file if it exists
            const csvPath = path.join(__dirname, 'data/product_images_template.csv');
            if (fs.existsSync(csvPath) && productName) {
                try {
                    const content = fs.readFileSync(csvPath, 'utf8');
                    const lines = content.split('\n');
                    const updatedLines = lines.map(line => {
                        if (!line.trim()) return line;
                        if (line.includes(`"${productName}"`) || line.includes(productName)) {
                            const parts = line.split(',');
                            if (parts.length >= 5) {
                                parts[4] = `"${csvImageFilename}"\r`;
                                return parts.join(',');
                            }
                        }
                        return line;
                    });
                    fs.writeFileSync(csvPath, updatedLines.join('\n'), 'utf8');
                } catch (csvErr) {
                    console.error('Failed to update CSV template:', csvErr.message);
                }
            }

            res.json({
                success: true,
                imageUrl: relativeUrl,
                imageFilename: csvImageFilename,
                message: 'Image processed and saved successfully'
            });
        } catch (error) {
            console.error('Image upload processing error:', error);
            res.status(500).json({ error: error.message || 'Image processing failed' });
        }
    });
});

// --- HERO SLIDES ENDPOINTS ---
app.get('/api/hero-slides', (req, res) => {
    db.all(`SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY sort_order ASC, id ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/admin/hero-slides', verifyToken, isAdmin, (req, res) => {
    db.all(`SELECT * FROM hero_slides ORDER BY sort_order ASC, id ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/hero-slides', verifyToken, isAdmin, (req, res) => {
    const { media_type, media_url, title, subtitle, button_text, button_link, sort_order, is_active } = req.body;
    db.run(`INSERT INTO hero_slides (media_type, media_url, title, subtitle, button_text, button_link, sort_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [media_type || 'image', media_url, title, subtitle, button_text, button_link, sort_order || 0, is_active !== undefined ? is_active : 1], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: "Slide created" });
        });
});

app.put('/api/hero-slides/:id', verifyToken, isAdmin, (req, res) => {
    const { media_type, media_url, title, subtitle, button_text, button_link, sort_order, is_active } = req.body;
    db.run(`UPDATE hero_slides SET media_type = COALESCE(?, media_type), media_url = COALESCE(?, media_url), title = COALESCE(?, title), subtitle = COALESCE(?, subtitle), button_text = COALESCE(?, button_text), button_link = COALESCE(?, button_link), sort_order = COALESCE(?, sort_order), is_active = COALESCE(?, is_active) WHERE id = ?`,
        [media_type, media_url, title, subtitle, button_text, button_link, sort_order, is_active, req.params.id], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: "Slide updated", changes: this.changes });
        });
});

app.delete('/api/hero-slides/:id', verifyToken, isAdmin, (req, res) => {
    db.run(`DELETE FROM hero_slides WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Slide deleted" });
    });
});

// --- FEATURED VIDEOS ENDPOINTS ---
app.get('/api/featured-videos', (req, res) => {
    db.all(`SELECT * FROM featured_videos WHERE is_active = 1 ORDER BY sort_order ASC, id ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/admin/featured-videos', verifyToken, isAdmin, (req, res) => {
    db.all(`SELECT * FROM featured_videos ORDER BY sort_order ASC, id ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/featured-videos', verifyToken, isAdmin, (req, res) => {
    const { title, video_url, thumbnail_url, sort_order, is_active } = req.body;
    db.run(`INSERT INTO featured_videos (title, video_url, thumbnail_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?)`,
        [title, video_url || '', thumbnail_url, sort_order || 0, is_active !== undefined ? is_active : 1], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.status(201).json({ id: this.lastID, message: "Video created" });
        });
});

app.put('/api/featured-videos/:id', verifyToken, isAdmin, (req, res) => {
    const { title, video_url, thumbnail_url, sort_order, is_active } = req.body;
    db.run(`UPDATE featured_videos SET title = COALESCE(?, title), video_url = COALESCE(?, video_url), thumbnail_url = COALESCE(?, thumbnail_url), sort_order = COALESCE(?, sort_order), is_active = COALESCE(?, is_active) WHERE id = ?`,
        [title, video_url, thumbnail_url, sort_order, is_active, req.params.id], function(err) {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: "Video updated", changes: this.changes });
        });
});

app.delete('/api/featured-videos/:id', verifyToken, isAdmin, (req, res) => {
    db.run(`DELETE FROM featured_videos WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Video deleted" });
    });
});

// --- SETTINGS ENDPOINTS ---
app.get('/api/settings', (req, res) => {
    db.all(`SELECT key, value FROM settings`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const settingsObj = {};
        rows.forEach(r => { settingsObj[r.key] = r.value; });
        res.json(settingsObj);
    });
});

app.put('/api/settings', verifyToken, isAdmin, (req, res) => {
    const settings = req.body; // e.g. { whatsapp_number: '...', phone: '...' }
    if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: "Invalid settings payload" });
    }
    const entries = Object.entries(settings);
    db.serialize(() => {
        const stmt = db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`);
        entries.forEach(([k, v]) => {
            stmt.run(k, v ? v.toString() : '');
        });
        stmt.finalize((err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Settings updated successfully" });
        });
    });
});

// --- ORDERS ENDPOINTS ---
app.post('/api/orders', optionalAuth, (req, res) => {
    const { items, total_price, delivery_address, notes, customer_name, customer_phone } = req.body;
    const user_id = req.user ? req.user.id : null;

    if (!items || items.length === 0) return res.status(400).json({ error: "No items in order" });

    // Points program: 50 points on every 2000 PKR for logged-in customers
    let pointsEarned = 0;
    if (user_id && total_price >= 2000) {
        pointsEarned = Math.floor(total_price / 2000) * 50;
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run(`INSERT INTO Orders (user_id, total_price, delivery_address, notes, customer_name, customer_phone) VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, total_price, delivery_address, notes, customer_name || (req.user ? req.user.name : null), customer_phone || (req.user ? req.user.phone : null)], function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(400).json({ error: err.message });
                }
                const order_id = this.lastID;
                const stmt = db.prepare(`INSERT INTO OrderItems (order_id, product_id, quantity, price, variant_name) VALUES (?, ?, ?, ?, ?)`);
                items.forEach(item => {
                    stmt.run([order_id, item.product_id, item.quantity, item.price, item.variant_name || null]);
                });
                stmt.finalize();

                // Award points to authenticated user
                if (user_id && pointsEarned > 0) {
                    db.run(`UPDATE Users SET points = COALESCE(points, 0) + ? WHERE id = ?`, [pointsEarned, user_id]);
                }

                db.run('COMMIT');
                res.status(201).json({ 
                    message: "Order placed successfully", 
                    order_id, 
                    pointsEarned,
                    guest: !user_id 
                });
            });
    });
});

// Helper: attach items to orders
const attachOrderItems = (orders) => {
    return new Promise((resolve, reject) => {
        if (!orders || orders.length === 0) return resolve(orders);
        const orderIds = orders.map(o => o.id);
        const placeholders = orderIds.map(() => '?').join(',');
        db.all(
            `SELECT OrderItems.*, Products.name as product_name, Products.image_url, Products.brand
             FROM OrderItems 
             LEFT JOIN Products ON OrderItems.product_id = Products.id 
             WHERE OrderItems.order_id IN (${placeholders})`,
            orderIds,
            (err, items) => {
                if (err) return reject(err);
                const itemsByOrder = {};
                (items || []).forEach(item => {
                    if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
                    itemsByOrder[item.order_id].push(item);
                });
                orders.forEach(o => {
                    o.items = itemsByOrder[o.id] || [];
                });
                resolve(orders);
            }
        );
    });
};

app.get('/api/orders', verifyToken, isAdmin, (req, res) => {
    db.all(`
        SELECT Orders.*, 
               COALESCE(Users.name, Orders.customer_name, 'Guest Customer') as customer_name,
               COALESCE(Users.name, Orders.customer_name, 'Guest Customer') as user_name,
               COALESCE(Users.phone, Orders.customer_phone, 'N/A') as customer_phone,
               COALESCE(Users.phone, Orders.customer_phone, 'N/A') as phone,
               Users.email as customer_email,
               CASE WHEN Orders.user_id IS NOT NULL THEN 1 ELSE 0 END as is_registered
        FROM Orders 
        LEFT JOIN Users ON Orders.user_id = Users.id 
        ORDER BY Orders.created_at DESC
    `, [], async (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        try {
            await attachOrderItems(rows);
            res.json(rows);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
});

app.get('/api/orders/me', verifyToken, (req, res) => {
    db.all(`SELECT * FROM Orders WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], async (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        try {
            await attachOrderItems(rows);
            res.json(rows);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });
});

app.put('/api/orders/:id/status', verifyToken, isAdmin, (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status is required" });
    db.run(`UPDATE Orders SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: "Order status updated successfully", status });
    });
});

app.put('/api/orders/:id/cancel', verifyToken, (req, res) => {
    db.get(`SELECT * FROM Orders WHERE id = ? AND user_id = ?`, [req.params.id, req.user.id], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!order) return res.status(404).json({ error: "Order not found" });
        if (order.status !== 'Pending') {
            return res.status(400).json({ error: "Only Pending orders can be cancelled directly. Please contact Aqib on WhatsApp." });
        }
        db.run(`UPDATE Orders SET status = 'Cancelled' WHERE id = ?`, [req.params.id], function(updateErr) {
            if (updateErr) return res.status(500).json({ error: updateErr.message });
            res.json({ message: "Order cancelled successfully" });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
