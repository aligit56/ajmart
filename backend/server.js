const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Server Hardening & Security Headers
app.disable('x-powered-by');
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
}));

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'https://ajmart-backend.onrender.com'
];
if (process.env.FRONTEND_URL) {
    const cleanFrontendUrl = process.env.FRONTEND_URL.trim().replace(/\/+$/, '');
    if (cleanFrontendUrl && !allowedOrigins.includes(cleanFrontendUrl)) {
        allowedOrigins.push(cleanFrontendUrl);
    }
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server health checks)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy: Specific origin not allowed'));
    },
    credentials: true
}));

app.use(express.json());
app.use(express.static('public')); // Serve static images

// Rate Limiters
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'test' ? 1000 : 20, // 20 attempts per IP
    message: { error: "Too many login attempts. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.NODE_ENV === 'test' ? 1000 : 50, // 50 accounts per IP per hour
    message: { error: "Too many accounts created from this IP. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false
});

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

const createDatabase = require('./utils/db');
const db = createDatabase();

const PORT = process.env.PORT || 5000;

// Production JWT_SECRET Enforcement & Development Fallback
const DEV_FALLBACK_JWT_SECRET = 'dev_jwt_secret_ajmart_local_fallback';
let JWT_SECRET = process.env.JWT_SECRET;

