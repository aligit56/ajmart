const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '021_customer_points_and_min_order_update.js';
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

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);

  await runQuery('BEGIN TRANSACTION');

  try {
    // 1. Add points column to Users if it does not exist
    const userColumns = await getAll('PRAGMA table_info(Users)');
    const hasPoints = userColumns.some(c => c.name === 'points');
    if (!hasPoints) {
      await runQuery('ALTER TABLE Users ADD COLUMN points INTEGER DEFAULT 0');
      console.log('✓ Added points column to Users table.');
    } else {
      console.log('✓ points column already exists in Users.');
    }

    // 2. Add customer_name and customer_phone to Orders if not existing
    const orderColumns = await getAll('PRAGMA table_info(Orders)');
    const hasCustName = orderColumns.some(c => c.name === 'customer_name');
    if (!hasCustName) {
      await runQuery('ALTER TABLE Orders ADD COLUMN customer_name TEXT');
      console.log('✓ Added customer_name column to Orders table.');
    }
    const hasCustPhone = orderColumns.some(c => c.name === 'customer_phone');
    if (!hasCustPhone) {
      await runQuery('ALTER TABLE Orders ADD COLUMN customer_phone TEXT');
      console.log('✓ Added customer_phone column to Orders table.');
    }

    // 3. Update settings for minimum order 5000 and points program
    const settingsUpdates = [
      ['announcement_bar_text', 'Minimum order of PKR 5,000 required for delivery across Rawalpindi & Islamabad'],
      ['minimum_order_amount', '5000'],
      ['points_threshold', '2000'],
      ['points_reward', '50']
    ];

    for (const [k, v] of settingsUpdates) {
      await runQuery(
        `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [k, v]
      );
      console.log(`✓ Set setting ${k} = ${v}`);
    }

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
