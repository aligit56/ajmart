const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');

const dbPath = path.join(__dirname, '../database.sqlite');
const csvPath = path.join(__dirname, '../products_batch2.csv');

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

const descriptions = {
  // Loose Spices
  "Haldi 200gm": "Pure ground turmeric powder (200g). Sourced from the finest farms for rich color and earthy aroma.\n\nخالص ہلدی پاؤڈر (200 گرام)۔ بہترین کھیتوں سے حاصل کی گئی، گہرے رنگ اور مٹی جیسی خوشبو کے ساتھ۔",
  "Lal Mirch 200gm": "Fiery red chilli powder (200g). Perfectly blended for deep red color and a rich, spicy kick.\n\nتیز لال مرچ پاؤڈر (200 گرام)۔ گہرے سرخ رنگ اور ذائقے کے لیے بہترین مرکب۔",
  "Dara Mirch 200gm": "Crushed red chilli (Dara Mirch, 200g). Coarsely ground for an authentic texture and bold heat.\n\nدرا مرچ (200 گرام)۔ موٹی پسی ہوئی، جو روایتی کھانوں کو اصلی ذائقہ اور تیزی دیتی ہے۔",
  "Salan Masala 100gm": "All-in-one curry masala blend (100g). A perfect mix of spices for a rich and flavorful gravy.\n\nسالن مصالحہ (100 گرام)۔ ذائقے دار سالن کے لیے تمام مصالحوں کا بہترین مرکب۔",
  // Shan
  "Shan Korma": "Shan Korma masala — the iconic blend for a rich, creamy, and aromatic chicken or mutton korma.\n\nشان کورمہ مصالحہ — مرغی یا مٹن کے بہترین ذائقے دار اور خوشبودار کورمے کے لیے۔",
  "Shan Biryani": "Shan Biryani masala — the most popular spice mix for making restaurant-quality biryani at home.\n\nشان بریانی مصالحہ — گھر میں ریستوران جیسی لذیذ بریانی بنانے کے لیے سب سے مقبول مصالحہ۔",
  "Shan Tikka": "Shan Tikka masala — perfectly balanced blend for juicy, smoky, and tender chicken tikka.\n\nشان ٹکہ مصالحہ — رسیلی، دھواں دار اور نرم چکن ٹکہ کے لیے بہترین مرکب۔",
  "Shan Bihari Kabab": "Shan Bihari Kabab masala — gives kababs a deep, tender, and smoky traditional flavor.\n\nشان بہاری کباب مصالحہ — کباب کو گہرا، نرم اور روایتی دھواں دار ذائقہ دیتا ہے۔",
  "Shan Nihari": "Shan Nihari masala — the classic spice blend for the beloved slow-cooked Nihari dish.\n\nشان نہاری مصالحہ — پسندیدہ دھیمی آنچ پر پکنے والی نہاری کے لیے کلاسک مصالحہ۔",
  "Shan Haleem Mix": "Shan Haleem Mix — a complete masala kit for making thick, hearty, and deeply flavored haleem.\n\nشان حلیم مکس — گاڑھی، بھرپور اور لذیذ حلیم بنانے کا مکمل مصالحہ سیٹ۔",
  "Shan Adrak": "Shan Adrak (Ginger) paste masala — saves prep time while delivering fresh, bold ginger flavor.\n\nشان ادرک — تازہ اور بھرپور ادرک کا ذائقہ دیتا ہے اور کھانا بنانے کا وقت بچاتا ہے۔",
  // National
  "National Haleem Mix": "National Haleem Mix — a trusted, complete blend for an authentic and perfectly spiced haleem.\n\nنیشنل حلیم مکس — معتبر اور مکمل مصالحہ جو اصل اور لذیذ حلیم کے لیے بہترین ہے۔",
  "National Tikka": "National Tikka masala — expertly balanced for perfectly marinated, juicy grilled chicken tikka.\n\nنیشنل ٹکہ مصالحہ — رسیلی اور لذیذ گرل کی ہوئی چکن ٹکہ کے لیے ماہرانہ انداز میں تیار کیا گیا۔",
  "National Pulao": "National Pulao masala — aromatic blend for a fragrant, fluffy, and perfectly cooked pulao rice.\n\nنیشنل پلاؤ مصالحہ — خوشبودار، ہلکے اور عمدہ پکے ہوئے پلاؤ کے لیے بہترین مرکب۔",
  "National Biryani": "National Biryani masala — delivers the authentic taste of homemade biryani with rich layered flavors.\n\nنیشنل بریانی مصالحہ — گھر میں پکی بریانی کا اصل ذائقہ اور بھرپور تہہ دار خوشبو دیتا ہے۔",
  "National Murgi": "National Murgi (Chicken) masala — perfect everyday spice blend for chicken curries and gravies.\n\nنیشنل مرغی مصالحہ — چکن سالن اور گریوی کے لیے روزمرہ کا بہترین مصالحہ۔",
  // Mahran
  "Mahran Tikka": "Mahran Tikka masala — rich, smoky spice blend for tender and flavorful grilled tikka.\n\nمہران ٹکہ مصالحہ — نرم اور ذائقے دار گرل ٹکہ کے لیے دھواں دار اور بھرپور مصالحہ۔",
  "Mahran Fish": "Mahran Fish masala — a specialty blend of coastal spices for perfectly seasoned fried or grilled fish.\n\nمہران مچھلی مصالحہ — تلی یا گرل مچھلی کے لیے ساحلی مصالحوں کا خصوصی مرکب۔",
  "Mahran Haleem": "Mahran Haleem masala — slow-cook with this blend for a deeply spiced, hearty haleem every time.\n\nمہران حلیم مصالحہ — اس مصالحے کے ساتھ ہر بار گہرے ذائقے اور دل بھرنے والی حلیم۔",
  "Mahran Chapli Kabab": "Mahran Chapli Kabab masala — Peshwari-style spice blend for juicy, flat, and crispy chapli kababs.\n\nمہران چپلی کباب مصالحہ — رسیلے، چپٹے اور کرارے چپلی کباب کے لیے پشاوری طرز کا مصالحہ۔",
  "Mahran Shami Kabab": "Mahran Shami Kabab masala — smooth, finely blended spices for soft and delicious shami kababs.\n\nمہران شامی کباب مصالحہ — نرم اور لذیذ شامی کباب کے لیے باریک پسا ہوا مصالحہ۔",
  "Mahran Paya": "Mahran Paya masala — the classic spice blend for slow-cooked, rich and gelatinous paya curry.\n\nمہران پائے مصالحہ — دھیمی آنچ پر پکنے والی بھرپور اور لذیذ پائے کی کڑاہی کے لیے۔",
  "Mahran Chat Masala": "Mahran Chat Masala — tangy, spicy, and zesty blend to elevate fruits, salads, and snacks.\n\nمہران چاٹ مصالحہ — پھلوں، سلاد اور سنیکس کو چٹ پٹا اور ذائقے دار بنانے کے لیے۔",
  // Everyday Grocery
  "Talbina": "Talbina — a wholesome barley-based Islamic superfood known for its nourishing and healing properties.\n\nتلبینہ — جو پر مبنی ایک غذائیت بخش اسلامی غذا جو اپنی شفاء بخش خصوصیات کے لیے مشہور ہے۔",
  "Oat Meal": "Premium rolled oats — a heart-healthy breakfast option, rich in fiber and slow-release energy.\n\naعلیٰ معیار کا اوٹ میل — فائبر سے بھرپور دل کی صحت کے لیے بہترین ناشتہ۔",
  "Kisan Dalia": "Kisan Dalia — wholesome cracked wheat porridge, a classic, nutritious Pakistani breakfast staple.\n\nکسان دلیہ — گندم کا غذائیت بخش دلیہ، روایتی پاکستانی ناشتے کی خاص پہچان۔",
  "Methi": "Dried fenugreek leaves (Methi) — adds a distinctive, slightly bitter aroma and flavor to curries.\n\nخشک میتھی کے پتے — سالن میں منفرد اور ہلکی تیز خوشبو اور ذائقہ شامل کرتے ہیں۔",
  // Tea
  "ISL Tea 1kg": "ISL Tea (1kg) — premium Pakistani tea leaves for a strong, bold brew with a rich golden color.\n\nآئی ایس ایل چائے (1 کلو) — مضبوط اور سنہری رنگت کی بہترین پاکستانی چائے۔",
  "ISL Tea 500gm": "ISL Tea (500gm) — strong, refreshing Pakistani tea with a distinctive aroma and full-bodied taste.\n\nآئی ایس ایل چائے (500 گرام) — مضبوط اور تازہ دم پاکستانی چائے، خوشبو اور ذائقے سے بھرپور۔",
  "ISL Tea 250gm": "ISL Tea (250gm) — the perfect starter pack of premium Pakistani tea for a strong, daily brew.\n\nآئی ایس ایل چائے (250 گرام) — روزمرہ کی مضبوط اور معیاری پاکستانی چائے کا بہترین چھوٹا پیک۔",
  "Tapal Tea 1kg": "Tapal Tea (1kg) — Pakistan's most loved tea brand. Rich flavor and a perfect, consistent brew every time.\n\nٹپال چائے (1 کلو) — پاکستان کا سب سے پسندیدہ چائے برانڈ۔ ہر بار بھرپور اور یکساں ذائقہ۔",
  "Tapal Tea 500gm": "Tapal Tea (500gm) — the iconic taste of Pakistan in every cup, bold and perfectly blended.\n\nٹپال چائے (500 گرام) — ہر کپ میں پاکستان کا مشہور ذائقہ، مضبوط اور بہترین مرکب۔",
  "Haizoom Tea 1kg": "Haizoom Tea (1kg) — a robust, full-bodied tea blend for a deeply satisfying and energizing brew.\n\nہیزوم چائے (1 کلو) — ایک مضبوط اور بھرپور چائے جو توانائی بخش اور تسلی دہ ہے۔",
  "Haizoom Tea 500gm": "Haizoom Tea (500gm) — strong and aromatic tea for those who love a bold, invigorating cup.\n\nہیزوم چائے (500 گرام) — مضبوط اور خوشبودار چائے، ان لوگوں کے لیے جو تیز چائے پسند کرتے ہیں۔",
  "Meezan Ultra Rich 5kg": "Meezan Ultra Rich Tea (5kg) — premium, ultra-rich tea blend for commercial and large household use.\n\nمیزان الٹرا رچ چائے (5 کلو) — تجارتی اور بڑے گھرانوں کے لیے اعلیٰ معیار کی الٹرا رچ چائے۔",
  "Tulip 5kg": "Tulip Tea (5kg) — a quality, economical bulk tea perfect for businesses, restaurants, and large families.\n\nٹیولپ چائے (5 کلو) — کاروبار، ریستورانوں اور بڑے خاندانوں کے لیے معیاری اور سستی بڑی پیکنگ۔",
  "Khulli Pati 1kg": "Khulli Pati loose leaf tea (1kg) — traditional, unblended loose tea leaves for an authentic strong brew.\n\nکھلی پتی چائے (1 کلو) — روایتی اور خالص کھلی چائے جو اصل اور مضبوط چائے کے لیے بہترین ہے۔"
};

