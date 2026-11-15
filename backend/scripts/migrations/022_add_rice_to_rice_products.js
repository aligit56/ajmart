const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '022_add_rice_to_rice_products.js';
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

function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

const RICE_NAME_UPDATES = [
  { id: 27, oldName: 'Seela Supreme', newName: 'Seela Supreme Rice' },
  { id: 28, oldName: 'Seela VIP', newName: 'Seela VIP Rice' },
  { id: 29, oldName: 'Kainaat 1121 Special', newName: 'Kainaat 1121 Special Rice' },
  { id: 30, oldName: 'Kainaat 1121 Basmati', newName: 'Kainaat 1121 Basmati Rice' },
  { id: 31, oldName: 'Kainaat', newName: 'Kainaat Rice' },
  { id: 32, oldName: 'Daghi Kainaat Rice 1121', newName: 'Daghi Kainaat Rice 1121' }, // already has Rice
  { id: 33, oldName: 'Short Grain Poona', newName: 'Short Grain Poona Rice' },
  { id: 34, oldName: 'B-1 Tota', newName: 'B-1 Tota Rice' },
  { id: 35, oldName: 'B-2 Tota', newName: 'B-2 Tota Rice' }
];

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);

  await runQuery('BEGIN TRANSACTION');

  try {
    let rowsAffected = 0;

    for (const item of RICE_NAME_UPDATES) {
      const res = await runQuery(
        `UPDATE Products SET name = ? WHERE id = ? AND name != ?`,
        [item.newName, item.id, item.newName]
      );
      if (res.changes > 0) {
        rowsAffected += res.changes;
        console.log(`✓ Updated Product ID ${item.id}: '${item.oldName}' -> '${item.newName}'`);
      } else {
        console.log(`- Product ID ${item.id} already has name '${item.newName}'`);
      }
    }

    await runQuery('COMMIT');
    console.log(`✓ Successfully updated ${rowsAffected} Rice product names in database.`);

    // Update CSV template files for consistency
    const dataDir = path.resolve(__dirname, '../../data');
    
    // 1. products_batch1.csv
    const batch1Path = path.join(dataDir, 'products_batch1.csv');
    if (fs.existsSync(batch1Path)) {
      let content = fs.readFileSync(batch1Path, 'utf8');
      for (const item of RICE_NAME_UPDATES) {
        if (item.oldName !== item.newName) {
          content = content.replace(new RegExp(`^${item.oldName},`, 'm'), `${item.newName},`);
        }
      }
      fs.writeFileSync(batch1Path, content, 'utf8');
      console.log('✓ Updated products_batch1.csv');
    }

    // 2. product_images_template.csv
    const templatePath = path.join(dataDir, 'product_images_template.csv');
    if (fs.existsSync(templatePath)) {
      let content = fs.readFileSync(templatePath, 'utf8');
      for (const item of RICE_NAME_UPDATES) {
        if (item.oldName !== item.newName) {
          content = content.replace(new RegExp(`,${item.oldName},`, 'g'), `,${item.newName},`);
        }
      }
      fs.writeFileSync(templatePath, content, 'utf8');
      console.log('✓ Updated product_images_template.csv');
    }

    // 3. product_images_manifest.csv
    const manifestPath = path.join(dataDir, 'product_images_manifest.csv');
    if (fs.existsSync(manifestPath)) {
      let content = fs.readFileSync(manifestPath, 'utf8');
      for (const item of RICE_NAME_UPDATES) {
        if (item.oldName !== item.newName) {
          content = content.replace(new RegExp(`,${item.oldName},`, 'g'), `,${item.newName},`);
        }
      }
      fs.writeFileSync(manifestPath, content, 'utf8');
      console.log('✓ Updated product_images_manifest.csv');
    }

    // Record migration in migrations.log
    const logEntry = `\n${new Date().toISOString()} - ${migrationName} - APPLIED - Added 'Rice' to all products in Rice category so search for 'rice' returns all rice products (${rowsAffected} rows updated).\n`;
    fs.appendFileSync(migrationsLogPath, logEntry);
    console.log(`✓ Migration logged to ${migrationsLogPath}`);

  } catch (error) {
    await runQuery('ROLLBACK');
    console.error(`❌ Migration failed:`, error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

runMigration();
