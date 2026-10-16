const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');

// 1. Resolve CSV path
const csvArg = process.argv[2];
if (!csvArg) {
  console.error('Usage: node scripts/import-products.js <csv-file-path>');
  console.error('Example: node scripts/import-products.js data/products_batch1.csv');
  process.exit(1);
}

let resolvedCsvPath = path.isAbsolute(csvArg) ? csvArg : path.resolve(process.cwd(), csvArg);
if (!fs.existsSync(resolvedCsvPath)) {
  const fallback = path.resolve(__dirname, '..', csvArg);
  if (fs.existsSync(fallback)) {
    resolvedCsvPath = fallback;
  } else {
    console.error(`❌ CSV file not found: ${csvArg}`);
    process.exit(1);
  }
}

// 2. Connect to database
const dbPath = path.resolve(__dirname, '../database.sqlite');
if (!fs.existsSync(dbPath)) {
  console.error(`❌ Database file not found at: ${dbPath}`);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to open database:', err.message);
    process.exit(1);
  }
});

// Helper for db queries with Promises
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
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

async function main() {
  try {
    // 3. Ensure UNIQUE index on Products.name
    await runQuery('CREATE UNIQUE INDEX IF NOT EXISTS idx_products_name ON Products(name)');

    // 4. Fetch valid categories from database
    const categoryRows = await allQuery('SELECT id, name FROM Categories');
    const categoryMap = new Map();
    categoryRows.forEach((c) => {
      categoryMap.set(c.name.trim(), c.id);
    });

    // 5. Read CSV
    const rows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(resolvedCsvPath)
        .pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`\n==================================================`);
    console.log(`📦 AJTraders Generic Product Importer`);
    console.log(`📄 File: ${path.basename(resolvedCsvPath)} (${rows.length} rows read)`);
    console.log(`==================================================\n`);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const skippedReasons = [];

    // 6. Begin transaction
    await runQuery('BEGIN TRANSACTION');

    try {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; // header is row 1

        const name = (row.product_name || row.name || '').trim();
        const categoryName = (row.category || '').trim();
        const rawPrice = (row.price || '').toString().trim();
        const rawStock = (row.stock || '').toString().trim();
        const rawImage = (row.image_filename || row.image_url || row.image || '').trim();

        // Validation: product_name
        if (!name) {
          skipped++;
          skippedReasons.push(`Row ${rowNum}: Missing product_name`);
          continue;
        }

        // Validation: category
        if (!categoryMap.has(categoryName)) {
          skipped++;
          skippedReasons.push(`Row ${rowNum} ("${name}"): Unknown category "${categoryName}"`);
          continue;
        }
        const categoryId = categoryMap.get(categoryName);

        // Validation: price
        const price = parseFloat(rawPrice);
        if (isNaN(price) || price < 0) {
          skipped++;
          skippedReasons.push(`Row ${rowNum} ("${name}"): Invalid price "${rawPrice}"`);
          continue;
        }

        // Parse stock
        const stock = parseInt(rawStock, 10);
        const validStock = isNaN(stock) || stock < 0 ? 0 : stock;

        // Check if product already exists
        const existing = await getQuery('SELECT id, image_url FROM Products WHERE name = ?', [name]);

        // Compute image_url
        let finalImageUrl = null;
        if (rawImage) {
          if (rawImage.startsWith('http://') || rawImage.startsWith('https://') || rawImage.startsWith('/')) {
            finalImageUrl = rawImage;
          } else {
            finalImageUrl = `/images/products/${rawImage}`;
          }
        } else if (existing && existing.image_url) {
          finalImageUrl = existing.image_url;
        } else {
          finalImageUrl = '/images/placeholder.jpg';
        }

        if (existing) {
          // UPDATE
          await runQuery(
            `UPDATE Products 
             SET category_id = ?, price = ?, stock = ?, image_url = ?
             WHERE id = ?`,
            [categoryId, price, validStock, finalImageUrl, existing.id]
          );
          updated++;
        } else {
          // INSERT
          await runQuery(
            `INSERT INTO Products (name, category_id, price, stock, image_url, is_active)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [name, categoryId, price, validStock, finalImageUrl]
          );
          inserted++;
        }
      }

      // Commit transaction
      await runQuery('COMMIT');
    } catch (txErr) {
      await runQuery('ROLLBACK');
      throw txErr;
    }

    // 7. Summary
    const totalCountRow = await getQuery('SELECT COUNT(*) as count FROM Products');
    const totalInDb = totalCountRow ? totalCountRow.count : 0;

    console.log(`✓ Import Summary:`);
    console.log(`  - Inserted (new) : ${inserted}`);
    console.log(`  - Updated        : ${updated}`);
    console.log(`  - Skipped        : ${skipped}`);
    console.log(`  - Total in DB    : ${totalInDb}`);

    if (skippedReasons.length > 0) {
      console.log(`\n⚠️ Skipped Rows (${skippedReasons.length}):`);
      skippedReasons.forEach((r) => console.log(`   - ${r}`));
    }
    console.log(`\n==================================================\n`);

    db.close();
  } catch (err) {
    console.error('❌ Import failed with error:', err.message);
    db.close();
    process.exit(1);
  }
}

main();
