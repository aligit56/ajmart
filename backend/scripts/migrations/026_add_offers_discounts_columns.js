require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const createDatabase = require('../../utils/db');

const migrationName = '026_add_offers_discounts_columns.js';
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
    const columns = await getAll('PRAGMA table_info(Discounts)');
    const colNames = columns.map(c => c.name);

    if (!colNames.includes('is_active')) {
      console.log('Adding is_active column to Discounts table...');
      await runQuery('ALTER TABLE Discounts ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;');
      console.log('✓ is_active column added successfully.');
    } else {
      console.log('• is_active column already exists.');
    }

    if (!colNames.includes('start_date')) {
      console.log('Adding start_date column to Discounts table...');
      // SQLite does not allow non-constant expressions like CURRENT_TIMESTAMP in ADD COLUMN DEFAULT
      await runQuery('ALTER TABLE Discounts ADD COLUMN start_date DATETIME DEFAULT NULL;');
      await runQuery("UPDATE Discounts SET start_date = datetime('now') WHERE start_date IS NULL;");
      console.log('✓ start_date column added and existing rows populated successfully.');
    } else {
      console.log('• start_date column already exists.');
    }

    // Create partial unique index to enforce at most one active discount per product at DB level
    console.log('Ensuring partial unique index on active product discounts...');
    await runQuery('CREATE UNIQUE INDEX IF NOT EXISTS idx_active_product_discount ON Discounts(product_id) WHERE is_active = 1;');
    console.log('✓ Partial unique index idx_active_product_discount verified.');

    // Verify existing discounts
    const existing = await getAll('SELECT * FROM Discounts');
    console.log(`✓ Current discounts count: ${existing.length}`);

    // Append to migrations.log
    fs.appendFileSync(
      migrationsLogPath,
      `[${new Date().toISOString()}] ${migrationName} - APPLIED\n`
    );
    console.log(`✓ Migration ${migrationName} successfully recorded in migrations.log.`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ Migration ${migrationName} failed:`, err);
    process.exit(1);
  }
}

runMigration();
