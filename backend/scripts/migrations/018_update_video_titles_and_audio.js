const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '018_update_video_titles_and_audio.js';
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

  // Update titles in featured_videos
  // Video 1: Store Walkthrough (audio stripped)
  await runQuery(`
    UPDATE featured_videos
    SET title = 'AJTraders Store Walkthrough',
        video_url = '/videos/ajtraders-store-walkthrough.mp4',
        thumbnail_url = '/videos/ajtraders-store-walkthrough-thumb.jpg'
    WHERE sort_order = 1 OR id = 4
  `);

  // Video 2: Products Showcase (accurate title reflecting products only)
  await runQuery(`
    UPDATE featured_videos
    SET title = 'Wholesale Grocery & Branded Products Showcase',
        video_url = '/videos/ajtraders-products-inspection.mp4',
        thumbnail_url = '/videos/ajtraders-products-inspection-thumb.jpg'
    WHERE sort_order = 2 OR id = 5
  `);

  await runQuery('COMMIT');

  // Record in migrations.log
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logEntry = `\n[${now}] ${migrationName} - APPLIED - Stripped audio from first store walkthrough video, updated second video title to 'Wholesale Grocery & Branded Products Showcase', and optimized portrait video dimensions.`;
  fs.appendFileSync(migrationsLogPath, logEntry, 'utf8');
  console.log(`✓ Migration recorded in ${migrationsLogPath}`);

  db.close((err) => {
    if (err) console.error('Error closing DB:', err.message);
    else console.log(`✓ Migration ${migrationName} completed successfully.`);
  });
}

runMigration().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
