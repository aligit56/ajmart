const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const sqlite3 = require('sqlite3').verbose();

const csvPath = path.resolve(__dirname, 'product_images_template.csv');
const dbPath = path.resolve(__dirname, 'database.sqlite');

const newImageMappings = {
  // Lotions
  135: 'Golden-Pearl-Healthy-White-Body-Lotion-Deep-Moisture-_-Soft-Smooth-Skin-06.webp',
  136: 'Golden-Pearl-Cocoa-Touch-Advance-Care-Moisturizing-Lotion-Cocoa-Butter-Shea-Butter-_-Deep-Hydration-Skin-Care.webp',
  137: 'Golden-Pearl-Aloe-Magic-Advance-Care-Moisturizing-Lotion-Aloe_Vera-Vitamins-B3-C-_-E-for-Deep-Hydration-_-Skin-Nourishment-05.webp',
  138: 'Golden-Pearl-Honey-_-Almond-Advance-Care-Moisturizing-Lotion_Deep-Hydration-Skin-Nourishment-_-Healthy-Glow.webp',
  139: 'Golden-Pearl-Skin-Lightening-Advance-Care-Moisturizing-Lotion-Dee-Hydration-Skin-Brightening-_-Daily-Nourishment-010.webp',

  // Hair Oils
  142: 'Hello-Hair-10-Natural-Herbal-Hair-Oil-10_-Herbs-Formula-for-Strong-Nourished-_-Healthy-Looking-Hair.webp',
  143: 'Hello-Hair-Coconut-Oil-Deep-Nourishment-_-Moisture-Formula-for-Soft-Strong-_-Healthy-Looking-Hair.webp',
  144: 'Hello-Hair-Almond-Oil-Deep-Nourishment-_-Moisture-Formula-for-Soft-Smooth-_-Healthy-Looking-Hair.webp',
  145: 'Hello-Hair-Onion-Herbal-Oil-Onion-Extract-_-Herbal-Blend-for-Nourished-Soft-_-Healthy-Looking-Hair.webp',
  146: 'Hello-Hair-Argan-Oil-Deep-Nourishment-_-Moisture-Formula-for-Soft-Silky-_-Healthy-Looking-Hair.webp',
  147: 'Hello-Hair-Garlic-Hair-Oil-Garlic-Vitamin-B6-Vitamin-C-_-Selenium-for-Strong-Nourished-_-Healthy-Looking-Hair.webp',

  // Tibet Creams
  163: 'tibet cream.jpeg',
  164: 'tibet_cold_cream_large.png'
};

const rows = [];

fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (row) => {
    const id = parseInt(row.id, 10);
    if (newImageMappings[id]) {
      row.image_file_name = newImageMappings[id];
    }
    rows.push(row);
  })
  .on('end', () => {
    const header = 'id,product_name,category,brand,image_file_name\n';
    const lines = rows.map(r => {
      const escapedName = (r.product_name || '').replace(/"/g, '""');
      const escapedCategory = (r.category || '').replace(/"/g, '""');
      const escapedBrand = (r.brand || '').replace(/"/g, '""');
      return `"${r.id}","${escapedName}","${escapedCategory}","${escapedBrand}","${r.image_file_name || ''}"`;
    });

    fs.writeFileSync(csvPath, header + lines.join('\n'), 'utf8');
    console.log(`Updated CSV with lotions, hair oils, and Tibet creams.`);

    // Now update database directly
    const db = new sqlite3.Database(dbPath);
    db.serialize(() => {
      const stmt = db.prepare('UPDATE Products SET image_url = ? WHERE id = ?');
      let count = 0;
      for (const [id, filename] of Object.entries(newImageMappings)) {
        const fullUrl = `http://localhost:5000/images/products/${filename}`;
        stmt.run(fullUrl, id, function(err) {
          if (err) console.error(`Error updating ${id}:`, err.message);
          else count++;
        });
      }
      stmt.finalize(() => {
        console.log(`Database updated for all ${count} new product images.`);
        db.close();
      });
    });
  });