db.serialize(() => {
  const products = [];

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
      products.push({
        name: row.product_name.trim(),
        category: row.category.trim(),
        price: parseFloat(row.price),
        stock: parseInt(row.stock) || 50,
      });
    })
    .on('end', () => {
      console.log(`\n📦 Found ${products.length} products to import\n`);

      db.all('SELECT id, name FROM categories', (err, rows) => {
        if (err) { console.error('❌', err); db.close(); return; }

        const categories = {};
        rows.forEach(row => { categories[row.name] = row.id; });

        console.log('✓ Categories loaded:', Object.keys(categories).join(', '), '\n');

        const stmt = db.prepare(
          'INSERT INTO products (name, category_id, price, stock, image_url, description, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, datetime("now"))'
        );

        let inserted = 0, skipped = 0;
        const errors = [];

        products.forEach((product, index) => {
          const categoryId = categories[product.category];
          if (!categoryId) {
            skipped++;
            errors.push(`Row ${index + 2}: Category "${product.category}" not found for "${product.name}"`);
            return;
          }

          const desc = descriptions[product.name] || '';

          stmt.run(product.name, categoryId, product.price, product.stock, '', desc, (err) => {
            if (err) {
              skipped++;
              errors.push(`${product.name}: ${err.message}`);
            } else {
              inserted++;
              console.log(`  ✓ ${product.name} → ${product.category} @ Rs.${product.price}`);
            }
          });
        });

        stmt.finalize(() => {
          setTimeout(() => {
            console.log('\n=== IMPORT RESULTS ===');
            console.log(`✓ Successfully imported: ${inserted} products`);
            if (skipped > 0) {
              console.log(`✗ Skipped: ${skipped}`);
              errors.forEach(e => console.log(`  ${e}`));
            }

            db.all('SELECT COUNT(*) as count FROM products', (err, result) => {
              if (!err) console.log(`\n📊 Total products in database: ${result[0].count}`);
              db.close();
            });
          }, 500);
        });
      });
    })
    .on('error', (err) => {
      console.error('❌ CSV read error:', err);
      db.close();
    });
});