if (process.env.NODE_ENV === 'production') {
    if (!JWT_SECRET || !JWT_SECRET.trim() || JWT_SECRET === 'super_secret_string_123' || JWT_SECRET === DEV_FALLBACK_JWT_SECRET) {
        console.error('\n[FATAL SECURITY ERROR] JWT_SECRET is missing, empty, or set to a known development fallback in production!');
        console.error('AJMart requires a strong, unique, cryptographically random JWT_SECRET environment variable in production.');
        console.error('Please configure JWT_SECRET in your Render dashboard environment variables.\n');
        process.exit(1);
    }
} else {
    if (!JWT_SECRET || !JWT_SECRET.trim()) {
        JWT_SECRET = DEV_FALLBACK_JWT_SECRET;
    }
}

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
app.post('/api/auth/register', registerLimiter, (req, res) => {
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

app.post('/api/auth/login', loginLimiter, (req, res) => {
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
const enrichProductInventory = (products) => {
    if (!products) return products;
    const isArray = Array.isArray(products);
    const list = isArray ? products : [products];
    for (const prod of list) {
        const physical = Number(prod.stock) || 0;
        const reserved = Number(prod.reserved_stock) || 0;
        const available = Math.max(0, physical - reserved);
        prod.physical_stock = physical;
        prod.reserved_stock = reserved;
        prod.available_stock = available;
        // stock field reflects available stock for customer views
        prod.stock = available;
    }
    return products;
};

const attachGalleryImages = (products) => {
    return new Promise((resolve, reject) => {
        if (!products || products.length === 0) return resolve(products);
        enrichProductInventory(products);
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
    const { name, category_id, brand, price, stock, physical_stock, image_url, description, is_active, variants, is_featured } = req.body;
    const targetStock = physical_stock !== undefined ? physical_stock : stock;
    db.run(`UPDATE Products SET name = COALESCE(?, name), category_id = COALESCE(?, category_id), brand = COALESCE(?, brand), price = COALESCE(?, price), stock = COALESCE(?, stock), image_url = COALESCE(?, image_url), description = COALESCE(?, description), is_active = COALESCE(?, is_active), variants = COALESCE(?, variants), is_featured = COALESCE(?, is_featured) WHERE id = ?`,
        [name, category_id, brand, price, targetStock, image_url, description, is_active, variants !== undefined ? (typeof variants === 'string' ? variants : JSON.stringify(variants)) : null, is_featured !== undefined ? (is_featured ? 1 : 0) : null, req.params.id], function(err) {
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
app.post('/api/orders', optionalAuth, async (req, res) => {
    try {
        // Enforce admin restriction: administrators cannot place customer orders
        if (req.user && req.user.role === 'admin') {
            return res.status(403).json({
                error: "Administrators cannot place customer orders. Please sign out and continue as a customer or guest."
            });
        }

        const { items, delivery_address, notes, customer_name, customer_phone } = req.body;
        const user_id = req.user ? req.user.id : null;

        // 1. Validate items array
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Order must contain at least one item." });
        }

        if (!delivery_address || typeof delivery_address !== 'string' || !delivery_address.trim()) {
            return res.status(400).json({ error: "Delivery address is required." });
        }

        // 2. Validate individual item fields and aggregate quantities per product_id
        const totalQtyByProduct = {};
        for (const item of items) {
            const pid = Number(item.product_id);
            const qty = Number(item.quantity);

            if (!Number.isInteger(pid) || pid <= 0) {
                return res.status(400).json({ error: `Invalid product ID: ${item.product_id}` });
            }
            if (!Number.isInteger(qty) || qty <= 0) {
                return res.status(400).json({ error: `Quantity must be a positive integer for product ID ${pid}` });
            }

            totalQtyByProduct[pid] = (totalQtyByProduct[pid] || 0) + qty;
        }

        const uniqueProductIds = Object.keys(totalQtyByProduct).map(Number);
        const placeholders = uniqueProductIds.map(() => '?').join(',');

        // 3. Query authoritative products, active discounts, and minimum order setting
        const [products, discounts, settingsRows] = await Promise.all([
            new Promise((resolve, reject) => {
                db.all(`SELECT id, name, price, stock, reserved_stock, is_active, variants FROM Products WHERE id IN (${placeholders})`, uniqueProductIds, (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows || []);
                });
            }),
            new Promise((resolve, reject) => {
                db.all(`SELECT product_id, discount_percent, valid_until FROM Discounts WHERE product_id IN (${placeholders}) AND valid_until >= datetime('now')`, uniqueProductIds, (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows || []);
                });
            }),
            new Promise((resolve, reject) => {
                db.all(`SELECT key, value FROM settings WHERE key = 'minimum_order_amount'`, [], (err, rows) => {
                    if (err) return reject(err);
                    resolve(rows || []);
                });
            })
        ]);

        const minOrderSetting = (settingsRows || []).find(s => s.key === 'minimum_order_amount');
        const minOrderAmount = minOrderSetting && Number(minOrderSetting.value) ? Number(minOrderSetting.value) : 2000;

        const productMap = {};
        for (const p of products) {
            productMap[p.id] = p;
        }

        const discountMap = {};
        for (const d of discounts) {
            discountMap[d.product_id] = d;
        }

        // 4. Validate product existence, active status, and available stock
        for (const pid of uniqueProductIds) {
            const product = productMap[pid];
            if (!product) {
                return res.status(400).json({ error: `Product with ID ${pid} does not exist.` });
            }
            if (product.is_active !== 1) {
                return res.status(400).json({ error: `Product "${product.name}" is currently unavailable.` });
            }
            const physicalStock = Number(product.stock) || 0;
            const reservedStock = Number(product.reserved_stock) || 0;
            const availableStock = Math.max(0, physicalStock - reservedStock);
            const requestedQty = totalQtyByProduct[pid];

            if (availableStock < requestedQty) {
                return res.status(400).json({
                    error: `Insufficient available stock for "${product.name}". Requested ${requestedQty}, but only ${availableStock} available.`
                });
            }
        }

        // 5. Authoritatively calculate line prices and order total
        let authoritativeTotal = 0;
        const verifiedItems = [];

        for (const item of items) {
            const pid = Number(item.product_id);
            const qty = Number(item.quantity);
            const product = productMap[pid];

            let authoritativePrice = Number(product.price);

            // Handle product variants if present
            if (item.variant_name && product.variants) {
                try {
                    const parsedVariants = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
                    if (Array.isArray(parsedVariants)) {
                        const matchedVariant = parsedVariants.find(v => v.name && v.name.trim() === item.variant_name.trim());
                        if (matchedVariant && Number(matchedVariant.price) > 0) {
                            authoritativePrice = Number(matchedVariant.price);
                        }
                    }
                } catch (e) {
                    console.error('Error parsing variants for product', pid, e);
                }
            }

            // Apply active promotional discount if applicable
            const activeDiscount = discountMap[pid];
            if (activeDiscount && Number(activeDiscount.discount_percent) > 0) {
                const discountPct = Number(activeDiscount.discount_percent);
                authoritativePrice = Math.round(authoritativePrice * (100.0 - discountPct) / 100.0);
            }

            const lineTotal = authoritativePrice * qty;
            authoritativeTotal += lineTotal;

            verifiedItems.push({
                product_id: pid,
                name: product.name,
                price: authoritativePrice,
                quantity: qty,
                variant_name: item.variant_name || null
            });
        }

        // 6. Enforce minimum order threshold
        if (authoritativeTotal < minOrderAmount) {
            return res.status(400).json({
                error: `Minimum order amount is PKR ${minOrderAmount.toLocaleString()}. Your verified order total is PKR ${authoritativeTotal.toLocaleString()}.`
            });
        }

        // 7. Calculate loyalty points (only for authenticated customers)
        let pointsEarned = 0;
        if (user_id && authoritativeTotal >= 2000) {
            pointsEarned = Math.floor(authoritativeTotal / 2000) * 50;
        }

        // 8. Atomic Reservation Transaction (Pending status, physical stock untouched, stock reserved)
        const orderResult = await db.transaction(async (tx) => {
            const finalCustomerName = customer_name ? customer_name.trim() : (req.user ? req.user.name : 'Guest Customer');
            const finalCustomerPhone = customer_phone ? customer_phone.trim() : (req.user ? req.user.phone : 'N/A');

            // A. Insert Order with status 'Pending'
            const orderInsert = await tx.execute(
                `INSERT INTO Orders (user_id, total_price, delivery_address, notes, customer_name, customer_phone, status) VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
                [user_id, authoritativeTotal, delivery_address.trim(), notes ? notes.trim() : '', finalCustomerName, finalCustomerPhone]
            );
            const order_id = orderInsert.lastID;

            // B. Insert Verified Order Items
            for (const vItem of verifiedItems) {
                await tx.execute(
                    `INSERT INTO OrderItems (order_id, product_id, quantity, price, variant_name) VALUES (?, ?, ?, ?, ?)`,
                    [order_id, vItem.product_id, vItem.quantity, vItem.price, vItem.variant_name]
                );
            }

            // C. Concurrency-Safe Stock Reservation: Increment reserved_stock
            // Guard: available stock (stock - reserved_stock) must be >= requested quantity
            for (const pid of uniqueProductIds) {
                const qtyToReserve = totalQtyByProduct[pid];
                const reserveUpdate = await tx.execute(
                    `UPDATE Products 
                     SET reserved_stock = COALESCE(reserved_stock, 0) + ? 
                     WHERE id = ? AND (stock - COALESCE(reserved_stock, 0)) >= ?`,
                    [qtyToReserve, pid, qtyToReserve]
                );
                if (reserveUpdate.changes === 0) {
                    throw new Error(`Concurrency conflict: Insufficient available stock for product ID ${pid}`);
                }
            }

            // D. Note: Loyalty points are recorded with the order, awarded on active status
            if (user_id && pointsEarned > 0) {
                await tx.execute(
                    `UPDATE Users SET points = COALESCE(points, 0) + ? WHERE id = ?`,
                    [pointsEarned, user_id]
                );
            }

            return { order_id };
        });

        res.status(201).json({
            message: "Order placed successfully",
            order_id: orderResult.order_id,
            total_price: authoritativeTotal,
            pointsEarned,
            guest: !user_id
        });

    } catch (err) {
        console.error('Order creation error:', err);
        return res.status(500).json({ error: err.message || "Failed to process order" });
    }
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

// Admin status update: handles deduction on confirmation and restoration on cancellation
app.put('/api/orders/:id/status', verifyToken, isAdmin, async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const { status: newStatus } = req.body;

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({ error: "Invalid order ID" });
        }
        if (!newStatus) {
            return res.status(400).json({ error: "Status is required" });
        }

        const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(newStatus)) {
            return res.status(400).json({ error: `Invalid status "${newStatus}". Must be one of: ${validStatuses.join(', ')}` });
        }

        const order = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM Orders WHERE id = ?`, [orderId], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });

        if (!order) return res.status(404).json({ error: "Order not found" });
        const prevStatus = order.status;

        if (prevStatus === newStatus) {
            return res.json({ message: "Order status unchanged", status: newStatus });
        }

        // Enforce valid status transition rules
        if (prevStatus === 'Cancelled') {
            return res.status(400).json({ error: "Cancelled orders cannot be reopened or transitioned." });
        }
        if (prevStatus === 'Delivered') {
            if (newStatus === 'Cancelled') {
                return res.status(400).json({ error: "Delivered orders cannot be cancelled directly without an explicit return workflow." });
            }
            if (newStatus === 'Pending') {
                return res.status(400).json({ error: "Delivered orders cannot be moved back to Pending." });
            }
        }

        // Fetch order items for inventory adjustment
        const items = await new Promise((resolve, reject) => {
            db.all(`SELECT product_id, quantity FROM OrderItems WHERE order_id = ?`, [orderId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows || []);
            });
        });

        // Execute atomic state transition
        await db.transaction(async (tx) => {
            // Update order status
            await tx.execute(`UPDATE Orders SET status = ? WHERE id = ?`, [newStatus, orderId]);

            // CASE 1: Pending -> Confirmed (Physical stock deducted, reservation released)
            if (prevStatus === 'Pending' && newStatus === 'Confirmed') {
                for (const item of items) {
                    if (item.product_id && item.quantity > 0) {
                        const stockDeduct = await tx.execute(
                            `UPDATE Products 
                             SET stock = stock - ?, 
                                 reserved_stock = MAX(0, COALESCE(reserved_stock, 0) - ?) 
                             WHERE id = ? AND stock >= ?`,
                            [item.quantity, item.quantity, item.product_id, item.quantity]
                        );
                        if (stockDeduct.changes === 0) {
                            throw new Error(`Insufficient physical stock for product ID ${item.product_id} to confirm order.`);
                        }
                    }
                }
            }

            // CASE 2: Pending -> Cancelled (Release reservation only; physical stock untouched)
            else if (prevStatus === 'Pending' && newStatus === 'Cancelled') {
                for (const item of items) {
                    if (item.product_id && item.quantity > 0) {
                        await tx.execute(
                            `UPDATE Products 
                             SET reserved_stock = MAX(0, COALESCE(reserved_stock, 0) - ?) 
                             WHERE id = ?`,
                            [item.quantity, item.product_id]
                        );
                    }
                }
                const points = order.total_price >= 2000 ? Math.floor(order.total_price / 2000) * 50 : 0;
                if (order.user_id && points > 0) {
                    await tx.execute(
                        `UPDATE Users SET points = MAX(0, COALESCE(points, 0) - ?) WHERE id = ?`,
                        [points, order.user_id]
                    );
                }
            }

            // CASE 3: Active confirmed order cancelled (Confirmed/Processing/Out for Delivery -> Cancelled)
            // Physical stock was already deducted on confirmation, so restore physical stock!
            else if (['Confirmed', 'Processing', 'Out for Delivery'].includes(prevStatus) && newStatus === 'Cancelled') {
                for (const item of items) {
                    if (item.product_id && item.quantity > 0) {
                        await tx.execute(
                            `UPDATE Products SET stock = stock + ? WHERE id = ?`,
                            [item.quantity, item.product_id]
                        );
                    }
                }
                const points = order.total_price >= 2000 ? Math.floor(order.total_price / 2000) * 50 : 0;
                if (order.user_id && points > 0) {
                    await tx.execute(
                        `UPDATE Users SET points = MAX(0, COALESCE(points, 0) - ?) WHERE id = ?`,
                        [points, order.user_id]
                    );
                }
            }
            // For other valid transitions (e.g. Confirmed -> Out for Delivery -> Delivered):
            // Physical stock was already deducted at confirmation, so no stock changes needed.
        });

        res.json({ message: "Order status updated successfully", status: newStatus });
    } catch (err) {
        console.error('Admin status update error:', err);
        res.status(500).json({ error: err.message || "Failed to update order status" });
    }
});

// Customer cancel pending order
app.put('/api/orders/:id/cancel', verifyToken, async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({ error: "Invalid order ID" });
        }

        const order = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM Orders WHERE id = ? AND user_id = ?`, [orderId, req.user.id], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });

        if (!order) return res.status(404).json({ error: "Order not found" });
        if (order.status !== 'Pending') {
            return res.status(400).json({ error: "Only Pending orders can be cancelled directly. Please contact Aqib on WhatsApp." });
        }

        const items = await new Promise((resolve, reject) => {
            db.all(`SELECT product_id, quantity FROM OrderItems WHERE order_id = ?`, [orderId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows || []);
            });
        });

        // Atomic transaction: status Pending -> Cancelled, release reservation
        await db.transaction(async (tx) => {
            const updateRes = await tx.execute(
                `UPDATE Orders SET status = 'Cancelled' WHERE id = ? AND status = 'Pending'`,
                [orderId]
            );
            if (updateRes.changes === 0) {
                throw new Error("Order was already cancelled or updated.");
            }

            // Release reserved stock
            for (const item of items) {
                if (item.product_id && item.quantity > 0) {
                    await tx.execute(
                        `UPDATE Products 
                         SET reserved_stock = MAX(0, COALESCE(reserved_stock, 0) - ?) 
                         WHERE id = ?`,
                        [item.quantity, item.product_id]
                    );
                }
            }

            // Revert loyalty points if awarded
            const pointsAwarded = order.total_price >= 2000 ? Math.floor(order.total_price / 2000) * 50 : 0;
            if (order.user_id && pointsAwarded > 0) {
                await tx.execute(
                    `UPDATE Users SET points = MAX(0, COALESCE(points, 0) - ?) WHERE id = ?`,
                    [pointsAwarded, order.user_id]
                );
            }
        });

        res.json({ message: "Order cancelled successfully, stock reservation released" });
    } catch (err) {
        console.error('Customer order cancellation error:', err);
        res.status(500).json({ error: err.message || "Failed to cancel order" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (0.0.0.0)`);
});
