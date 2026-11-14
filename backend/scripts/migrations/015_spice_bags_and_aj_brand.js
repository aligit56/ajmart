const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '015_spice_bags_and_aj_brand.js';
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

const spiceMappings = [
  {
    id: 49,
    name: 'Haldi 200gm',
    category: 'Spices',
    categorySlug: 'spices',
    brand: 'AJ Brand',
    bagFilename: 'haldi-200g-bag.png',
    bagUrl: '/images/products/spices/haldi-200g-bag.png'
  },
  {
    id: 50,
    name: 'Lal Mirch 200gm',
    category: 'Spices',
    categorySlug: 'spices',
    brand: 'AJ Brand',
    bagFilename: 'lal-mirch-200g-bag.png',
    bagUrl: '/images/products/spices/lal-mirch-200g-bag.png'
  },
  {
    id: 51,
    name: 'Dara Mirch 200gm',
    category: 'Spices',
    categorySlug: 'spices',
    brand: 'AJ Brand',
    bagFilename: 'dara-mirch-200g-bag.png',
    bagUrl: '/images/products/spices/dara-mirch-200g-bag.png'
  },
  {
    id: 52,
    name: 'Salan Masala 100gm',
    category: 'Spices',
    categorySlug: 'spices',
    brand: 'AJ Brand',
    bagFilename: 'salan-masala-100g-bag.png',
    bagUrl: '/images/products/spices/salan-masala-100g-bag.png'
  },
  {
    id: 169,
    name: 'Dhaniya Powder 200gm',
    category: 'Spices',
    categorySlug: 'spices',
    brand: 'AJ Brand',
    bagFilename: 'dhaniya-powder-200g-bag.png',
    bagUrl: '/images/products/spices/dhaniya-powder-200g-bag.png'
  }
];

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);

  let updatedCount = 0;
  for (const item of spiceMappings) {
    // 1. Update brand to 'AJ Brand' in Products table
    await runQuery(`
      UPDATE Products
      SET brand = ?
      WHERE id = ?
    `, [item.brand, item.id]);

    // 2. Upsert 'bag' image in product_images table with sort_order 1
    await runQuery(`
      INSERT INTO product_images (product_id, image_url, image_type, sort_order)
      VALUES (?, ?, 'bag', 1)
      ON CONFLICT(product_id, image_type) DO UPDATE SET
        image_url = excluded.image_url,
        sort_order = 1
    `, [item.id, item.bagUrl]);

    updatedCount++;
    console.log(`✓ Updated Product ID ${item.id} (${item.name}) -> Brand: ${item.brand}, Bag: ${item.bagUrl}`);
  }

  // 3. Update backend/data/product_images_template.csv brand column
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
      const match = spiceMappings.find(m => m.id === id);

      if (match) {
        parts[3] = match.brand;
        newLines.push(parts.join(','));
      } else {
        newLines.push(line);
      }
    }
    fs.writeFileSync(csvTemplatePath, newLines.join('\n'), 'utf8');
    console.log(`✓ Updated ${csvTemplatePath}`);
  }

  // 4. Update backend/data/product_images_manifest.csv
  if (fs.existsSync(manifestPath)) {
    const existingManifest = fs.readFileSync(manifestPath, 'utf8');
    const manifestAdditions = [];

    for (const item of spiceMappings) {
      const relPath = `${item.categorySlug}/${item.bagFilename}`;
      const fullPath = path.resolve(__dirname, '../../public/images/products', relPath);
      if (fs.existsSync(fullPath) && !existingManifest.includes(relPath)) {
        const sz = (fs.statSync(fullPath).size / 1024).toFixed(1);
        manifestAdditions.push(`${item.category},${item.id},${item.name},Bag Image,${relPath},1000x1000,${sz},generated_pouch,AJ Brand professional transparent bag,OK\n`);
      }
    }

    if (manifestAdditions.length > 0) {
      fs.appendFileSync(manifestPath, manifestAdditions.join(''), 'utf8');
      console.log(`✓ Added ${manifestAdditions.length} rows to ${manifestPath}`);
    }
  }

  // 5. Record migration in migrations.log
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logEntry = `\n[${now}] ${migrationName} - APPLIED - Updated brand to 'AJ Brand' and generated/linked professional clear pouch bag images (1000x1000 transparent PNG) with pure spice fills for 5 Spices products (Haldi, Lal Mirch, Dara Mirch, Salan Masala, Dhaniya Powder).`;
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
