require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const createDatabase = require('../../utils/db');

const migrationName = '025_standardize_category_image_urls.js';
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
    const categories = await getAll("SELECT id, name, image_url FROM categories");
    console.log(`Found ${categories.length} categories to inspect.`);

    let updatedCount = 0;
    for (const cat of categories) {
      if (cat.image_url && cat.image_url.startsWith('http://localhost:5000')) {
        const relativeUrl = cat.image_url.replace('http://localhost:5000', '');
        await runQuery("UPDATE categories SET image_url = ? WHERE id = ?", [relativeUrl, cat.id]);
        console.log(`Updated Category ${cat.id} (${cat.name}): ${cat.image_url} -> ${relativeUrl}`);
        updatedCount++;
      }
    }

    console.log(`✓ Migration completed. ${updatedCount} category image URLs standardized to relative paths.`);

    // Record migration in migrations.log
    const timestamp = new Date().toISOString();
    fs.appendFileSync(migrationsLogPath, `\n${timestamp} - ${migrationName} - APPLIED\n`);
    console.log(`✓ Logged migration ${migrationName} into migrations.log.`);

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
