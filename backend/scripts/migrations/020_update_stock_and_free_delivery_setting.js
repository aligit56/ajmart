const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '020_update_stock_and_free_delivery_setting.js';
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

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);

  await runQuery('BEGIN TRANSACTION');

  try {
    // 1. Update the 24 pulse and rice products (and any product where stock <= 0) to 50
    const updateResult = await runQuery(
      `UPDATE products SET stock = 50 WHERE stock <= 0`
    );
    console.log(`✓ Updated ${updateResult.changes} products from 0 stock to 50.`);

    // 2. Update announcement_bar_text in settings to free delivery over PKR 5,000
    await runQuery(
      `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      ['announcement_bar_text', 'Free delivery on wholesale & retail grocery orders over PKR 5,000 across Rawalpindi & Islamabad!']
    );
    console.log('✓ Updated announcement_bar_text setting for PKR 5,000 threshold.');

    await runQuery('COMMIT');

    const logEntry = `${new Date().toISOString()} - ${migrationName} - APPLIED\n`;
    fs.appendFileSync(migrationsLogPath, logEntry, 'utf8');
    console.log(`✓ Migration ${migrationName} completed and logged successfully.`);
    process.exit(0);
  } catch (error) {
    await runQuery('ROLLBACK');
    console.error('❌ Migration failed, rolled back:', error);
    process.exit(1);
  }
}

runMigration();
