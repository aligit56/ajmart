const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

const descriptions = {
  86: "Brite washing powder removes tough stains and brings a bright shine to your clothes. Suitable for both hand and machine wash.\n\nبرائٹ واشنگ پاؤڈر ضدی داغوں کو ہٹاتا ہے اور آپ کے کپڑوں میں چمک لاتا ہے۔ ہاتھ اور مشین دونوں کی دھلائی کے لیے موزوں ہے۔",
  87: "Express washing powder offers deep cleaning action for a fresh and bright laundry experience.\n\nایکسپریس واشنگ پاؤڈر کپڑوں کی گہرائی سے صفائی کرتا ہے، جس سے آپ کے کپڑے ہر دھلائی کے بعد نئے جیسے لگتے ہیں۔",
  88: "Bonus detergent gives you the best cleaning value, making your clothes spotless and fresh.\n\nبونس سرف بہترین صفائی فراہم کرتا ہے، جو آپ کے کپڑوں کو بے داغ اور خوشبودار بناتا ہے۔",
  89: "Sufi Detergent provides powerful cleaning with a refreshing fragrance, caring for your fabric.\n\nصوفی ڈیٹرجنٹ کپڑوں کی حفاظت کے ساتھ طاقتور صفائی اور تازگی بخش خوشبو فراہم کرتا ہے۔",
  90: "Surf Aj delivers excellent wash quality, removing hidden dirt for a brilliant clean.\n\nسرف اے جے بہترین کوالٹی کے ساتھ کپڑوں کی صفائی کرتا ہے اور چھپی ہوئی گندگی کو نکالتا ہے۔",
  91: "Sufi Soap Cloth is a high-quality washing soap for effectively cleaning heavy stains on clothes.\n\nصوفی سوپ کلاتھ کپڑوں کے ضدی داغوں کو مؤثر طریقے سے صاف کرنے کے لیے ایک اعلیٰ معیار کا صابن ہے۔",
  92: "Sufi Vermicelli Cloth Soap is a premium laundry soap designed for tough cleaning on everyday fabrics.\n\nصوفی سویاں کلاتھ سوپ روزمرہ کے کپڑوں کی بہترین اور گہری صفائی کے لیے ایک پریمیم صابن ہے۔",
  93: "Bahu Soap Cloth effectively tackles dirt and stains, keeping your laundry clean and fresh.\n\nبہو کپڑے دھونے کا صابن میل اور داغوں کو صاف کر کے کپڑوں کو چمکدار بناتا ہے۔",
  94: "Max Liquid Dishwash removes tough grease and leaves your dishes sparkling clean with a pleasant scent.\n\nمیکس لکوئیڈ ڈش واش چکنائی کو جڑ سے ختم کرتا ہے اور آپ کے برتنوں کو چمکدار اور خوشبودار بناتا ہے۔",
  95: "Max Paste provides concentrated cleaning power for heavily soiled pots and pans.\n\nمیکس پیسٹ سخت چکنائی اور جلے ہوئے برتنوں کی صفائی کے لیے بہترین ہے۔",
  96: "Safoon Dish Wash easily cuts through grease, ensuring a flawless shine for all your kitchenware.\n\nسافون ڈش واش چکنائی کو آسانی سے کاٹتا ہے اور آپ کے تمام برتنوں کو بے داغ چمک دیتا ہے۔",
  97: "Aj Dish Washer is a powerful formula that keeps your dishes perfectly clean and hygienic.\n\nاے جے ڈش واشر ایک طاقتور فارمولہ ہے جو آپ کے برتنوں کو مکمل طور پر صاف اور جراثیم سے پاک رکھتا ہے۔",
  98: "Scotch Brite sponge scourer makes dishwashing faster and easier without scratching surfaces.\n\nاسکاچ برائٹ برتن دھونے کو تیز اور آسان بناتا ہے اور برتنوں پر خراشیں نہیں آنے دیتا۔",
  99: "Spiral scourer is perfect for tough scrubbing on heavy duty pots and grills.\n\nاسپائرل کھرچنی سخت برتنوں اور گرلز کی صفائی کے لیے بہترین ہے۔",
  100: "Max Long Bar dishwash soap offers long-lasting cleaning for your everyday dishwashing needs.\n\nمیکس لانگ بار ڈش واش صابن آپ کے روزمرہ کے برتن دھونے کے لیے دیرپا صفائی فراہم کرتا ہے۔",
  101: "Max 35 is a convenient and effective dishwash bar for spotless utensils.\n\nمیکس 35 برتنوں کی چمکدار صفائی کے لیے ایک بہترین اور مؤثر ڈش واش بار ہے۔",
  102: "Max 60 provides excellent grease-cutting power in a compact dishwash bar.\n\nمیکس 60 ڈش واش بار بہترین چکنائی صاف کرنے کی طاقت رکھتا ہے۔",
  103: "Max 105 is a premium dishwashing bar that lasts longer and cleans better.\n\nمیکس 105 ایک پریمیم ڈش واشنگ بار ہے جو زیادہ دیر چلتا ہے اور بہتر صفائی کرتا ہے۔",
  104: "Max Longbar Double ensures double the cleaning power for large families and heavy usage.\n\nمیکس لانگ بار ڈبل بڑے خاندانوں اور زیادہ استعمال کے لیے دگنی صفائی کی طاقت فراہم کرتا ہے۔",
  105: "Safoon Longbar offers effective cleaning with a formula that is tough on grease but gentle on hands.\n\nسافون لانگ بار ایک ایسا فارمولہ ہے جو چکنائی پر سخت مگر ہاتھوں پر نرم ہے۔",
  106: "Lifebuoy Shampoo strengthens hair and promotes healthy growth, leaving your hair thick and strong.\n\nلائف بوائے شیمپو بالوں کو مضبوط بناتا ہے اور انہیں گھنا اور صحت مند رکھتا ہے۔",
  107: "Sunsilk Shampoo provides customized nourishment for silky, smooth, and manageable hair.\n\nسن سلک شیمپو بالوں کو نرم، ملائم اور سلجھا ہوا رکھنے کے لیے بہترین پرورش فراہم کرتا ہے۔",
  108: "Tresemme Shampoo brings salon-quality care to your home, leaving hair smooth and frizz-free.\n\nٹریسیمے شیمپو آپ کے بالوں کو پارلر جیسی خوبصورتی دیتا ہے، انہیں نرم اور سیدھا رکھتا ہے۔",
  109: "Loreal Shampoo offers advanced hair care solutions for repairing and protecting your hair.\n\nلوریال شیمپو بالوں کی مرمت اور حفاظت کے لیے جدید ترین فارمولہ پیش کرتا ہے۔",
  110: "Bio Amla Shampoo is enriched with natural herbal extracts to keep hair dark, long, and strong.\n\nبائیو آملہ شیمپو قدرتی جڑی بوٹیوں سے مالا مال ہے جو بالوں کو کالا، لمبا اور مضبوط بناتا ہے۔",
  111: "Vatika Shampoo combines natural ingredients to deeply nourish the scalp and hair.\n\nواٹیکا شیمپو قدرتی اجزاء سے مل کر بالوں اور سر کی جلد کو گہری پرورش دیتا ہے۔",
  112: "Hello Hair Shampoo cleanses gently while providing essential nutrients for a healthy shine.\n\nہیلو ہیئر شیمپو بالوں کی نرمی سے صفائی کرتا ہے اور انہیں چمکدار بناتا ہے۔",
  113: "Mclay Shampoo provides an ultimate hair care experience, leaving hair voluminous and soft.\n\nمیکلے شیمپو بالوں کو گھنا اور نرم بنانے کے لیے ایک بہترین شیمپو ہے۔",
  114: "Head & Shoulders effectively removes dandruff, keeping your scalp clean and fresh all day.\n\nہیڈ اینڈ شولڈرز خشکی کو مؤثر طریقے سے ختم کرتا ہے اور سر کی جلد کو تازہ رکھتا ہے۔",
  115: "Pantene Shampoo deeply hydrates and repairs damaged hair from root to tip.\n\nپینٹین شیمپو خراب بالوں کی جڑ سے سرے تک مرمت کرتا ہے اور انہیں نمی بخشتا ہے۔",
  116: "Mclay Conditioner perfectly complements your shampoo, making hair detangled, soft, and easy to style.\n\nمیکلے کنڈیشنر بالوں کو نرم، سلجھا ہوا اور اسٹائل کرنے میں آسان بناتا ہے۔",
  117: "Lifebuoy Soap provides 100% stronger germ protection for you and your family.\n\nلائف بوائے صابن آپ اور آپ کے خاندان کے لیے جراثیم سے 100٪ بہتر تحفظ فراہم کرتا ہے۔",
  118: "Tibet Soap brings classic skincare with a beautiful lingering fragrance.\n\nتبت صابن کلاسک سکن کیئر اور دیرپا خوشبو کے ساتھ آپ کی جلد کو نرم رکھتا ہے۔",
  119: "Palmolive Soap is enriched with natural extracts to keep your skin moisturized and glowing.\n\nپامولیو صابن قدرتی اجزاء کے ساتھ آپ کی جلد کو نرم اور چمکدار بناتا ہے۔",
  120: "Safeguard Soap offers excellent antibacterial protection with a fresh, clean scent.\n\nسیف گارڈ صابن بہترین اینٹی بیکٹیریل تحفظ اور تازگی بخش خوشبو فراہم کرتا ہے۔",
  121: "Capri Soap gently cleanses while leaving a captivating and luxurious fragrance on your skin.\n\nکیپری صابن نرمی سے صفائی کرتا ہے اور آپ کی جلد پر ایک دلکش خوشبو چھوڑتا ہے۔",
  122: "Lux Soap gives you soft, glowing skin with the enchanting scent of fine fragrances.\n\nلکس صابن آپ کو نرم اور چمکدار جلد کے ساتھ ایک دلفریب خوشبو دیتا ہے۔",
  123: "Sufi Classic Soap is a trusted beauty soap for naturally beautiful and clear skin.\n\nصوفی کلاسک صابن قدرتی طور پر خوبصورت اور صاف جلد کے لیے ایک قابل اعتماد بیوٹی سوپ ہے۔",
  124: "Laar Soap provides gentle daily cleansing to keep your skin feeling fresh.\n\nلار صابن آپ کی جلد کو روزانہ کی نرم صفائی اور تازگی فراہم کرتا ہے۔",
  125: "Door Soap is an everyday beauty bar that effectively removes impurities.\n\nڈور صابن ایک روزمرہ کا بیوٹی بار ہے جو جلد کی گندگی کو مؤثر طریقے سے صاف کرتا ہے۔",
  126: "Dove Soap contains 1/4 moisturizing cream to leave your skin soft, smooth, and radiant.\n\nڈو صابن میں 1/4 موئسچرائزنگ کریم شامل ہے جو آپ کی جلد کو نرم، ملائم اور چمکدار بناتی ہے۔",
  127: "Knorr Noodles Family Pack offers delicious and quick meals that the whole family will love.\n\nکنور نوڈلز فیملی پیک مزیدار اور جلدی تیار ہونے والا کھانا ہے جو پورے خاندان کو پسند آئے گا۔",
  128: "Indomie Noodles are famous for their authentic taste and perfectly textured strands.\n\nانڈومی نوڈلز اپنے اصل ذائقے اور بہترین ساخت کے لیے مشہور ہیں۔",
  129: "Aj Macaroni is made from premium ingredients, perfect for all your pasta and snack recipes.\n\nاے جے میکرونی بہترین اجزاء سے بنی ہے، جو آپ کی پاستا اور سنیک ریسیپیز کے لیے شاندار ہے۔",
  130: "Bake Parlor offers high-quality pasta, bringing restaurant-style taste to your home kitchen.\n\nبیک پارلر اعلیٰ معیار کا پاستا فراہم کرتا ہے، جو آپ کے گھر میں ریسٹورنٹ جیسا ذائقہ لاتا ہے۔",
  131: "Mario Macaroni and Spaghetti provide an authentic Italian-style dining experience at home.\n\nماریو میکرونی اور سپتیٹی آپ کے گھر میں اطالوی طرز کے کھانے کا بہترین تجربہ فراہم کرتے ہیں۔",
  132: "Elfin Macaroni stays firm and non-sticky, making it the best choice for everyday cooking.\n\nایلفن میکرونی پکنے کے بعد بھی کھلی کھلی رہتی ہے، جو روزمرہ پکوان کے لیے بہترین انتخاب ہے۔",
  133: "Golden Macaroni Box is your go-to option for delicious, healthy, and easy-to-cook pasta.\n\nگولڈن میکرونی باکس مزیدار، صحت بخش اور آسانی سے پکنے والے پاستا کے لیے آپ کا بہترین انتخاب ہے۔",
  134: "Colourful Vermicelli adds a vibrant touch and delightful taste to your traditional sweet dishes.\n\nرنگین سویاں آپ کے روایتی میٹھے پکوانوں میں ایک خوبصورت رنگ اور مزیدار ذائقہ شامل کرتی ہیں۔"
};

db.serialize(() => {
    const stmt = db.prepare("UPDATE Products SET description = ? WHERE id = ?");
    for (const [id, desc] of Object.entries(descriptions)) {
        stmt.run([desc, id], (err) => {
            if (err) console.error(`Error updating product ${id}:`, err);
        });
    }
    stmt.finalize(() => {
        console.log("All descriptions updated successfully.");
        db.close();
    });
});
