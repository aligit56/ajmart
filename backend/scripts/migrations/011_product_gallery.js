const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '011_product_gallery.js';
const migrationsLogPath = path.resolve(__dirname, 'migrations.log');
const dbPath = path.resolve(__dirname, '../../database.sqlite');

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

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

const pulseHandImages = {
  'Dall Chana': '/images/products/pulses/dall-chana-hand.jpg',
  'Lobia Kapsool': '/images/products/pulses/lobia-kapsool-hand.jpg',
  'Dall Mong': '/images/products/pulses/dall-mong-hand.jpg',
  'Dall Masar': '/images/products/pulses/dall-masar-hand.jpg',
  'Mota Chana': '/images/products/pulses/mota-chana-hand.jpg',
  'Kala Masar': '/images/products/pulses/kala-masar-hand.jpg',
  'Kala Mash': '/images/products/pulses/kala-mash-hand.jpg',
  'Chana Bareek': '/images/products/pulses/chana-bareek-hand.jpg',
  'Mong Sabit': '/images/products/pulses/mong-sabit-hand.jpg',
  'Dall Mash': '/images/products/pulses/dall-mash-hand.jpg',
  'Kala Chana': '/images/products/pulses/kala-chana-hand.jpg',
  'Mong Chilka Dall': '/images/products/pulses/mong-chilka-dall-hand.jpg',
  'Lobia Chitri Red': '/images/products/pulses/lobia-chitri-red-hand.jpg',
  'Lobia Desi Bareek': '/images/products/pulses/lobia-desi-bareek-hand.jpg'
};

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);

  // 1. Create product_images table if it doesn't exist
  await runQuery(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES Products(id),
      image_url TEXT NOT NULL,
      image_type TEXT NOT NULL CHECK (image_type IN ('main','hand','bag','other')),
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(product_id, image_type)
    );
  `);
  console.log('✓ product_images table created or already exists.');

  // 2. Copy existing products.image_url into product_images as 'main' if not already present
  const allProducts = await allQuery(`SELECT id, name, image_url, category_id FROM Products`);
  let initialMainCount = 0;

  for (const prod of allProducts) {
    if (prod.image_url && prod.image_url.trim()) {
      const existing = await allQuery(`SELECT id FROM product_images WHERE product_id = ? AND image_type = 'main'`, [prod.id]);
      if (existing.length === 0) {
        await runQuery(
          `INSERT INTO product_images (product_id, image_url, image_type, sort_order) VALUES (?, ?, 'main', 0)`,
          [prod.id, prod.image_url.trim()]
        );
        initialMainCount++;
      }
    }
  }
  console.log(`✓ Copied ${initialMainCount} existing product images into product_images as 'main'.`);

  // 3. For Pulses products, insert hand photo as 'hand' (sort_order = 0)
  // And adjust 'main' sort_order to 2 if present
  let handCount = 0;
  for (const [prodName, handPath] of Object.entries(pulseHandImages)) {
    const prod = allProducts.find(p => p.name === prodName);
    if (!prod) {
      console.warn(`Product ${prodName} not found in database.`);
      continue;
    }

    // Insert or update 'hand' image
    await runQuery(`
      INSERT INTO product_images (product_id, image_url, image_type, sort_order)
      VALUES (?, ?, 'hand', 0)
      ON CONFLICT(product_id, image_type) DO UPDATE SET
        image_url = excluded.image_url,
        sort_order = excluded.sort_order
    `, [prod.id, handPath]);

    // Update 'main' sort_order to 2 so hand (0) and bag (1) take priority
    await runQuery(`
      UPDATE product_images SET sort_order = 2 WHERE product_id = ? AND image_type = 'main'
    `, [prod.id]);

    // Backward compatibility: set products.image_url to hand image
    await runQuery(`
      UPDATE Products SET image_url = ? WHERE id = ?
    `, [handPath, prod.id]);

    handCount++;
  }
  console.log(`✓ Seeded ${handCount} Pulses hand images with sort_order 0.`);

  // 4. Record migration in migrations.log
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logEntry = `\n[${now}] ${migrationName} - APPLIED - Created product_images table, populated main images for all products, seeded Pulses hand images with sort_order 0, and updated Products.image_url for backward compatibility.`;
  fs.appendFileSync(migrationsLogPath, logEntry, 'utf8');
  console.log(`✓ Recorded in ${migrationsLogPath}`);

  db.close((err) => {
    if (err) console.error('Error closing DB:', err.message);
    else console.log('Migration completed successfully.');
  });
}

runMigration().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
