const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '003_update_sufi_oil_ghee_brand.js';
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

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);
  try {
    // Update brand from 'AJ Brand' to 'Sufi' for Oil Sufi 1kg and Ghee Sufi 1kg
    const result = await runQuery(`
      UPDATE Products 
      SET brand = 'Sufi' 
      WHERE name IN ('Oil Sufi 1kg', 'Ghee Sufi 1kg')
    `);

    console.log(`✓ Updated brand to 'Sufi' for Sufi Oil & Ghee products. Rows affected: ${result.changes}`);

    // Verify updated products
    const verified = await allQuery(`
      SELECT id, name, brand, category_id 
      FROM Products 
      WHERE name IN ('Oil Sufi 1kg', 'Ghee Sufi 1kg')
    `);
    console.log('Verified products:', verified);

    // Append to migrations.log
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    fs.appendFileSync(
      migrationsLogPath,
      `[${timestamp}] ${migrationName} - APPLIED - Updated brand from AJ to Sufi for Oil Sufi 1kg and Ghee Sufi 1kg\n`
    );

    console.log(`✓ Migration ${migrationName} successfully recorded in migrations.log`);
    db.close();
  } catch (err) {
    console.error('❌ Migration failed:', err);
    db.close();
    process.exit(1);
  }
}

runMigration();
