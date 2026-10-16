const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const descriptions = {
  "Dall Chana": "Premium quality split chickpeas, carefully sorted and cleaned. Rich in protein and dietary fiber.\n\nاعلیٰ معیار کی دال چنا، جو پروٹین اور غذائی ریشے سے بھرپور اور احتیاط سے صاف کی گئی ہے۔",
  "Lobia Kapsool": "Large, premium quality red kidney beans. Perfect for hearty stews and traditional curries.\n\nبڑے اور اعلیٰ معیار کے سرخ لوبیا (کیپسول)۔ روایتی سالن اور مزیدار کھانوں کے لیے بہترین۔",
  "Dall Mong": "Fresh, premium split yellow mung beans. Easily digestible and quick to cook for everyday meals.\n\nتازہ اور صاف ستھری دال مونگ۔ جلد پکنے والی اور ہضم کرنے میں نہایت آسان۔",
  "Dall Masar": "Premium split red lentils. Cooks quickly to a creamy texture, perfect for traditional dishes.\n\nاعلیٰ معیار کی دال مسر۔ جو جلد پکتی ہے اور روایتی کھانوں کے لیے بہترین ہے۔",
  "Mota Chana": "Extra large, premium white chickpeas. Perfect for making delicious chole and traditional dishes.\n\nبڑے سائز کے سفید چنے۔ مزیدار چھولے اور روایتی پکوان بنانے کے لیے بہترین انتخاب۔",
  "Kala Masar": "Premium whole brown lentils. Rich in iron and fiber, ideal for traditional spicy curries.\n\nاعلیٰ معیار کی ثابت کالی دال مسر۔ آئرن اور فائبر سے بھرپور، روایتی سالن کے لیے بہترین۔",
  "Kala Mash": "Premium whole black gram. Highly nutritious and perfect for slow-cooked traditional recipes.\n\nاعلیٰ معیار کی ثابت کالی ماش۔ انتہائی غذائیت بخش اور روایتی کھانوں کے لیے موزوں۔",
  "Chana Bareek": "Small, premium quality white chickpeas. Ideal for snacking, roasting, or delicate curries.\n\nچھوٹے اور اعلیٰ معیار کے سفید چنے۔ سالن بنانے یا بھوننے کے لیے بہترین۔",
  "Mong Sabit": "Whole green mung beans. Packed with nutrients and perfect for sprouting or hearty soups.\n\nثابت ہری مونگ۔ غذائیت سے بھرپور اور صحت بخش کھانوں کے لیے بہترین۔",
  "Dall Mash": "Premium white split black gram. Essential for making traditional creamy lentils and pakoras.\n\nاعلیٰ معیار کی دھلی ہوئی دال ماش۔ روایتی کھانوں اور پکوڑے بنانے کے لیے ضروری۔",
  "Malka Sabit Masar": "Premium whole red lentils (Malka). Cooks to a perfect tender texture with rich flavor.\n\nاعلیٰ معیار کی ملکہ ثابت مسر۔ بہترین ذائقے اور نرم ساخت کے ساتھ جلد پکنے والی۔",
  "Kala Chana": "Premium whole black chickpeas. Extremely rich in protein and iron for a healthy diet.\n\nاعلیٰ معیار کے کالے چنے۔ آپ کی صحت مند غذا کے لیے پروٹین اور آئرن سے بھرپور۔",
  "Mong Chilka Dall": "Split green mung beans with husk. Highly nutritious and excellent for digestive health.\n\nچھلکے والی دال مونگ۔ انتہائی غذائیت بخش اور نظام انہضام کے لیے بہترین۔",
  "Lobia Chitri Red": "Premium speckled red kidney beans. Softens perfectly when cooked with a rich, buttery taste.\n\nاعلیٰ معیار کا چترا سرخ لوبیا۔ پکنے کے بعد نرم اور ذائقہ دار۔",
  "Lobia Desi Bareek": "Small, local variety of kidney beans. Fast cooking with an authentic traditional taste.\n\nدیسی باریک لوبیا۔ جلد پکنے والا اور روایتی ذائقے سے بھرپور۔",
  "Seela Supreme": "Highest quality Supreme Sella Basmati rice. Extra long grains that stay separate after cooking.\n\nاعلیٰ ترین کوالٹی کا سپریم سیلا چاول۔ لمبے دانے جو پکنے کے بعد الگ الگ رہتے ہیں۔",
  "Seela VIP": "VIP grade Sella rice. Perfect for making delicious biryani and pulao for special occasions.\n\nوی آئی پی سیلا چاول۔ خاص تقریبات میں مزیدار بریانی اور پلاؤ بنانے کے لیے بہترین۔",
  "Kainaat 1121 Special": "Special export-quality 1121 Kainaat Basmati. Exceptional aroma and extra-long grain length.\n\nسپیشل 1121 کائنات باسمتی چاول۔ بہترین خوشبو اور لمبے دانوں کے ساتھ شاندار معیار۔",
  "Kainaat 1121 Basmati": "Premium 1121 Kainaat Basmati rice. Aged perfectly for the ultimate taste and fluffiness.\n\nپریمیم 1121 کائنات باسمتی چاول۔ بہترین ذائقے اور خوشبو کے لیے خاص طور پر تیار کیا گیا۔",
  "Kainaat": "Standard Kainaat Basmati rice. Great quality and aroma for your everyday rice dishes.\n\nکائنات باسمتی چاول۔ روزمرہ کے کھانوں کے لیے بہترین معیار اور خوشبو۔",
  "Daghi Kainaat Rice 1121": "Slightly spotted but high-quality 1121 Kainaat rice. Excellent value with authentic taste.\n\nداغی کائنات 1121 چاول۔ مناسب قیمت میں بہترین ذائقہ اور معیار۔",
  "Short Grain Poona": "Premium short-grain Poona rice. Ideal for making sweet dishes like kheer and zarda.\n\nاعلیٰ معیار کا پونا چاول (چھوٹا دانہ)۔ کھیر، زردہ اور دیگر میٹھے پکوان کے لیے بہترین۔",
  "B-1 Tota": "High-quality broken Basmati rice (B-1). Perfect for daily cooking and traditional sweets.\n\nبہترین کوالٹی کا ٹوٹا چاول (B-1)۔ روزمرہ کے استعمال اور میٹھے پکوانوں کے لیے۔",
  "B-2 Tota": "Standard quality broken rice (B-2). Economical choice without compromising on natural taste.\n\nمعیاری ٹوٹا چاول (B-2)۔ قدرتی ذائقے کے ساتھ کم قیمت اور بہترین انتخاب۔",
  "Dalda Oil 1kg": "Premium Dalda cooking oil in a 1kg pouch. Fortified with vitamins for a healthy heart.\n\nڈالڈا کوکنگ آئل (1 کلو)۔ دل کی صحت کے لیے وٹامنز سے بھرپور پریمیم آئل۔",
  "Dalda Ghee 1kg": "Rich and flavorful Dalda banaspati ghee in a 1kg pouch. Gives food an authentic traditional taste.\n\nڈالڈا بناسپتی گھی (1 کلو)۔ کھانوں کو روایتی اور شاندار ذائقہ دینے والا بہترین گھی۔",
  "Oil Sufi 1kg": "Pure Sufi cooking oil (1kg). Light, healthy, and perfect for all your frying and cooking needs.\n\nصوفی کوکنگ آئل (1 کلو)۔ خالص اور ہلکا، جو آپ کے ہر طرح کے کھانوں کے لیے بہترین ہے۔",
  "Ghee Sufi 1kg": "Premium Sufi banaspati ghee (1kg). Enriched with vitamins for strong bones and healthy living.\n\nصوفی بناسپتی گھی (1 کلو)۔ ہڈیوں کی مضبوطی اور صحت مند زندگی کے لیے وٹامنز سے بھرپور۔",
  "ISL Oil 1kg": "ISL cooking oil (1kg). A high-quality, economical choice for your everyday cooking.\n\nآئی ایس ایل کوکنگ آئل (1 کلو)۔ روزمرہ کے کھانوں کے لیے ایک معیاری اور سستا انتخاب۔",
  "ISL Ghee 1kg": "ISL banaspati ghee (1kg). Delivers rich taste and aroma to your daily meals at a great price.\n\nآئی ایس ایل بناسپتی گھی (1 کلو)۔ مناسب قیمت میں کھانوں کو دے بہترین ذائقہ اور خوشبو۔",
  "Latif Oil 1kg": "Latif premium cooking oil (1kg). Carefully refined to bring out the best flavors in your food.\n\nلطیف کوکنگ آئل (1 کلو)۔ کھانوں کے بہترین ذائقے کو ابھارنے کے لیے خاص طور پر تیار کیا گیا۔",
  "Shahtaj Oil 1kg": "Shahtaj cooking oil (1kg). Light and nutritious, making your everyday meals healthier.\n\nشاہتاج کوکنگ آئل (1 کلو)۔ آپ کے روزمرہ کے کھانوں کو صحت بخش اور لذیذ بنانے کے لیے۔",
  "Shahtaj Ghee 1kg": "Shahtaj banaspati ghee (1kg). Smooth texture and classic aroma for perfect traditional cooking.\n\nشاہتاج بناسپتی گھی (1 کلو)۔ روایتی کھانوں کے لیے بہترین خوشبو اور ذائقہ۔",
  "Olive Soya Supreme": "Premium Olive Soya Supreme oil. A healthy blend perfect for conscious cooking and salads.\n\nاولیو سویا سپریم آئل۔ صحت بخش کھانوں اور سلاد کے لیے زیتون کا بہترین مرکب۔",
  "Soya Supreme 2.5kg Tin": "Soya Supreme cooking oil in a 2.5kg tin. Premium quality oil for deep frying and cooking.\n\nسویا سپریم کوکنگ آئل (2.5 کلو ٹین)۔ فرائنگ اور پکوان کے لیے پریمیم کوالٹی کا آئل۔",
  "Oil Bottle 5L": "High-quality cooking oil in a convenient 5-liter bottle. The perfect family-size cooking companion.\n\nکوکنگ آئل کی 5 لیٹر کی بوتل۔ بڑے خاندان کی ضروریات کے لیے بہترین اور معیاری انتخاب۔",
  "Oil Bottle 3L": "High-quality cooking oil in a 3-liter bottle. Premium refinement for healthy everyday meals.\n\nکوکنگ آئل کی 3 لیٹر کی بوتل۔ روزمرہ کے صحت بخش کھانوں کے لیے بہترین کوالٹی کا آئل۔"
};

db.serialize(() => {
  // Update all stock to 50
  db.run(`UPDATE products SET stock = 50`, function(err) {
    if (err) {
      console.error(err);
    } else {
      console.log(`Updated stock to 50 for ${this.changes} products.`);
    }
  });

  // Update descriptions
  const stmt = db.prepare(`UPDATE products SET description = ? WHERE name = ?`);
  
  for (const [name, desc] of Object.entries(descriptions)) {
    stmt.run(desc, name, function(err) {
      if (err) {
        console.error(`Error updating ${name}:`, err);
      }
    });
  }

  stmt.finalize(() => {
    console.log("Finished updating descriptions.");
    db.close();
  });
});
