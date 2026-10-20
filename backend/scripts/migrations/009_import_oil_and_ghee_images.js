const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '009_import_oil_and_ghee_images.js';
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

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);

  const oilGheeMappings = [
    { name: 'Dalda Oil 1kg', file: 'dalda-oil.jpg' },
    { name: 'Dalda Ghee 1kg', file: 'dalda-ghee.jpg' },
    { name: 'Oil Sufi 1kg', file: 'sufi-oil.webp' },
    { name: 'Ghee Sufi 1kg', file: 'sufi-ghee.jpg' },
    { name: 'ISL Oil 1kg', file: 'isl-oil.webp' },
    { name: 'ISL Ghee 1kg', file: 'isl-ghee.jpg' },
    { name: 'Latif Oil 1kg', file: 'latif-oil.jpg' },
    { name: 'Shahtaj Oil 1kg', file: 'shahtaj-oil.jpg' },
    { name: 'Shahtaj Ghee 1kg', file: 'shahtaj-ghee.jpg' },
    { name: 'Olive Soya Supreme', file: 'olive-soya-supreme.webp' },
    { name: 'Soya Supreme 2.5kg Tin', file: 'soya-supreme-tin.jpg' }
  ];

  try {
    // 1. Update Database
    for (const item of oilGheeMappings) {
      const url = `http://localhost:5000/images/products/${item.file}`;
      await runQuery('UPDATE products SET image_url = ? WHERE name = ?', [url, item.name]);
      console.log(`✓ Updated DB image_url for: ${item.name} -> ${item.file}`);
    }

    // 2. Update CSV template
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      const lines = csvContent.split(/\r?\n/);
      const updatedLines = lines.map(line => {
        if (!line.trim()) return line;
        const parts = line.split(',');
        if (parts.length >= 5) {
          const name = parts[1].replace(/^"|"$/g, '');
          const match = oilGheeMappings.find(m => m.name === name);
          if (match) {
            parts[4] = `"${match.file}"`;
            return parts.join(',');
          }
        }
        return line;
      });

      fs.writeFileSync(csvPath, updatedLines.join('\n'), 'utf8');
      console.log(`✓ Updated product_images_template.csv for oil & ghee products`);
    }

    // 3. Record in migrations.log
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logEntry = `\n[${timestamp}] ${migrationName} - APPLIED - Imported and mapped size-free cropped oil and ghee images (Dalda, Sufi, ISL, Latif, Shahtaj, Soya Supreme)`;
    fs.appendFileSync(migrationsLogPath, logEntry, 'utf8');
    console.log(`✓ Recorded in migrations.log`);

    console.log(`🎉 Migration ${migrationName} completed successfully.`);
  } catch (err) {
    console.error(`❌ Migration failed:`, err);
    process.exit(1);
  } finally {
    db.close();
  }
}

runMigration();
