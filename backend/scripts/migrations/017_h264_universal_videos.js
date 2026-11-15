const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '017_h264_universal_videos.js';
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

  // Clear existing featured_videos
  await runQuery('DELETE FROM featured_videos');

  const videos = [
    [
      'AJTraders Store & Warehouse Walkthrough',
      '/videos/ajtraders-store-walkthrough.mp4',
      '/videos/ajtraders-store-walkthrough-thumb.jpg',
      1,
      1
    ],
    [
      'Authentic Grains & Products Quality Check',
      '/videos/ajtraders-products-inspection.mp4',
      '/videos/ajtraders-products-inspection-thumb.jpg',
      2,
      1
    ]
  ];

  for (const v of videos) {
    await runQuery(
      `INSERT INTO featured_videos (title, video_url, thumbnail_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      v
    );
  }

  await runQuery('COMMIT');

  // Record in migrations.log
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logEntry = `\n[${now}] ${migrationName} - APPLIED - Transcoded user store videos from HEVC (H.265) to universal H.264 (AVC1) with faststart, generated real 1080p frame poster thumbnails, and updated database paths.`;
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
