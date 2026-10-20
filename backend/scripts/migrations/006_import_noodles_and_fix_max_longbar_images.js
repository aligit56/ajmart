const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '006_import_noodles_and_fix_max_longbar_images.js';
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
  const productsDir = path.resolve(__dirname, '../../public/images/products');
  const noodlesSrcDir = path.resolve(__dirname, '../../public/images/products (noodles)');

  try {
    // ----------------------------------------------------
    // STEP 1: Fix Max Long Bar & Longbar Double images
    // Replace with clean product image that has NO "530g" text
    // ----------------------------------------------------
    const cleanLongbarSrc = path.join(productsDir, 'test_grocerapp.jpg');
    if (fs.existsSync(cleanLongbarSrc)) {
      fs.copyFileSync(cleanLongbarSrc, path.join(productsDir, 'max-longbar.jpg'));
      fs.copyFileSync(cleanLongbarSrc, path.join(productsDir, 'max-longbar-double.jpg'));
      fs.copyFileSync(cleanLongbarSrc, path.join(productsDir, 'max longbar.jpg'));
      fs.copyFileSync(cleanLongbarSrc, path.join(productsDir, 'max longbar double.jpg'));
      console.log('✓ Replaced Max Long Bar and Longbar Double images with clean packaging (no 530g text).');
    }

    // ----------------------------------------------------
    // STEP 2: Copy noodle images to /images/products/
    // ----------------------------------------------------
    const noodleFiles = [
      { src: 'bake parlor macronniijfif.jfif', clean: 'bake-parlor-macaroni.jfif' },
      { src: 'bake parlor spaghheti.jpg', clean: 'bake-parlor-spaghetti.jpg' },
      { src: 'elfin macranoi.jfif', clean: 'elfin-macaroni.jfif' },
      { src: 'golden macronni.jfif', clean: 'golden-macaroni.jfif' },
      { src: 'indomi noodles 1 .jfif', clean: 'indomi-noodles-1.jfif' },
      { src: 'indomi noodles 2.webp', clean: 'indomi-noodles-2.webp' },
      { src: 'indomi noodles 3 .jfif', clean: 'indomi-noodles-3.jfif' },
      { src: 'knor noodles chatpata.jfif', clean: 'knor-noodles-chatpata.jfif' },
      { src: 'knor noodles chicken .jfif', clean: 'knor-noodles-chicken.jfif' },
      { src: 'mario spaghettijpeg.jpeg', clean: 'mario-spaghetti.jpeg' }
    ];

    for (const f of noodleFiles) {
      const srcPath = path.join(noodlesSrcDir, f.src);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, path.join(productsDir, f.clean));
        if (f.src !== f.clean) {
          fs.copyFileSync(srcPath, path.join(productsDir, f.src));
        }
      }
    }
    console.log('✓ Copied 10 noodle and macaroni images to /images/products/');

    // ----------------------------------------------------
    // STEP 3: Update Database for Noodle and Macaronis
    // ----------------------------------------------------

    // 1. Knorr Family Pack (ID 127): variants with Chatpatta & Chicken image URLs
    const knorrVariants = JSON.stringify([
      {
        name: 'Chatpatta',
        price: 300,
        image_url: 'http://localhost:5000/images/products/knor-noodles-chatpata.jfif'
      },
      {
        name: 'Chicken',
        price: 300,
        image_url: 'http://localhost:5000/images/products/knor-noodles-chicken.jfif'
      }
    ]);
    await runQuery(`
      UPDATE Products 
      SET image_url = 'http://localhost:5000/images/products/knor-noodles-chatpata.jfif',
          variants = ?
      WHERE id = 127 OR name = 'Knorr Family Pack'
    `, [knorrVariants]);
    console.log('✓ Updated Knorr Family Pack with Chatpatta & Chicken variant images.');

    // 2. Indomie Noodles (ID 128): 3 images
    const indomieImages = JSON.stringify([
      'http://localhost:5000/images/products/indomi-noodles-1.jfif',
      'http://localhost:5000/images/products/indomi-noodles-2.webp',
      'http://localhost:5000/images/products/indomi-noodles-3.jfif'
    ]);
    await runQuery(`
      UPDATE Products 
      SET image_url = ?
      WHERE id = 128 OR name = 'Indomie Noodles'
    `, [indomieImages]);
    console.log('✓ Updated Indomie Noodles with 3 accessible images.');

    // 3. Bake Parlor (ID 130): variants with Spaghetti and Macaroni Box images
    const bakeParlorVariants = JSON.stringify([
      {
        name: 'Spaghetti',
        price: 180,
        image_url: 'http://localhost:5000/images/products/bake-parlor-spaghetti.jpg'
      },
      {
        name: 'Macroni Box',
        price: 190,
        image_url: 'http://localhost:5000/images/products/bake-parlor-macaroni.jfif'
      }
    ]);
    await runQuery(`
      UPDATE Products 
      SET image_url = 'http://localhost:5000/images/products/bake-parlor-spaghetti.jpg',
          variants = ?
      WHERE id = 130 OR name = 'Bake Parlor'
    `, [bakeParlorVariants]);
    console.log('✓ Updated Bake Parlor with Spaghetti & Macaroni images.');

    // 4. Elfin (ID 132)
    await runQuery(`
      UPDATE Products 
      SET image_url = 'http://localhost:5000/images/products/elfin-macaroni.jfif'
      WHERE id = 132 OR name = 'Elfin'
    `);

    // 5. Golden Macroni Box (ID 133)
    await runQuery(`
      UPDATE Products 
      SET image_url = 'http://localhost:5000/images/products/golden-macaroni.jfif'
      WHERE id = 133 OR name = 'Golden Macroni Box'
    `);

    // 6. Mario (ID 131)
    await runQuery(`
      UPDATE Products 
      SET image_url = 'http://localhost:5000/images/products/mario-spaghetti.jpeg'
      WHERE id = 131 OR name = 'Mario'
    `);

    // Also ensure Max Long Bar (ID 100) and Max Longbar Double (ID 104) are updated
    await runQuery(`
      UPDATE Products 
      SET image_url = 'http://localhost:5000/images/products/max-longbar.jpg'
      WHERE id = 100 OR name = 'Max Long Bar'
    `);
    await runQuery(`
      UPDATE Products 
      SET image_url = 'http://localhost:5000/images/products/max-longbar-double.jpg'
      WHERE id = 104 OR name = 'Max Longbar Double'
    `);

    // ----------------------------------------------------
    // STEP 4: Update CSV template
    // ----------------------------------------------------
    if (fs.existsSync(csvPath)) {
      let csvContent = fs.readFileSync(csvPath, 'utf8');
      csvContent = csvContent.replace(
        '"127","Knorr Family Pack","Noodle and Macaronis","Knorr",""',
        '"127","Knorr Family Pack","Noodle and Macaronis","Knorr","knor-noodles-chatpata.jfif"'
      );
      csvContent = csvContent.replace(
        '"128","Indomie Noodles","Noodle and Macaronis","Indomie",""',
        '"128","Indomie Noodles","Noodle and Macaronis","Indomie","indomi-noodles-1.jfif"'
      );
      csvContent = csvContent.replace(
        '"130","Bake Parlor","Noodle and Macaronis","Bake Parlor",""',
        '"130","Bake Parlor","Noodle and Macaronis","Bake Parlor","bake-parlor-spaghetti.jpg"'
      );
      csvContent = csvContent.replace(
        '"131","Mario","Noodle and Macaronis","Mario\'s",""',
        '"131","Mario","Noodle and Macaronis","Mario\'s","mario-spaghetti.jpeg"'
      );
      csvContent = csvContent.replace(
        '"132","Elfin","Noodle and Macaronis","Elfin",""',
        '"132","Elfin","Noodle and Macaronis","Elfin","elfin-macaroni.jfif"'
      );
      csvContent = csvContent.replace(
        '"133","Golden Macroni Box","Noodle and Macaronis","Golden",""',
        '"133","Golden Macroni Box","Noodle and Macaronis","Golden","golden-macaroni.jfif"'
      );
      fs.writeFileSync(csvPath, csvContent, 'utf8');
      console.log('✓ Updated product_images_template.csv');
    }

    // ----------------------------------------------------
    // STEP 5: Record in migrations.log
    // ----------------------------------------------------
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    fs.appendFileSync(
      migrationsLogPath,
      `[${timestamp}] ${migrationName} - APPLIED - Imported noodle images, multi-image Indomie, Knorr variant images, and fixed Max longbar image\n`
    );
    console.log(`✓ Migration ${migrationName} recorded in migrations.log`);

    // Verification
    const verified = await allQuery(`
      SELECT id, name, variants, image_url 
      FROM Products 
      WHERE id IN (100, 104, 127, 128, 130, 131, 132, 133)
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
