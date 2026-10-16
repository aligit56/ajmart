const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 1. Add brand column if not exists
  db.run("ALTER TABLE Products ADD COLUMN brand TEXT DEFAULT 'AJ Brand'", (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('brand column already exists');
      } else {
        console.error('Error adding brand column:', err.message);
      }
    } else {
      console.log('brand column added successfully');
    }
  });

  // 2. Map of existing products to their specific brand
  const brandMappings = [
    // Oil and Ghee
    { match: /dalda/i, brand: 'Dalda' },
    { match: /soya supreme/i, brand: 'Soya Supreme' },
    { match: /sufi (oil|ghee|detergent|soap|vermicelli|classic)/i, brand: 'Sufi' },
    { match: /^isl/i, brand: 'ISL' },
    { match: /latif/i, brand: 'Latif' },
    { match: /shahtaj/i, brand: 'Shahtaj' },

    // Spices
    { match: /^shan /i, brand: 'Shan' },
    { match: /^national /i, brand: 'National' },
    { match: /^mahran /i, brand: 'Mehran' },

    // Everyday Grocery
    { match: /kisan/i, brand: 'Kisan' },

    // Tea
    { match: /tapal/i, brand: 'Tapal' },
    { match: /haizoom/i, brand: 'Haizoom' },
    { match: /meezan/i, brand: 'Meezan' },
    { match: /tulip/i, brand: 'Tulip' },

    // Cleaning and Laundry
    { match: /^brite/i, brand: 'Brite' },
    { match: /^express/i, brand: 'Express' },
    { match: /^bonus/i, brand: 'Bonus' },
    { match: /bahu/i, brand: 'Bahu' },

    // Household
    { match: /^max /i, brand: 'Max' },
    { match: /^safoon /i, brand: 'Safoon' },
    { match: /scotch brite/i, brand: 'Scotch-Brite' },

    // Personal Care
    { match: /lifeboy/i, brand: 'Lifebuoy' },
    { match: /sunsilk/i, brand: 'Sunsilk' },
    { match: /tresme/i, brand: 'TRESemmé' },
    { match: /loreal/i, brand: 'L\'Oréal' },
    { match: /bio amla/i, brand: 'Bio Amla' },
    { match: /vatika/i, brand: 'Vatika' },
    { match: /hello hair/i, brand: 'Hello Hair' },
    { match: /mclay/i, brand: 'Mclay' },
    { match: /head & shoulders/i, brand: 'Head & Shoulders' },
    { match: /pantene/i, brand: 'Pantene' },
    { match: /tibet/i, brand: 'Tibet' },
    { match: /palmolive/i, brand: 'Palmolive' },
    { match: /safeguard/i, brand: 'Safeguard' },
    { match: /capri/i, brand: 'Capri' },
    { match: /lux/i, brand: 'Lux' },
    { match: /laar/i, brand: 'Laar' },
    { match: /door/i, brand: 'Door' },
    { match: /dove/i, brand: 'Dove' },

    // Noodles and Macaronis
    { match: /knorr/i, brand: 'Knorr' },
    { match: /indomie/i, brand: 'Indomie' },
    { match: /bake parlor/i, brand: 'Bake Parlor' },
    { match: /mario/i, brand: 'Mario\'s' },
    { match: /elfin/i, brand: 'Elfin' },
    { match: /golden macroni/i, brand: 'Golden' }
  ];

  db.all("SELECT id, name FROM Products", (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }

    const updateStmt = db.prepare("UPDATE Products SET brand = ? WHERE id = ?");
    rows.forEach(prod => {
      let assignedBrand = 'AJ Brand';
      for (const mapping of brandMappings) {
        if (mapping.match.test(prod.name)) {
          assignedBrand = mapping.brand;
          break;
        }
      }
      updateStmt.run(assignedBrand, prod.id);
    });
    updateStmt.finalize(() => {
      console.log('All existing products updated with their brands.');
    });

    // 3. New Cosmetics products to add
    const cosmeticsProducts = [
      // Golden Pearl Lotions (100ml: 240, 200ml: 440)
      {
        name: "Golden Pearl Healthy White Advance Care Lotion",
        category_id: 6,
        brand: "Golden Pearl",
        price: 240,
        stock: 35,
        variants: JSON.stringify([
          { name: "100ml", price: 240 },
          { name: "200ml", price: 440 }
        ]),
        description: "Golden Pearl Healthy White Advance Care Lotion is specially formulated with multivitamins and triple sunscreen to brighten skin and protect against UV damage. Keeps skin soft, radiant, and hydrated all day long.\n\nگولڈن پرل ہیلتھی وائٹ ایڈوانس کیئر لوشن ملٹی وٹامنز اور سن اسکرین کے ساتھ جلد کو قدرتی نکھار اور سورج کی شعاعوں سے تحفظ فراہم کرتا ہے۔ دن بھر جلد کو نرم، چمکدار اور تروتازہ رکھے۔"
      },
      {
        name: "Golden Pearl Cocoa Touch Advance Care Lotion",
        category_id: 6,
        brand: "Golden Pearl",
        price: 240,
        stock: 35,
        variants: JSON.stringify([
          { name: "100ml", price: 240 },
          { name: "200ml", price: 440 }
        ]),
        description: "Golden Pearl Cocoa Touch Advance Care Lotion deeply nourishes dry skin with rich cocoa butter and Vitamin E. Restores skin elasticity, leaving a warm cocoa scent and velvety-smooth texture.\n\nگولڈن پرل کوکو ٹچ ایڈوانس کیئر لوشن خالص کوکو بٹر اور وٹامن ای سے بھرپور خشک جلد کو گہری نمی بخشتا ہے اور جلد کو ملائم اور خوشبودار بناتا ہے۔"
      },
      {
        name: "Golden Pearl Aloe Magic Advance Care Lotion",
        category_id: 6,
        brand: "Golden Pearl",
        price: 240,
        stock: 35,
        variants: JSON.stringify([
          { name: "100ml", price: 240 },
          { name: "200ml", price: 440 }
        ]),
        description: "Golden Pearl Aloe Magic Advance Care Lotion combines natural Aloe Vera extract and soothing moisturizers to calm irritated skin and replenish lost moisture with a light, non-greasy feel.\n\nگولڈن پرل ایلو میجک ایڈوانس کیئر لوشن قدرتی ایلو ویرا کے ساتھ جلد کو فوری ٹھنڈک، نمی اور سکون بخشتا ہے، بغیر کسی چپچپاہٹ کے۔"
      },
      {
        name: "Golden Pearl Honey & Almond Advance Care Lotion",
        category_id: 6,
        brand: "Golden Pearl",
        price: 240,
        stock: 35,
        variants: JSON.stringify([
          { name: "100ml", price: 240 },
          { name: "200ml", price: 440 }
        ]),
        description: "Golden Pearl Honey & Almond Advance Care Lotion provides intense nourishment for dry and winter-damaged skin with the natural goodness of pure honey and almond oil.\n\nگولڈن پرل ہنی اینڈ المنڈ ایڈوانس کیئر لوشن شہد اور بادام کے تیل کے قدرتی اجزاء سے جلد کو سردیوں کے موسم میں خشک ہونے سے بچاتا ہے اور گہری غذائیت فراہم کرتا ہے۔"
      },
      {
        name: "Golden Pearl Skin Lightening Advance Care Lotion",
        category_id: 6,
        brand: "Golden Pearl",
        price: 240,
        stock: 35,
        variants: JSON.stringify([
          { name: "100ml", price: 240 },
          { name: "200ml", price: 440 }
        ]),
        description: "Golden Pearl Skin Lightening Advance Care Lotion helps reduce dark spots, even out skin tone, and restore healthy radiance with an advanced brightening formula.\n\nگولڈن پرل سکن لائٹننگ ایڈوانس کیئر لوشن داغ دھبوں کو ہلکا کرنے اور رنگت کو صاف و شفاف بنانے میں مدد کرتا ہے، جس سے جلد پرکشش اور چمکدار لگتی ہے۔"
      },

      // Care Moisturizing Lotion (Small: 250, Big: 500)
      {
        name: "Care Moisturizing Lotion",
        category_id: 6,
        brand: "Care",
        price: 250,
        stock: 45,
        variants: JSON.stringify([
          { name: "Small", price: 250 },
          { name: "Big", price: 500 }
        ]),
        description: "Care Deep Moisturizing Honey Lotion is Pakistan's trusted daily skincare lotion. Enriched with natural honey and moisturizers, it penetrates deep into the skin to prevent dryness and maintain softness.\n\nکیئر موئسچرائزنگ ہنی لوشن پاکستان کا مقبول ترین لوشن ہے۔ خالص شہد کے قدرتی خواص سے جلد کی خشکی کو ختم کر کے نرم و ملائم بناتا ہے۔"
      },

      // Ponds Moisturizing Lotion (Small: 300, Big: 600)
      {
        name: "Ponds Moisturizing Body Lotion",
        category_id: 6,
        brand: "Ponds",
        price: 300,
        stock: 40,
        variants: JSON.stringify([
          { name: "Small", price: 300 },
          { name: "Big", price: 600 }
        ]),
        description: "Ponds Moisturizing Body Lotion gives your skin a silky smooth touch with long-lasting hydration. Fast-absorbing, lightweight, and delightfully scented for everyday glow.\n\nپونڈز موئسچرائزنگ باڈی لوشن جلد کو ریشمی ملائمت اور طویل مدتی نمی دیتا ہے۔ ہلکا، جلد جذب ہونے والا اور خوشگوار خوشبو والا لوشن۔"
      },

      // Oils - Hello Hair 200ml at Rs. 450 each
      {
        name: "Hello Hair 10 Natural Herbal Hair Oil",
        category_id: 6,
        brand: "Hello Hair",
        price: 450,
        stock: 30,
        variants: JSON.stringify([
          { name: "200ml", price: 450 }
        ]),
        description: "Hello Hair 10 Natural Herbal Hair Oil combines 10 potent herbal extracts to combat hair fall, strengthen roots, prevent dandruff, and promote lustrous hair growth (200ml).\n\nہیلو ہیئر 10 نیچرل ہربل آئل 10 طاقتور جڑی بوٹیوں سے تیار کردہ ہے جو بالوں کے گرنے کو روکتا ہے، خشکی ختم کرتا ہے اور بالوں کو لمبا اور گھنا بناتا ہے۔"
      },
      {
        name: "Hello Hair Coconut Hair Oil",
        category_id: 6,
        brand: "Hello Hair",
        price: 450,
        stock: 30,
        variants: JSON.stringify([
          { name: "200ml", price: 450 }
        ]),
        description: "Hello Hair Pure Coconut Hair Oil penetrates deep into the hair shaft to restore moisture, prevent breakage, and add brilliant natural shine (200ml).\n\nہیلو ہیئر کوکونٹ ہیئر آئل ناریل کے خالص اجزاء کے ساتھ بالوں کو جڑوں سے مضبوط بناتا ہے اور شاندار قدرتی چمک بخشتا ہے۔"
      },
      {
        name: "Hello Hair Almond Hair Oil",
        category_id: 6,
        brand: "Hello Hair",
        price: 450,
        stock: 30,
        variants: JSON.stringify([
          { name: "200ml", price: 450 }
        ]),
        description: "Hello Hair Almond Hair Oil enriched with Vitamin E conditions dry scalp, softens coarse hair strands, and reduces split ends for smooth and manageable hair (200ml).\n\nہیلو ہیئر بادام کا تیل وٹامن ای سے بھرپور ہے جو خشک سر کو نمی فراہم کرتا ہے، بالوں کو نرم و ملائم بناتا ہے اور دو منہ والے بالوں کو ٹھیک کرتا ہے۔"
      },
      {
        name: "Hello Hair Onion Herbal Hair Oil",
        category_id: 6,
        brand: "Hello Hair",
        price: 450,
        stock: 30,
        variants: JSON.stringify([
          { name: "200ml", price: 450 }
        ]),
        description: "Hello Hair Onion Herbal Hair Oil is rich in sulfur and antioxidants, revitalizing dormant hair follicles, controlling hair fall, and accelerating hair density (200ml).\n\nہیلو ہیئر پیاز ہربل آئل سلفر اور اینٹی آکسیڈنٹس سے بھرپور ہے جو بالوں کے گرنے کو فوری روکتا ہے اور نئے بال اگانے میں مدد دیتا ہے۔"
      },
      {
        name: "Hello Hair Argan Hair Oil",
        category_id: 6,
        brand: "Hello Hair",
        price: 450,
        stock: 30,
        variants: JSON.stringify([
          { name: "200ml", price: 450 }
        ]),
        description: "Hello Hair Argan Hair Oil deeply hydrates frizzy and heat-damaged hair, sealing in moisture and leaving locks smooth, glossy, and untangled (200ml).\n\nہیلو ہیئر آرگن ہیئر آئل بالوں کی الجھن اور بے رونقی کو ختم کر کے انہیں ریشم جیسا نرم، چمکدار اور پرکشش بناتا ہے۔"
      },
      {
        name: "Hello Hair Garlic Hair Oil",
        category_id: 6,
        brand: "Hello Hair",
        price: 450,
        stock: 30,
        variants: JSON.stringify([
          { name: "200ml", price: 450 }
        ]),
        description: "Hello Hair Garlic Hair Oil harnesses the antimicrobial and nutrient-rich power of garlic extract to purify the scalp, reinforce hair roots, and stop hair thinning (200ml).\n\nہیلو ہیئر لہسن کا تیل جراثیم کش اور غذائیت سے بھرپور لہسن کے عرق سے سر کی جلد کو صاف کرتا ہے اور جڑوں کو مضبوط بنا کر گرنے سے روکتا ہے۔"
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO Products (name, category_id, brand, price, stock, variants, description, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    cosmeticsProducts.forEach(item => {
      insertStmt.run(
        item.name,
        item.category_id,
        item.brand,
        item.price,
        item.stock,
        item.variants,
        item.description,
        function(err) {
          if (err) console.error('Error inserting', item.name, err.message);
          else console.log(`Inserted: ${item.name} (Brand: ${item.brand}, ID: ${this.lastID})`);
        }
      );
    });

    insertStmt.finalize(() => {
      console.log('All cosmetics products successfully inserted.');
      db.close();
    });
  });
});
