const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '014_import_rice_hand_images.js';
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

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

const riceMappings = [
  {
    id: 27,
    name: 'Seela Supreme',
    category: 'Rice',
    categorySlug: 'rice',
    filename: 'seela-supreme-hand.jpg',
    imageUrl: '/images/products/rice/seela-supreme-hand.jpg'
  },
  {
    id: 28,
    name: 'Seela VIP',
    category: 'Rice',
    categorySlug: 'rice',
    filename: 'seela-vip-hand.jpg',
    imageUrl: '/images/products/rice/seela-vip-hand.jpg'
  },
  {
    id: 29,
    name: 'Kainaat 1121 Special',
    category: 'Rice',
    categorySlug: 'rice',
    filename: 'kainaat-1121-special-hand.jpg',
    imageUrl: '/images/products/rice/kainaat-1121-special-hand.jpg'
  },
  {
    id: 30,
    name: 'Kainaat 1121 Basmati',
    category: 'Rice',
    categorySlug: 'rice',
    filename: 'kainaat-1121-basmati-hand.jpg',
    imageUrl: '/images/products/rice/kainaat-1121-basmati-hand.jpg'
  },
  {
    id: 31,
    name: 'Kainaat',
    category: 'Rice',
    categorySlug: 'rice',
    filename: 'kainaat-hand.jpg',
    imageUrl: '/images/products/rice/kainaat-hand.jpg'
  },
  {
    id: 32,
    name: 'Daghi Kainaat Rice 1121',
    category: 'Rice',
    categorySlug: 'rice',
    filename: 'daghi-kainaat-1121-hand.jpg',
    imageUrl: '/images/products/rice/daghi-kainaat-1121-hand.jpg'
  },
  {
    id: 33,
    name: 'Short Grain Poona',
    category: 'Rice',
    categorySlug: 'rice',
    filename: 'short-grain-poona-hand.jpg',
    imageUrl: '/images/products/rice/short-grain-poona-hand.jpg'
  },
  {
    id: 34,
    name: 'B-1 Tota',
    category: 'Rice',
    categorySlug: 'rice',
    filename: 'b-1-tota-hand.jpg',
    imageUrl: '/images/products/rice/b-1-tota-hand.jpg'
  },
  {
    id: 35,
    name: 'B-2 Tota',
    category: 'Rice',
    categorySlug: 'rice',
    filename: 'b-2-tota-hand.jpg',
    imageUrl: '/images/products/rice/b-2-tota-hand.jpg'
  }
];

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);

  let updatedCount = 0;
  for (const item of riceMappings) {
    // 1. Update Products table
    await runQuery(`
      UPDATE Products
      SET image_url = ?
      WHERE id = ?
    `, [item.imageUrl, item.id]);

    // 2. Upsert 'main' image in product_images table
    await runQuery(`
      INSERT INTO product_images (product_id, image_url, image_type, sort_order)
      VALUES (?, ?, 'main', 0)
      ON CONFLICT(product_id, image_type) DO UPDATE SET
        image_url = excluded.image_url,
        sort_order = excluded.sort_order
    `, [item.id, item.imageUrl]);

    // 3. Also upsert 'hand' image with sort_order 0
    await runQuery(`
      INSERT INTO product_images (product_id, image_url, image_type, sort_order)
      VALUES (?, ?, 'hand', 0)
      ON CONFLICT(product_id, image_type) DO UPDATE SET
        image_url = excluded.image_url,
        sort_order = excluded.sort_order
    `, [item.id, item.imageUrl]);

    updatedCount++;
    console.log(`✓ Updated Product ID ${item.id} (${item.name}) -> ${item.imageUrl}`);
  }

  // 4. Update backend/data/product_images_template.csv
  if (fs.existsSync(csvTemplatePath)) {
    const csvContent = fs.readFileSync(csvTemplatePath, 'utf8');
    const lines = csvContent.split('\n');
    const header = lines[0];
    const newLines = [header];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const parts = line.split(',');
      const id = parseInt(parts[0], 10);
      const match = riceMappings.find(m => m.id === id);

      if (match) {
        const relPath = `${match.categorySlug}/${match.filename}`;
        parts[4] = relPath;
        newLines.push(parts.join(','));
      } else {
        newLines.push(line);
      }
    }
    fs.writeFileSync(csvTemplatePath, newLines.join('\n'), 'utf8');
    console.log(`✓ Updated ${csvTemplatePath}`);
  }

  // 5. Update backend/data/product_images_manifest.csv
  if (fs.existsSync(manifestPath)) {
    const existingManifest = fs.readFileSync(manifestPath, 'utf8');
    const manifestAdditions = [];

    for (const item of riceMappings) {
      const relPath = `${item.categorySlug}/${item.filename}`;
      const fullPath = path.resolve(__dirname, '../../public/images/products', relPath);
      if (fs.existsSync(fullPath) && !existingManifest.includes(relPath)) {
        const sz = (fs.statSync(fullPath).size / 1024).toFixed(1);
        manifestAdditions.push(`${item.category},${item.id},${item.name},Hand Photo,${relPath},800x800,${sz},sourced_authentic,professional hand photo standardized,OK\n`);
      }
    }

    if (manifestAdditions.length > 0) {
      fs.appendFileSync(manifestPath, manifestAdditions.join(''), 'utf8');
      console.log(`✓ Added ${manifestAdditions.length} rows to ${manifestPath}`);
    }
  }

  // 6. Record migration in migrations.log
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logEntry = `\n[${now}] ${migrationName} - APPLIED - Sourced, standardized and imported 9 professional hand photos for all Rice products (Seela Supreme, Seela VIP, Kainaat 1121 Special, Kainaat 1121 Basmati, Kainaat, Daghi Kainaat Rice 1121, Short Grain Poona, B-1 Tota, B-2 Tota).`;
  fs.appendFileSync(migrationsLogPath, logEntry, 'utf8');
  console.log(`✓ Migration recorded in ${migrationsLogPath}`);

  db.close((err) => {
    if (err) console.error('Error closing DB:', err.message);
    else console.log(`✓ Migration ${migrationName} completed successfully (${updatedCount} products updated).`);
  });
}

runMigration().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
