const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '005_update_max_longbar_and_max60_images.js';
const migrationsLogPath = path.resolve(__dirname, 'migrations.log');
const dbPath = path.resolve(__dirname, '../../database.sqlite');
const csvPath = path.resolve(__dirname, '../../data/product_images_template.csv');

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
    // 1. Put current Max Long Bar image into Max 60
    const res60 = await runQuery(`
      UPDATE Products 
      SET image_url = 'http://localhost:5000/images/products/max-longbar.jpg' 
      WHERE id = 102 OR name = 'Max 60'
    `);
    console.log(`✓ Updated Max 60 image to max-longbar.jpg. Rows: ${res60.changes}`);

    // 2. Put Max Longbar Double image into Max Long Bar
    const resLong = await runQuery(`
      UPDATE Products 
      SET image_url = 'http://localhost:5000/images/products/max-longbar-double.jpg' 
      WHERE id = 100 OR name = 'Max Long Bar'
    `);
    console.log(`✓ Updated Max Long Bar image to max-longbar-double.jpg. Rows: ${resLong.changes}`);

    // 3. Update CSV template
    if (fs.existsSync(csvPath)) {
      let csvContent = fs.readFileSync(csvPath, 'utf8');
      csvContent = csvContent.replace(
        '"100","Max Long Bar","Household","Max","max-longbar.jpg"',
        '"100","Max Long Bar","Household","Max","max-longbar-double.jpg"'
      );
      csvContent = csvContent.replace(
        '"102","Max 60","Household","Max",""',
        '"102","Max 60","Household","Max","max-longbar.jpg"'
      );
      fs.writeFileSync(csvPath, csvContent, 'utf8');
      console.log(`✓ Updated CSV template: ${csvPath}`);
    }

    // 4. Record in migrations.log
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    fs.appendFileSync(
      migrationsLogPath,
      `[${timestamp}] ${migrationName} - APPLIED - Moved Max Long Bar image to Max 60 and set Max Longbar Double image on Max Long Bar\n`
    );
    console.log(`✓ Migration ${migrationName} successfully recorded in migrations.log`);

    // Verify
    const verified = await allQuery(`
      SELECT id, name, brand, image_url 
      FROM Products 
      WHERE id IN (100, 102, 104)
    `);
    console.log('\nVerified products:');
    verified.forEach(p => console.log(`  - [ID: ${p.id}] ${p.name} -> ${p.image_url}`));

    db.close();
  } catch (err) {
    console.error('❌ Migration failed:', err);
    db.close();
    process.exit(1);
  }
}

runMigration();
