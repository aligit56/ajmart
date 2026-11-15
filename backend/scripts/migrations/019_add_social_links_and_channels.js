const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '019_add_social_links_and_channels.js';
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
    const socialEntries = [
      ['facebook_url', 'https://www.facebook.com/share/14uooa52BdR/'],
      ['instagram_url', 'https://www.instagram.com/aj_traders006'],
      ['tiktok_url', 'https://www.tiktok.com/@aj.traders07'],
      ['whatsapp_channel_url', 'https://whatsapp.com/channel/0029Vb9yavmE50UlfeAKWo39']
    ];

    for (const [key, val] of socialEntries) {
      await runQuery(
        `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [key, val]
      );
      console.log(`✓ Stored setting: ${key} = ${val}`);
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
