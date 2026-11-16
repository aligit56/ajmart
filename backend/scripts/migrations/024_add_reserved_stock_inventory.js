require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const createDatabase = require('../../utils/db');

const migrationName = '024_add_reserved_stock_inventory.js';
const migrationsLogPath = path.resolve(__dirname, '../../migrations.log');

// 1. Check migrations.log to ensure idempotency
if (fs.existsSync(migrationsLogPath)) {
  const logContent = fs.readFileSync(migrationsLogPath, 'utf8');
  if (logContent.includes(`${migrationName} - APPLIED`)) {
    console.log(`✓ Migration ${migrationName} has already been applied, skipping.`);
    process.exit(0);
  }
}

const db = createDatabase();

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

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);

  try {
    // 1. Check if reserved_stock exists in Products
    const prodColumns = await getAll('PRAGMA table_info(Products)');
    const hasReservedStock = prodColumns.some(c => c.name === 'reserved_stock');

    if (!hasReservedStock) {
      console.log('Adding reserved_stock column to Products table...');
      await runQuery('ALTER TABLE Products ADD COLUMN reserved_stock INTEGER NOT NULL DEFAULT 0;');
      console.log('✓ reserved_stock column added successfully.');
    } else {
      console.log('✓ reserved_stock column already exists.');
    }

    // 2. Log migration
    const timestamp = new Date().toISOString();
    fs.appendFileSync(
      migrationsLogPath,
      `[${timestamp}] ${migrationName} - APPLIED - Added reserved_stock column to Products table for reservation-based inventory control.\n`
    );

    console.log(`✓ Migration ${migrationName} applied successfully.`);
    if (typeof db.close === 'function') db.close();
    process.exit(0);
  } catch (err) {
    console.error(`❌ Migration failed:`, err);
    if (typeof db.close === 'function') db.close();
    process.exit(1);
  }
}

runMigration();
