const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '013_import_spices_and_remaining_products.js';
const migrationsLogPath = path.resolve(__dirname, 'migrations.log');
const dbPath = path.resolve(__dirname, '../../database.sqlite');
const csvTemplatePath = path.resolve(__dirname, '../../data/product_images_template.csv');
const manifestPath = path.resolve(__dirname, '../../data/product_images_manifest.csv');

// 1. Check migrations.log to ensure idempotency
if (fs.existsSync(migrationsLogPath)) {
  const logContent = fs.readFileSync(migrationsLogPath, 'utf8');
  if (logContent.includes(`${migrationName} - APPLIED`)) {
    console.log(`✓ Migration ${migrationName} has already been applied, skipping.`);
    process.exit(0);
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to open database:', err.message);
    process.exit(1);
  }
});

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

const existingProductUpdates = [
  {
    id: 49,
    name: 'Haldi 200gm',
    category: 'Spices',
    categorySlug: 'spices',
    filename: 'khan-haldi-200g.jpg',
    imageUrl: '/images/products/spices/khan-haldi-200g.jpg',
    brand: 'Khan Spices',
    sourceType: 'user_provided'
  },
  {
    id: 50,
    name: 'Lal Mirch 200gm',
    category: 'Spices',
    categorySlug: 'spices',
    filename: 'khan-lal-mirch-200g.jpg',
    imageUrl: '/images/products/spices/khan-lal-mirch-200g.jpg',
    brand: 'Khan Spices',
    sourceType: 'user_provided'
  },
  {
    id: 51,
    name: 'Dara Mirch 200gm',
    category: 'Spices',
    categorySlug: 'spices',
    filename: 'khan-dara-mirch-200g.jpg',
    imageUrl: '/images/products/spices/khan-dara-mirch-200g.jpg',
    brand: 'Khan Spices',
    sourceType: 'user_provided'
  },
  {
    id: 52,
    name: 'Salan Masala 100gm',
    category: 'Spices',
    categorySlug: 'spices',
    filename: 'khan-salan-masala-100g.jpg',
    imageUrl: '/images/products/spices/khan-salan-masala-100g.jpg',
    brand: 'Khan Spices',
    sourceType: 'user_provided'
  },
  {
    id: 124,
    name: 'Laar Soap',
    category: 'Personal Care',
    categorySlug: 'personal-care',
    filename: 'laar-soap.jpg',
    imageUrl: '/images/products/personal-care/laar-soap.jpg',
    brand: 'Laar',
    sourceType: 'web_sourced'
  },
  {
    id: 125,
    name: 'Door Soap',
    category: 'Personal Care',
    categorySlug: 'personal-care',
    filename: 'door-soap.jpg',
    imageUrl: '/images/products/personal-care/door-soap.jpg',
    brand: 'Door',
    sourceType: 'web_sourced'
  },
  {
    id: 73,
    name: 'Oat Meal',
    category: 'Everyday Grocery',
    categorySlug: 'everyday-grocery',
    filename: 'oat-meal.jpg',
    imageUrl: '/images/products/everyday-grocery/oat-meal.jpg',
    brand: 'AJ Brand',
    sourceType: 'web_sourced'
  },
  {
    id: 99,
    name: 'Spiral',
    category: 'Household',
    categorySlug: 'household',
    filename: 'spiral.jpg',
    imageUrl: '/images/products/household/spiral.jpg',
    brand: 'AJ Brand',
    sourceType: 'web_sourced'
  }
];

