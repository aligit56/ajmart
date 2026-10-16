const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const legacyEditions = [
  {
    name: "Golden Pearl Leader Legacy Edition Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: null,
    description: "Golden Pearl Leader Legacy Edition Body Spray is a distinguished, ultra-long-lasting fragrance crafted for bold leaders. Premium edition with intense aromatic depth (200ml).\n\nگولڈن پرل لیڈر لیگیسی ایڈیشن باڈی اسپرے ایک منفرد، دیرپا اور پروقار خوشبو ہے جو خصوصی طور پر بااثر شخصیات کے لیے تیار کی گئی ہے۔ (200 ملی لیٹر)"
  },
  {
    name: "Golden Pearl Passion Legacy Edition Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: null,
    description: "Golden Pearl Passion Legacy Edition Body Spray offers a heightened, intoxicating blend of warm florals and deep amber notes. A luxurious legacy formulation (200ml).\n\nگولڈن پرل پیشن لیگیسی ایڈیشن باڈی اسپرے گرم پھولوں اور عنبر کا شاندار امتزاج ہے جو احساسات کو مسحور کن تازگی دیتا ہے۔ (200 ملی لیٹر)"
  },
  {
    name: "Golden Pearl Urge Legacy Edition Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: null,
    description: "Golden Pearl Urge Legacy Edition Body Spray features an enriched, sensual aromatic profile with enhanced projection and all-day endurance (200ml).\n\nگولڈن پرل ارج لیگیسی ایڈیشن باڈی اسپرے ایک دلکش اور متحرک خوشبو کا خصوصی ایڈیشن ہے جو سارا دن آپ کو تروتازہ رکھتا ہے۔ (200 ملی لیٹر)"
  },
  {
    name: "Golden Pearl Seduce Legacy Edition Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: null,
    description: "Golden Pearl Seduce Legacy Edition Body Spray presents a premium, intensified harmony of exotic oriental notes and sultry sweetness (200ml).\n\nگولڈن پرل سیڈیوس لیگیسی ایڈیشن باڈی اسپرے دلکش مشرقی خوشبو اور مٹھاس کا ایک پریمیم اور طاقتور ایڈیشن ہے۔ (200 ملی لیٹر)"
  }
];

db.serialize(() => {
  // 1. Update all standard Golden Pearl body sprays to Rs. 500 and remove variants
  db.run(`
    UPDATE Products
    SET price = 500, variants = NULL
    WHERE name LIKE '%Body Spray%' AND name NOT LIKE '%Legacy Edition%'
  `, function(err) {
    if (err) console.error("Error updating standard body sprays:", err.message);
    else console.log(`Updated ${this.changes} standard body sprays to Rs. 500.`);
  });

  // 2. Insert the 4 separate Legacy Edition cards if they don't already exist
  const insertStmt = db.prepare(`
    INSERT INTO Products (name, category_id, brand, price, stock, variants, description, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);

  legacyEditions.forEach(item => {
    db.get("SELECT id FROM Products WHERE name = ?", [item.name], (err, row) => {
      if (err) console.error(err);
      if (!row) {
        insertStmt.run(
          item.name,
          item.category_id,
          item.brand,
          item.price,
          item.stock,
          item.variants,
          item.description,
          function(err) {
            if (err) console.error("Error inserting", item.name, err.message);
            else console.log(`Inserted legacy card: ${item.name} (ID: ${this.lastID}) at Rs. 550`);
          }
        );
      } else {
        console.log(`Legacy edition already exists: ${item.name} (ID: ${row.id})`);
      }
    });
  });

  // Wait slightly before closing to let statements finish
  setTimeout(() => {
    insertStmt.finalize(() => {
      console.log("Body sprays update completed.");
      db.close();
    });
  }, 1000);
});
