const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const newProducts = [
  // --- BODY SPRAYS (GOLDEN PEARL) ---
  {
    name: "Golden Pearl Romance Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: null,
    description: "Golden Pearl Romance Body Spray offers an enchanting floral and romantic fragrance that keeps you feeling fresh, confident, and captivating all day long (200ml).\n\nگولڈن پرل رومانس باڈی اسپرے دلکش پھولوں کی خوشبو کے ساتھ آپ کو دن بھر تروتازہ، پراعتماد اور پرکشش احساس دلاتا ہے۔"
  },
  {
    name: "Golden Pearl Attraction Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: null,
    description: "Golden Pearl Attraction Body Spray is crafted with an irresistible magnetic aroma that commands attention and leaves a lasting impression (200ml).\n\nگولڈن پرل اٹریکشن باڈی اسپرے پرکشش اور جادوئی خوشبو کا حامل ہے جو ہر محفل میں آپ کو نمایاں اور پرکشش بناتا ہے۔"
  },
  {
    name: "Golden Pearl Blue Yacht Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: null,
    description: "Golden Pearl Blue Yacht Body Spray delivers an invigorating aquatic and oceanic breeze, ideal for active lifestyles and hot summer days (200ml).\n\nگولڈن پرل بلیو یاٹ باڈی اسپرے سمندری لہروں جیسی ٹھنڈک اور تازگی بخش خوشبو کے ساتھ سارا دن توانائی فراہم کرتا ہے۔"
  },
  {
    name: "Golden Pearl Flirt Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: null,
    description: "Golden Pearl Flirt Body Spray features a playful, sweet, and lively fragrance designed to uplift your mood and keep unwanted odors at bay (200ml).\n\nگولڈن پرل فلرٹ باڈی اسپرے شوخ، میٹھی اور پرمسرت خوشبو کے ساتھ آپ کے موڈ کو خوشگوار اور تروتازہ رکھتا ہے۔"
  },
  {
    name: "Golden Pearl Golden Touch Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: null,
    description: "Golden Pearl Golden Touch Body Spray provides a rich, luxurious fragrance with warm amber and subtle spicy notes for an exquisite signature scent (200ml).\n\nگولڈن پرل گولڈن ٹچ باڈی اسپرے عنبر اور مسالاجات کے امتزاج سے تیار کردہ پروقار اور شاہانہ خوشبو پیش کرتا ہے۔"
  },
  {
    name: "Golden Pearl Leader Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: JSON.stringify([
      { name: "Standard Edition", price: 550 },
      { name: "Legacy Edition", price: 550 }
    ]),
    description: "Golden Pearl Leader Body Spray exudes bold charisma, authority, and masculine refinement. Available in Standard and Legacy Editions for long-lasting sophistication (200ml).\n\nگولڈن پرل لیڈر باڈی اسپرے وقار، اعتماد اور اثر انگیز خوشبو کا شاہکار ہے۔ اسٹینڈرڈ اور لیگیسی ایڈیشن میں دستیاب۔"
  },
  {
    name: "Golden Pearl Oud Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: null,
    description: "Golden Pearl Oud Body Spray delivers deep, oriental woody notes of premium agarwood oud. Highly enduring and traditionally prestigious (200ml).\n\nگولڈن پرل عود باڈی اسپرے خالص عود اور مشرقی لکڑیوں کی گہری اور دیرپا خوشبو کے ساتھ روایتی وقار بخشتا ہے۔"
  },
  {
    name: "Golden Pearl Charge Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: null,
    description: "Golden Pearl Charge Body Spray is an intense burst of citrus and spicy freshness designed to power your day with non-stop active protection (200ml).\n\nگولڈن پرل چارج باڈی اسپرے لیموں اور مسالاجات کی تیز اور پرجوش تازگی دیتا ہے جو آپ کو ہر لمحہ چست رکھتا ہے۔"
  },
  {
    name: "Golden Pearl Passion Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: JSON.stringify([
      { name: "Standard Edition", price: 550 },
      { name: "Legacy Edition", price: 550 }
    ]),
    description: "Golden Pearl Passion Body Spray blends passionate floral warmth with vibrant notes to awaken the senses. Available in Standard and Legacy Editions (200ml).\n\nگولڈن پرل پیشن باڈی اسپرے پرجوش پھولوں اور مسحور کن خوشبو کے ساتھ احساسات کو تازگی بخشتا ہے۔ اسٹینڈرڈ اور لیگیسی ایڈیشن میں دستیاب۔"
  },
  {
    name: "Golden Pearl Dark Energy Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: null,
    description: "Golden Pearl Dark Energy Body Spray features a mysterious, musky, and masculine depth, formulated for nocturnal elegance and night-long freshness (200ml).\n\nگولڈن پرل ڈارک انرجی باڈی اسپرے پر اسرار اور مسکی خوشبو کے ساتھ رات کی محفلوں اور دیرپا تازگی کے لیے بہترین ہے۔"
  },
  {
    name: "Golden Pearl Urge Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: JSON.stringify([
      { name: "Standard Edition", price: 550 },
      { name: "Legacy Edition", price: 550 }
    ]),
    description: "Golden Pearl Urge Body Spray presents a sensuous and dynamic fragrance that keeps body odor away with premium aromatic notes. Available in Standard and Legacy Editions (200ml).\n\nگولڈن پرل ارج باڈی اسپرے دلکش اور متحرک خوشبو جو پسینے کی بو کو دور بھگاتی ہے۔ اسٹینڈرڈ اور لیگیسی ایڈیشن میں دستیاب۔"
  },
  {
    name: "Golden Pearl Seduce Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: JSON.stringify([
      { name: "Standard Edition", price: 550 },
      { name: "Legacy Edition", price: 550 }
    ]),
    description: "Golden Pearl Seduce Body Spray captivates with a seductive harmony of spicy oriental accords and gentle sweetness. Available in Standard and Legacy Editions (200ml).\n\nگولڈن پرل سیڈیوس باڈی اسپرے مسحور کن مشرقی خوشبو اور لطیف مٹھاس کا دلکش امتزاج ہے۔ اسٹینڈرڈ اور لیگیسی ایڈیشن میں دستیاب۔"
  },
  {
    name: "Golden Pearl Soldier Body Spray",
    category_id: 6,
    brand: "Golden Pearl",
    price: 550,
    stock: 30,
    variants: null,
    description: "Golden Pearl Soldier Body Spray is a rugged, robust, and athletic fragrance built for extreme resilience and relentless all-day freshness (200ml).\n\nگولڈن پرل سولجر باڈی اسپرے سخت محنت اور کھیل کود کے شوقین افراد کے لیے ایک طاقتور اور دیرپا خوشبو فراہم کرتا ہے۔"
  },

  // --- CREAMS ---
  {
    name: "Golden Pearl Beauty Cream",
    category_id: 6,
    brand: "Golden Pearl",
    price: 360,
    stock: 40,
    variants: null,
    description: "Golden Pearl Beauty Cream is Pakistan's premier whitening and nourishing face cream. Clears dark spots, acne marks, and uneven pigmentation to reveal glowing, clear skin.\n\nگولڈن پرل بیوٹی کریم پاکستان کی سب سے مشہور رنگ گورا کرنے والی اور جلد کو نکھارنے والی کریم ہے۔ داغ دھبے اور چھائیاں دور کر کے جلد کو صاف و شفاف بنائے۔"
  },
  {
    name: "Fair & Lovely Face Cream Tube",
    category_id: 6,
    brand: "Fair & Lovely",
    price: 150,
    stock: 50,
    variants: null,
    description: "Fair & Lovely (Glow & Lovely) Advanced Multivitamin Face Cream Tube provides high definition glow, sun protection, and skin tone brightening in a convenient portable tube.\n\nفیئر اینڈ لولی ملٹی وٹامن فیس کریم ٹیوب چہرے کو چمکدار نکھار، دھوپ سے حفاظت اور ہموار رنگت فراہم کرتی ہے، با آسانی کہیں بھی ساتھ لے جائیں۔"
  },
  {
    name: "Tibet Snow Cream",
    category_id: 6,
    brand: "Tibet",
    price: 230,
    stock: 35,
    variants: null,
    description: "Tibet Snow Cream is the legendary time-tested vanishing cream that keeps the skin oil-free, smooth, and fair while tightening pores and refreshing the complexion.\n\nتبت سنو کریم دہائیوں سے آزمودہ وینشنگ کریم ہے جو جلد سے اضافی تیل ختم کرتی ہے، مساموں کو بند کرتی ہے اور چہرے کو ٹھنڈک اور نکھار دیتی ہے۔"
  },
  {
    name: "Tibet Cold Cream",
    category_id: 6,
    brand: "Tibet",
    price: 250,
    stock: 35,
    variants: null,
    description: "Tibet Cold Cream provides deep hydration and intensive nourishment for dry and chapped skin, protecting your face against harsh winter dryness.\n\nتبت کولڈ کریم خشک اور کھردری جلد کے لیے گہری نمی اور غذائیت فراہم کرتی ہے اور سردیوں کے موسم میں چہرے کو خشکی سے محفوظ رکھتی ہے۔"
  }
];

db.serialize(() => {
  const insertStmt = db.prepare(`
    INSERT INTO Products (name, category_id, brand, price, stock, variants, description, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);

  newProducts.forEach((item) => {
    insertStmt.run(
      item.name,
      item.category_id,
      item.brand,
      item.price,
      item.stock,
      item.variants,
      item.description,
      function (err) {
        if (err) {
          console.error('Error inserting', item.name, err.message);
        } else {
          console.log(`Inserted: ${item.name} (Brand: ${item.brand}, ID: ${this.lastID})`);
        }
      }
    );
  });

  insertStmt.finalize(() => {
    console.log('All body sprays and creams successfully added.');
    db.close();
  });
});
