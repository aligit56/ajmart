const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '010_standardize_category_image_folders.js';
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

const catSlugs = {
  'Cleaning and Laundry': 'cleaning-and-laundry',
  'Cosmetics': 'cosmetics',
  'Everyday Grocery': 'everyday-grocery',
  'Household': 'household',
  'Noodle and Macaronis': 'noodle-and-macaronis',
  'Oil and Ghee': 'oil-and-ghee',
  'Personal Care': 'personal-care',
  'Pulses': 'pulses',
  'Rice': 'rice',
  'Spices': 'spices',
  'Tea or Coffee': 'tea-or-coffee'
};

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);
  const backendProductsDir = path.resolve(__dirname, '../../public/images/products');
  const frontendProductsDir = path.resolve(__dirname, '../../../frontend/public/images/products');

  try {
    // 1. Fetch all products with non-placeholder image_urls
    const rows = await allQuery(`
      SELECT p.id, p.name, c.name as category, p.image_url, p.variants 
      FROM Products p 
      JOIN Categories c ON p.category_id = c.id
      WHERE p.image_url IS NOT NULL AND p.image_url NOT LIKE '%placeholder%'
    `);

    console.log(`Found ${rows.length} products with images to process.`);

    let updatedCount = 0;
    const csvUpdates = new Map();

    for (const prod of rows) {
      const slug = catSlugs[prod.category];
      if (!slug) continue;

      const backendCatDir = path.join(backendProductsDir, slug);
      const frontendCatDir = path.join(frontendProductsDir, slug);
      if (!fs.existsSync(backendCatDir)) fs.mkdirSync(backendCatDir, { recursive: true });
      if (!fs.existsSync(frontendCatDir)) fs.mkdirSync(frontendCatDir, { recursive: true });

      let rawUrl = (prod.image_url || '').replace('http://localhost:5000', '').trim();

      // Check if it's JSON array of images (e.g. Indomie)
      if (rawUrl.startsWith('[')) {
        let arr = [];
        try { arr = JSON.parse(rawUrl); } catch (e) { arr = [rawUrl]; }
        const newArr = [];
        for (const u of arr) {
          const fn = path.basename(u);
          const srcFile = path.join(backendProductsDir, fn);
          const targetBackend = path.join(backendCatDir, fn);
          const targetFrontend = path.join(frontendCatDir, fn);

          if (fs.existsSync(srcFile)) {
            if (!fs.existsSync(targetBackend)) fs.copyFileSync(srcFile, targetBackend);
            if (!fs.existsSync(targetFrontend)) fs.copyFileSync(srcFile, targetFrontend);
          }
          newArr.push(`/images/products/${slug}/${fn}`);
        }
        const finalUrl = JSON.stringify(newArr);
        await runQuery(`UPDATE Products SET image_url = ? WHERE id = ?`, [finalUrl, prod.id]);
        csvUpdates.set(prod.name, `${slug}/${path.basename(newArr[0])}`);
        updatedCount++;
        continue;
      }

      // Single image URL
      const fn = path.basename(rawUrl);
      const srcFile = path.join(backendProductsDir, fn);
      const targetBackend = path.join(backendCatDir, fn);
      const targetFrontend = path.join(frontendCatDir, fn);

      if (fs.existsSync(srcFile)) {
        if (!fs.existsSync(targetBackend)) fs.copyFileSync(srcFile, targetBackend);
        if (!fs.existsSync(targetFrontend)) fs.copyFileSync(srcFile, targetFrontend);
      }

      const standardUrl = `/images/products/${slug}/${fn}`;
      await runQuery(`UPDATE Products SET image_url = ? WHERE id = ?`, [standardUrl, prod.id]);
      csvUpdates.set(prod.name, `${slug}/${fn}`);
      updatedCount++;

      // Update variant URLs if variants exist and contain image_url
      if (prod.variants) {
        try {
          const variants = JSON.parse(prod.variants);
          let changed = false;
          variants.forEach(v => {
            if (v.image_url) {
              const varFn = path.basename(v.image_url);
              const varSrc = path.join(backendProductsDir, varFn);
              const varTargetBackend = path.join(backendCatDir, varFn);
              const varTargetFrontend = path.join(frontendCatDir, varFn);
              if (fs.existsSync(varSrc)) {
                if (!fs.existsSync(varTargetBackend)) fs.copyFileSync(varSrc, varTargetBackend);
                if (!fs.existsSync(varTargetFrontend)) fs.copyFileSync(varSrc, varTargetFrontend);
              }
              v.image_url = `/images/products/${slug}/${varFn}`;
              changed = true;
            }
          });
          if (changed) {
            await runQuery(`UPDATE Products SET variants = ? WHERE id = ?`, [JSON.stringify(variants), prod.id]);
          }
        } catch (vErr) {
          // ignore parsing error
        }
      }
    }

    // Also copy extra variant files for noodles if present
    const extraNoodleFiles = [
      'indomi-noodles-1.jfif',
      'indomi-noodles-2.webp',
      'indomi-noodles-3.jfif',
      'knor-noodles-chatpata.jfif',
      'knor-noodles-chicken.jfif',
      'bake-parlor-macaroni.jfif',
      'bake-parlor-spaghetti.jpg'
    ];
    for (const ef of extraNoodleFiles) {
      const src = path.join(backendProductsDir, ef);
      const dstB = path.join(backendProductsDir, 'noodle-and-macaronis', ef);
      const dstF = path.join(frontendProductsDir, 'noodle-and-macaronis', ef);
      if (fs.existsSync(src)) {
        if (!fs.existsSync(dstB)) fs.copyFileSync(src, dstB);
        if (!fs.existsSync(dstF)) fs.copyFileSync(src, dstF);
      }
    }

    console.log(`✓ Updated ${updatedCount} products in database to category-slug paths.`);

    // 2. Synchronize CSV template file
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      const lines = csvContent.split(/\r?\n/);
      const updatedLines = lines.map(line => {
        if (!line.trim()) return line;
        const parts = line.split(',');
        if (parts.length >= 5) {
          const name = parts[1].replace(/^"|"$/g, '');
          if (csvUpdates.has(name)) {
            parts[4] = `"${csvUpdates.get(name)}"`;
            return parts.join(',');
          }
        }
        return line;
      });
      fs.writeFileSync(csvPath, updatedLines.join('\n'), 'utf8');
      console.log(`✓ Synchronized product_images_template.csv.`);
    }

    // 3. Record in migrations.log
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logEntry = `\n[${timestamp}] ${migrationName} - APPLIED - Standardized all product images into category-slug folders (/images/products/<category-slug>/<filename>) across database, CSV, and frontend.`;
    fs.appendFileSync(migrationsLogPath, logEntry, 'utf8');
    console.log(`✓ Recorded in migrations.log.`);

    console.log(`🎉 Migration ${migrationName} completed successfully!`);
  } catch (err) {
    console.error(`❌ Migration failed:`, err);
    process.exit(1);
  } finally {
    db.close();
  }
}

runMigration();
