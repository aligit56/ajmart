const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '008_import_tea_images.js';
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

  const teaProductMappings = [
    { name: 'ISL Tea 1kg', file: 'isl-tea.jpg' },
    { name: 'ISL Tea 500gm', file: 'isl-tea.jpg' },
    { name: 'ISL Tea 250gm', file: 'isl-tea.jpg' },
    { name: 'Tapal Tea 1kg', file: 'tapal-tea.jpg' },
    { name: 'Tapal Tea 500gm', file: 'tapal-tea.jpg' },
    { name: 'Haizoom Tea 1kg', file: 'haizoom-tea.jpg' },
    { name: 'Haizoom Tea 500gm', file: 'haizoom-tea.jpg' },
    { name: 'Meezan Ultra Rich 5kg', file: 'meezan-ultra-rich.jpg' },
    { name: 'Tulip 5kg', file: 'tulip-tea.webp' }
  ];

  try {
    // 1. Update Database
    for (const item of teaProductMappings) {
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
          const match = teaProductMappings.find(m => m.name === name);
          if (match) {
            parts[4] = `"${match.file}"`;
            return parts.join(',');
          }
        }
        return line;
      });

      fs.writeFileSync(csvPath, updatedLines.join('\n'), 'utf8');
      console.log(`✓ Updated product_images_template.csv for tea products`);
    }

    // 3. Record in migrations.log
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logEntry = `\n[${timestamp}] ${migrationName} - APPLIED - Imported and mapped size-cropped tea images (ISL, Tapal, Haizoom, Meezan, Tulip)`;
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
