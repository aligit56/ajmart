const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '002_store_layout.js';
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

async function runMigration() {
  try {
    console.log(`Starting migration: ${migrationName}...`);

    await runQuery('BEGIN TRANSACTION');

    // 2. Create hero_slides table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        media_type TEXT NOT NULL,
        media_url TEXT NOT NULL,
        title TEXT NOT NULL,
        subtitle TEXT,
        button_text TEXT,
        button_link TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Create featured_videos table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS featured_videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        video_url TEXT,
        thumbnail_url TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Create settings table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    // 5. Add is_featured column to Products table if missing
    const productCols = await allQuery('PRAGMA table_info(Products)');
    const hasIsFeatured = productCols.some((col) => col.name === 'is_featured');
    if (!hasIsFeatured) {
      await runQuery('ALTER TABLE Products ADD COLUMN is_featured INTEGER DEFAULT 0');
      console.log('Added is_featured column to Products table.');
    }

    // 6. Seed placeholder hero_slides if table is empty
    const slideCount = await getQuery('SELECT COUNT(*) as count FROM hero_slides');
    if (slideCount.count === 0) {
      const slides = [
        ['image', '/images/hero/placeholder-1.jpg', 'Welcome to AJTraders', 'Quality groceries delivered next day', 'Shop Now', '/products', 1, 1],
        ['image', '/images/hero/placeholder-2.jpg', 'Fresh Stock Every Week', 'Pulses, rice, oil and more', 'See Categories', '/categories', 2, 1],
        ['video', '/videos/hero/placeholder.mp4', 'See Our Products', 'Watch before you order', 'Explore', '/products', 3, 1]
      ];
      for (const s of slides) {
        await runQuery(
          `INSERT INTO hero_slides (media_type, media_url, title, subtitle, button_text, button_link, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          s
        );
      }
      console.log('Seeded 3 placeholder hero slides.');
    }

    // 7. Seed placeholder featured_videos if table is empty
    const videoCount = await getQuery('SELECT COUNT(*) as count FROM featured_videos');
    if (videoCount.count === 0) {
      const videos = [
        ['Product Video 1', '', '/images/categories/grocery.WEBP', 1, 1],
        ['Product Video 2', '', '/images/categories/cookingoil.WEBP', 2, 1],
        ['Product Video 3', '', '/images/categories/pulses.webp', 3, 1]
      ];
      for (const v of videos) {
        await runQuery(
          `INSERT INTO featured_videos (title, video_url, thumbnail_url, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?)`,
          v
        );
      }
      console.log('Seeded 3 placeholder featured videos.');
    }

    // 8. Seed default settings (INSERT OR IGNORE)
    const defaultSettings = [
      ['whatsapp_number', '923001234567'],
      ['phone', '0300-0000000'],
      ['email', 'info@ajtraders.pk'],
      ['address', 'Placeholder address, Rawalpindi'],
      ['opening_hours', 'Mon-Sun, 9 AM - 10 PM'],
      ['facebook_url', ''],
      ['instagram_url', ''],
      ['about_years', '10'],
      ['about_products', '50+'],
      ['about_customers', '500+']
    ];
    for (const [key, val] of defaultSettings) {
      await runQuery('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [key, val]);
    }
    console.log('Seeded default settings.');

    // 9. Flag some popular products as is_featured if none are featured
    const featuredCount = await getQuery('SELECT COUNT(*) as count FROM Products WHERE is_featured = 1');
    if (featuredCount.count === 0) {
      const popularNames = [
        'Dall Chana',
        'Kainaat 1121 Special',
        'Dalda Oil 1kg',
        'Tapal Tea 1kg',
        'Golden Pearl Romance Body Spray',
        'Golden Pearl Beauty Cream',
        'Tibet Snow Cream',
        'Knorr Family Pack'
      ];
      for (const name of popularNames) {
        await runQuery('UPDATE Products SET is_featured = 1 WHERE name = ?', [name]);
      }
      console.log('Marked 8 initial popular products as is_featured = 1.');
    }

    // 10. Seed active sample discounts if Discounts is empty
    const discountCount = await getQuery('SELECT COUNT(*) as count FROM Discounts');
    if (discountCount.count === 0) {
      const sampleDiscounts = [
        ['Dalda Oil 1kg', 10],
        ['Knorr Family Pack', 15],
        ['Golden Pearl Romance Body Spray', 20],
        ['Tapal Tea 1kg', 10]
      ];
      for (const [pName, pct] of sampleDiscounts) {
        const prod = await getQuery('SELECT id FROM Products WHERE name = ?', [pName]);
        if (prod) {
          await runQuery(
            `INSERT INTO Discounts (product_id, discount_percent, valid_until)
             VALUES (?, ?, datetime('now', '+365 days'))`,
            [prod.id, pct]
          );
        }
      }
      console.log('Seeded sample active discounts.');
    }

    await runQuery('COMMIT');

    // 11. Append entry to migrations.log
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logEntry = `[${timestamp}] ${migrationName} - APPLIED - Created hero_slides, featured_videos, settings, and added products.is_featured\n`;
    fs.appendFileSync(migrationsLogPath, logEntry, 'utf8');

    console.log(`✓ Migration ${migrationName} successfully applied and recorded.`);
    db.close();
  } catch (err) {
    await runQuery('ROLLBACK');
    console.error('❌ Migration failed:', err.message);
    db.close();
    process.exit(1);
  }
}

runMigration();
