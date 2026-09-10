const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');

const dbPath = path.join(__dirname, '../database.sqlite');
const csvPath = path.join(__dirname, '../products_batch1.csv');

if (!fs.existsSync(csvPath)) {
  console.error(`❌ CSV file not found: ${csvPath}`);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
  console.log('✓ Database connected');
});

db.serialize(() => {
  const products = [];
  
  // Read CSV
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
      products.push({
        name: row.product_name.trim(),
        category: row.category.trim(),
        price: parseFloat(row.price),
        stock: parseInt(row.stock) || 0,
        image_url: '' // No real images yet
      });
    })
    .on('end', () => {
      console.log(`\n📦 Found ${products.length} products to import\n`);
      
      // Get all categories with IDs
      db.all('SELECT id, name FROM categories', (err, rows) => {
        if (err) {
          console.error('❌ Failed to fetch categories:', err);
          db.close();
          return;
        }
        
        if (rows.length === 0) {
          console.error('❌ No categories found in database');
          db.close();
          return;
        }
        
        console.log(`✓ Found ${rows.length} categories\n`);
        const categories = {};
        rows.forEach(row => {
          categories[row.name] = row.id;
        });
        
        console.log('Category IDs:');
        Object.entries(categories).forEach(([name, id]) => {
          console.log(`  ${id}: ${name}`);
        });
        console.log();
        
        // Let's delete existing products as per instructions or just insert new ones?
        // Wait, the user has existing products (the 10 sample products). Let's delete old dummy products.
        db.run('DELETE FROM products', (err) => {
           if (err) console.error('Error clearing products:', err);
        });

        // Insert products
        const stmt = db.prepare(
          'INSERT INTO products (name, category_id, price, stock, image_url, is_active, created_at) VALUES (?, ?, ?, ?, ?, 1, datetime("now"))'
        );
        
        let inserted = 0;
        let skipped = 0;
        const errors = [];
        
        products.forEach((product, index) => {
          const categoryId = categories[product.category];
          if (!categoryId) {
            skipped++;
            errors.push(`Row ${index + 2}: Category "${product.category}" not found for "${product.name}"`);
            return;
          }
          
          stmt.run(
            product.name,
            categoryId,
            product.price,
            product.stock,
            product.image_url,
            (err) => {
              if (err) {
                skipped++;
                errors.push(`Row ${index + 2}: ${product.name} - ${err.message}`);
              } else {
                inserted++;
              }
            }
          );
        });
        
        stmt.finalize((err) => {
          if (err) {
            console.error('❌ Insert finalize error:', err);
          }
          
          setTimeout(() => {
            console.log('\n=== IMPORT RESULTS ===');
            console.log(`✓ Successfully imported: ${inserted} products`);
            if (skipped > 0) {
              console.log(`✗ Skipped: ${skipped} products`);
              console.log('\nErrors:');
              errors.forEach(e => console.log(`  ${e}`));
            }
            
            console.log(`\nTotal in database: ${inserted} new products added\n`);
            
            // Verify in database
            db.all(
              'SELECT COUNT(*) as count FROM products',
              (err, result) => {
                if (!err) {
                  console.log(`Database check: ${result[0].count} total products in database`);
                }
                db.close();
              }
            );
          }, 500);
        });
      });
    })
    .on('error', (error) => {
      console.error('❌ CSV read error:', error);
      db.close();
      process.exit(1);
    });
});