const newProduct = {
  name: 'Dhaniya Powder 200gm',
  category_id: 4, // Spices
  category: 'Spices',
  categorySlug: 'spices',
  price: 200.0,
  stock: 50,
  brand: 'Khan Spices',
  filename: 'khan-dhaniya-powder-200g.jpg',
  imageUrl: '/images/products/spices/khan-dhaniya-powder-200g.jpg',
  description: 'Pure aromatic coriander powder (200g). Freshly ground from premium dried coriander seeds for a rich, herbal aroma.\n\nخالص دھنیا پاؤڈر (200 گرام)۔ کھانوں کو خوشبودار اور لذیذ بنانے کے لیے بہترین معیاری دھنیا۔',
  sourceType: 'user_provided'
};

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);

  // 1. Update existing products in database
  let updatedCount = 0;
  for (const item of existingProductUpdates) {
    await runQuery(`
      UPDATE Products
      SET image_url = ?, brand = COALESCE(?, brand)
      WHERE id = ?
    `, [item.imageUrl, item.brand, item.id]);

    await runQuery(`
      INSERT INTO product_images (product_id, image_url, image_type, sort_order)
      VALUES (?, ?, 'main', 0)
      ON CONFLICT(product_id, image_type) DO UPDATE SET
        image_url = excluded.image_url,
        sort_order = excluded.sort_order
    `, [item.id, item.imageUrl]);

    updatedCount++;
    console.log(`✓ Updated Product ID ${item.id} (${item.name}) -> ${item.imageUrl}`);
  }

  // 2. Insert or update new product: Dhaniya Powder 200gm
  let dhaniyaRow = await getQuery(`SELECT id FROM Products WHERE name = ?`, [newProduct.name]);
  let dhaniyaId;

  if (dhaniyaRow) {
    dhaniyaId = dhaniyaRow.id;
    await runQuery(`
      UPDATE Products
      SET category_id = ?, price = ?, stock = ?, brand = ?, image_url = ?, description = ?, is_active = 1
      WHERE id = ?
    `, [
      newProduct.category_id,
      newProduct.price,
      newProduct.stock,
      newProduct.brand,
      newProduct.imageUrl,
      newProduct.description,
      dhaniyaId
    ]);
    console.log(`✓ Updated existing product '${newProduct.name}' (ID ${dhaniyaId})`);
  } else {
    const insertResult = await runQuery(`
      INSERT INTO Products (name, category_id, price, stock, brand, image_url, description, is_active, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0)
    `, [
      newProduct.name,
      newProduct.category_id,
      newProduct.price,
      newProduct.stock,
      newProduct.brand,
      newProduct.imageUrl,
      newProduct.description
    ]);
    dhaniyaId = insertResult.lastID;
    console.log(`✓ Inserted new product '${newProduct.name}' with ID ${dhaniyaId}`);
  }

  // Upsert into product_images for Dhaniya Powder
  await runQuery(`
    INSERT INTO product_images (product_id, image_url, image_type, sort_order)
    VALUES (?, ?, 'main', 0)
    ON CONFLICT(product_id, image_type) DO UPDATE SET
      image_url = excluded.image_url,
      sort_order = excluded.sort_order
  `, [dhaniyaId, newProduct.imageUrl]);

  const allItems = [
    ...existingProductUpdates,
    { ...newProduct, id: dhaniyaId }
  ];

  // 3. Update backend/data/product_images_template.csv
  if (fs.existsSync(csvTemplatePath)) {
    const csvContent = fs.readFileSync(csvTemplatePath, 'utf8');
    const lines = csvContent.split('\n');
    const header = lines[0];
    const newLines = [header];
    let dhaniyaFoundInCsv = false;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const parts = line.split(',');
      const id = parseInt(parts[0], 10);
      const match = allItems.find(m => m.id === id);

      if (match) {
        if (id === dhaniyaId) dhaniyaFoundInCsv = true;
        const relPath = `${match.categorySlug}/${match.filename}`;
        parts[3] = match.brand || parts[3];
        parts[4] = relPath;
        newLines.push(parts.join(','));
      } else {
        newLines.push(line);
      }
    }

    if (!dhaniyaFoundInCsv) {
      newLines.push(`${dhaniyaId},${newProduct.name},${newProduct.category},${newProduct.brand},${newProduct.categorySlug}/${newProduct.filename}`);
    }

    fs.writeFileSync(csvTemplatePath, newLines.join('\n'), 'utf8');
    console.log(`✓ Updated ${csvTemplatePath}`);
  }

  // 4. Update backend/data/product_images_manifest.csv
  if (fs.existsSync(manifestPath)) {
    const existingManifest = fs.readFileSync(manifestPath, 'utf8');
    const manifestAdditions = [];

    for (const item of allItems) {
      const relPath = `${item.categorySlug}/${item.filename}`;
      const fullPath = path.resolve(__dirname, '../../public/images/products', relPath);
      if (fs.existsSync(fullPath) && !existingManifest.includes(relPath)) {
        const sz = (fs.statSync(fullPath).size / 1024).toFixed(1);
        manifestAdditions.push(`${item.category},${item.id},${item.name},Standard,${relPath},800x800,${sz},${item.sourceType},standardized photo,OK\n`);
      }
    }

    if (manifestAdditions.length > 0) {
      fs.appendFileSync(manifestPath, manifestAdditions.join(''), 'utf8');
      console.log(`✓ Added ${manifestAdditions.length} rows to ${manifestPath}`);
    }
  }

  // 5. Record migration in migrations.log
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logEntry = `\n[${now}] ${migrationName} - APPLIED - Imported and standardized 5 spice images (Khan Haldi, Khan Lal Mirch, Khan Dara Mirch, Khan Salan Masala, Khan Dhaniya Powder) with new product card created for Dhaniya Powder 200gm, plus 4 professional images for Laar Soap, Door Soap, Oat Meal, and Spiral.`;
  fs.appendFileSync(migrationsLogPath, logEntry, 'utf8');
  console.log(`✓ Migration recorded in ${migrationsLogPath}`);

  db.close((err) => {
    if (err) console.error('Error closing DB:', err.message);
    else console.log(`✓ Migration ${migrationName} completed successfully (${allItems.length} products total).`);
  });
}

runMigration().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
