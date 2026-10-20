const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '004_import_cleaning_household_grocery_images.js';
const migrationsLogPath = path.resolve(__dirname, 'migrations.log');
const dbPath = path.resolve(__dirname, '../../database.sqlite');
const csvPath = path.resolve(__dirname, '../../data/product_images_template.csv');

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

// 17 Product mappings across 3 categories
const mappings = [
  // Cleaning and Laundry
  {
    id: 93,
    name: 'Bahu Soap Cloth',
    folder: 'products (cleaning)',
    srcFile: 'bahu soap cloth.jfif',
    cleanFile: 'bahu-soap-cloth.jfif'
  },
  {
    id: 88,
    name: 'Bonus',
    folder: 'products (cleaning)',
    srcFile: 'Bonus-Tristar-01.jpg',
    cleanFile: 'bonus-tristar-01.jpg'
  },
  {
    id: 86,
    name: 'Brite',
    folder: 'products (cleaning)',
    srcFile: 'Brite-Maximum-Power-1-1.jpg',
    cleanFile: 'brite-maximum-power-1-1.jpg'
  },
  {
    id: 87,
    name: 'Express',
    folder: 'products (cleaning)',
    srcFile: 'express.jpeg',
    cleanFile: 'express.jpeg'
  },
  {
    id: 89,
    name: 'Sufi Detergent',
    folder: 'products (cleaning)',
    srcFile: 'sufi.jfif',
    cleanFile: 'sufi-detergent.jfif'
  },
  {
    id: 91,
    name: 'Sufi Soap Cloth',
    folder: 'products (cleaning)',
    srcFile: 'sufi soap.jpg',
    cleanFile: 'sufi-soap-cloth.jpg'
  },
  {
    id: 92,
    name: 'Sufi Vermicelli Cloth Soap',
    folder: 'products (cleaning)',
    srcFile: 'Sufi Vermicelli Cloth Soap.jfif',
    cleanFile: 'sufi-vermicelli-cloth-soap.jfif'
  },

  // Household
  {
    id: 103,
    name: 'Max 105',
    folder: 'products (Household)',
    srcFile: 'max 105jpg.jpg',
    cleanFile: 'max-105.jpg'
  },
  {
    id: 101,
    name: 'Max 35',
    folder: 'products (Household)',
    srcFile: 'max 35.jpg',
    cleanFile: 'max-35.jpg'
  },
  {
    id: 94,
    name: 'Max Liquid',
    folder: 'products (Household)',
    srcFile: 'max liquid.jpg',
    cleanFile: 'max-liquid.jpg'
  },
  {
    id: 100,
    name: 'Max Long Bar',
    folder: 'products (Household)',
    srcFile: 'max longbar.jpg',
    cleanFile: 'max-longbar.jpg'
  },
  {
    id: 104,
    name: 'Max Longbar Double',
    folder: 'products (Household)',
    srcFile: 'max longbar double.jpg',
    cleanFile: 'max-longbar-double.jpg'
  },
  {
    id: 95,
    name: 'Max Paste',
    folder: 'products (Household)',
    srcFile: 'max paste.jpg',
    cleanFile: 'max-paste.jpg'
  },
  {
    id: 96,
    name: 'Safoon Dish Wash',
    folder: 'products (Household)',
    srcFile: 'safoon dishwash.jpeg',
    cleanFile: 'safoon-dishwash.jpeg'
  },
  {
    id: 105,
    name: 'Safoon Longbar',
    folder: 'products (Household)',
    srcFile: 'safoon longbar.webp',
    cleanFile: 'safoon-longbar.webp'
  },
  {
    id: 98,
    name: 'Scotch Brite',
    folder: 'products (Household)',
    srcFile: 'scoth brite.jfif',
    cleanFile: 'scotch-brite.jfif'
  },

  // Everyday Grocery
  {
    id: 74,
    name: 'Kisan Dalia',
    folder: 'products(everyday grocery)',
    srcFile: 'kisan dalia.webp',
    cleanFile: 'kisan-dalia.webp'
  }
];

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);
  const targetDir = path.resolve(__dirname, '../../public/images/products');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  try {
    let copiedCount = 0;
    let dbUpdatedCount = 0;

    // 1. Copy files to products directory
    for (const item of mappings) {
      const srcPath = path.resolve(__dirname, '../../public/images', item.folder, item.srcFile);
      if (fs.existsSync(srcPath)) {
        // Copy with clean name
        const destCleanPath = path.join(targetDir, item.cleanFile);
        fs.copyFileSync(srcPath, destCleanPath);

        // Also copy with original name if different
        if (item.srcFile !== item.cleanFile) {
          const destOrigPath = path.join(targetDir, item.srcFile);
          fs.copyFileSync(srcPath, destOrigPath);
        }
        copiedCount++;
      } else {
        console.warn(`⚠️ Warning: Source file not found: ${srcPath}`);
      }

      // 2. Update Database with URL
      const imageUrl = `http://localhost:5000/images/products/${item.cleanFile}`;
      const res = await runQuery('UPDATE Products SET image_url = ? WHERE id = ?', [imageUrl, item.id]);
      if (res.changes > 0) dbUpdatedCount++;
    }

    console.log(`✓ Copied ${copiedCount} image files to /public/images/products/`);
    console.log(`✓ Updated database image_url for ${dbUpdatedCount} products.`);

    // 3. Update CSV template to stay in sync
    if (fs.existsSync(csvPath)) {
      let csvContent = fs.readFileSync(csvPath, 'utf8');
      for (const item of mappings) {
        // Replace empty image column for this product id
        // Format: "id","name","category","brand","image"
        const regex = new RegExp(`("${item.id}","[^"]*","[^"]*","[^"]*",)"[^"]*"`, 'g');
        csvContent = csvContent.replace(regex, `$1"${item.cleanFile}"`);
      }
      fs.writeFileSync(csvPath, csvContent, 'utf8');
      console.log(`✓ Updated CSV template with image filenames: ${csvPath}`);
    }

    // 4. Append to migrations.log
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    fs.appendFileSync(
      migrationsLogPath,
      `[${timestamp}] ${migrationName} - APPLIED - Imported 17 product images for Cleaning, Household, and Everyday Grocery\n`
    );

    console.log(`✓ Migration ${migrationName} successfully recorded in migrations.log`);

    // Verification check
    const verified = await allQuery(`
      SELECT id, name, brand, image_url 
      FROM Products 
      WHERE id IN (${mappings.map(m => m.id).join(',')})
    `);
    console.log(`\nVerified ${verified.length} updated products in database:`);
    verified.forEach(p => console.log(`  - [ID: ${p.id}] ${p.name} -> ${p.image_url}`));

    db.close();
  } catch (err) {
    console.error('❌ Migration failed:', err);
    db.close();
    process.exit(1);
  }
}

runMigration();
