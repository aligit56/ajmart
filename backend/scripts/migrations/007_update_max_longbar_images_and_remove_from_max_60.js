const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '007_update_max_longbar_images_and_remove_from_max_60.js';
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

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);
  const productsDir = path.resolve(__dirname, '../../public/images/products');
  const uploadedImagePath = 'C:/Users/Ali/.gemini/antigravity/brain/cae01007-6773-4778-bf14-928eb93b2da5/.user_uploaded/media_1792507329875_117d470a.png';

  try {
    // 1. Copy user-uploaded Long Bar photo to backend/public/images/products
    if (fs.existsSync(uploadedImagePath)) {
      const imgBuffer = fs.readFileSync(uploadedImagePath);
      
      const targets = [
        path.join(productsDir, 'max-longbar.png'),
        path.join(productsDir, 'max-longbar-double.png'),
        path.join(productsDir, 'max-longbar.jpg'),
        path.join(productsDir, 'max-longbar-double.jpg'),
        path.resolve(__dirname, '../../public/images/products (Household)/max longbar.png'),
        path.resolve(__dirname, '../../public/images/products (Household)/max longbar double.png'),
        path.resolve(__dirname, '../../public/images/products (Household)/max longbar.jpg'),
        path.resolve(__dirname, '../../public/images/products (Household)/max longbar double.jpg')
      ];

      for (const target of targets) {
        fs.writeFileSync(target, imgBuffer);
        console.log(`✓ Saved clean longbar photo to: ${path.basename(target)}`);
      }
    } else {
      console.warn(`⚠️ Uploaded image path not found at: ${uploadedImagePath}`);
    }

    // 2. Update Database:
    // Max Long Bar (up long bar) -> max-longbar.png
    await runQuery(
      `UPDATE products SET image_url = ? WHERE name = ?`,
      ['http://localhost:5000/images/products/max-longbar.png', 'Max Long Bar']
    );
    console.log(`✓ Updated Max Long Bar image to max-longbar.png`);

    // Max Longbar Double (down long bar) -> max-longbar-double.png
    await runQuery(
      `UPDATE products SET image_url = ? WHERE name = ?`,
      ['http://localhost:5000/images/products/max-longbar-double.png', 'Max Longbar Double']
    );
    console.log(`✓ Updated Max Longbar Double image to max-longbar-double.png`);

    // Max 60 -> remove the 165gm bar (set image_url to null)
    await runQuery(
      `UPDATE products SET image_url = NULL WHERE name = ?`,
      ['Max 60']
    );
    console.log(`✓ Removed 165gm bar image from Max 60 (image_url set to NULL)`);

    // 3. Update backend/data/product_images_template.csv
    if (fs.existsSync(csvPath)) {
      let csvContent = fs.readFileSync(csvPath, 'utf8');
      const lines = csvContent.split(/\r?\n/);
      const updatedLines = lines.map(line => {
        if (!line.trim()) return line;
        const parts = line.split(',');
        if (parts.length >= 5) {
          const name = parts[1].replace(/^"|"$/g, '');
          if (name === 'Max Long Bar') {
            parts[4] = '"max-longbar.png"';
            return parts.join(',');
          } else if (name === 'Max Longbar Double') {
            parts[4] = '"max-longbar-double.png"';
            return parts.join(',');
          } else if (name === 'Max 60') {
            parts[4] = '""';
            return parts.join(',');
          }
        }
        return line;
      });

      fs.writeFileSync(csvPath, updatedLines.join('\n'), 'utf8');
      console.log(`✓ Updated product_images_template.csv`);
    }

    // 4. Record migration in migrations.log
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logEntry = `\n[${timestamp}] ${migrationName} - APPLIED - Applied user-provided Long Bar photo to Max Long Bar and Max Longbar Double, and removed 165gm bar image from Max 60`;
    fs.appendFileSync(migrationsLogPath, logEntry, 'utf8');
    console.log(`✓ Recorded in migrations.log`);

    console.log(`🎉 Migration ${migrationName} completed successfully.`);
  } catch (err) {
    console.error(`❌ Migration failed:`, err);
    process.exit(1);
  } finally {
    db.close();
  }
}

runMigration();
