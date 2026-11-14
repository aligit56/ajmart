const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '012_import_local_products_images.js';
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

const localImageMappings = [
  {
    id: 90,
    name: 'Surf Aj.',
    category: 'Cleaning and Laundry',
    categorySlug: 'cleaning-and-laundry',
    filename: 'surf-aj.jpg',
    imageUrl: '/images/products/cleaning-and-laundry/surf-aj.jpg',
    brand: 'AJ Brand'
  },
  {
    id: 97,
    name: 'Aj Dish Washer',
    category: 'Household',
    categorySlug: 'household',
    filename: 'aj-dish-washer.jpg',
    imageUrl: '/images/products/household/aj-dish-washer.jpg',
    brand: 'AJ Brand'
  },
  {
    id: 129,
    name: 'Aj Macroni',
    category: 'Noodle and Macaronis',
    categorySlug: 'noodle-and-macaronis',
    filename: 'aj-macaroni.jpg',
    imageUrl: '/images/products/noodle-and-macaronis/aj-macaroni.jpg',
    brand: 'AJ Brand'
  },
  {
    id: 134,
    name: 'Colourful Vermicelli',
    category: 'Noodle and Macaronis',
    categorySlug: 'noodle-and-macaronis',
    filename: 'golden-colourful-vermicelli.jpg',
    imageUrl: '/images/products/noodle-and-macaronis/golden-colourful-vermicelli.jpg',
    brand: 'Golden'
  },
  {
    id: 75,
    name: 'Methi',
    category: 'Everyday Grocery',
    categorySlug: 'everyday-grocery',
    filename: 'mehran-kasuri-methi.jpg',
    imageUrl: '/images/products/everyday-grocery/mehran-kasuri-methi.jpg',
    brand: 'Mehran'
  },
  {
    id: 72,
    name: 'Talbina',
    category: 'Everyday Grocery',
    categorySlug: 'everyday-grocery',
    filename: 'ajwa-talbina.jpg',
    imageUrl: '/images/products/everyday-grocery/ajwa-talbina.jpg',
    brand: 'Ajwa Food'
  },
  {
    id: 85,
    name: 'Khulli Pati 1kg',
    category: 'Tea or Coffee',
    categorySlug: 'tea-or-coffee',
    filename: 'khulli-pati-1kg.jpg',
    imageUrl: '/images/products/tea-or-coffee/khulli-pati-1kg.jpg',
    brand: 'AJ Brand'
  },
  {
    id: 47,
    name: 'Oil Bottle 5L',
    category: 'Oil and Ghee',
    categorySlug: 'oil-and-ghee',
    filename: 'shahtaj-oil-bottle.jpg',
    imageUrl: '/images/products/oil-and-ghee/shahtaj-oil-bottle.jpg',
    brand: 'Shahtaj'
  },
  {
    id: 48,
    name: 'Oil Bottle 3L',
    category: 'Oil and Ghee',
    categorySlug: 'oil-and-ghee',
    filename: 'shahtaj-oil-bottle.jpg',
    imageUrl: '/images/products/oil-and-ghee/shahtaj-oil-bottle.jpg',
    brand: 'Shahtaj'
  }
];

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);

  // 1. Update database Products and product_images table
  let updatedCount = 0;
  for (const item of localImageMappings) {
    // Update Products table
    await runQuery(`
      UPDATE Products
      SET image_url = ?, brand = COALESCE(?, brand)
      WHERE id = ?
    `, [item.imageUrl, item.brand, item.id]);

    // Update product_images table
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

  // 2. Update backend/data/product_images_template.csv
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
      const match = localImageMappings.find(m => m.id === id);

      if (match) {
        // Format: id,product_name,category,brand,image_file_name
        const relPath = `${match.categorySlug}/${match.filename}`;
        parts[3] = match.brand || parts[3];
        parts[4] = relPath;
        newLines.push(parts.join(','));
      } else if (id === 22) {
        // Malka Sabit Masar
        parts[4] = 'pulses/malka-sabit-masar-hand.jpg';
        newLines.push(parts.join(','));
      } else {
        newLines.push(line);
      }
    }
    fs.writeFileSync(csvTemplatePath, newLines.join('\n'), 'utf8');
    console.log(`✓ Updated ${csvTemplatePath}`);
  }

  // 3. Update backend/data/product_images_manifest.csv
  if (fs.existsSync(manifestPath)) {
    const existingManifest = fs.readFileSync(manifestPath, 'utf8');
    const manifestAdditions = [];

    for (const item of localImageMappings) {
      const relPath = `${item.categorySlug}/${item.filename}`;
      const fullPath = path.resolve(__dirname, '../../public/images/products', relPath);
      if (fs.existsSync(fullPath) && !existingManifest.includes(relPath)) {
        const sz = (fs.statSync(fullPath).size / 1024).toFixed(1);
        manifestAdditions.push(`${item.category},${item.id},${item.name},Standard,${relPath},800x800,${sz},user_provided,local photo standardized,OK\n`);
      }
    }

    if (manifestAdditions.length > 0) {
      fs.appendFileSync(manifestPath, manifestAdditions.join(''), 'utf8');
      console.log(`✓ Added ${manifestAdditions.length} rows to ${manifestPath}`);
    }
  }

  // 4. Record migration in migrations.log
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logEntry = `\n[${now}] ${migrationName} - APPLIED - Imported and standardized 8 user-provided images for 9 local products (Surf Aj, Aj Dish Washer, Aj Macroni, Colourful Vermicelli, Kasuri Methi, Talbina, Khulli Pati, and Shahtaj Oil Bottle 5L/3L).`;
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
