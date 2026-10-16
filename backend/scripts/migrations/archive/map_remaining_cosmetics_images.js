const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const sqlite3 = require('sqlite3').verbose();

const csvPath = path.resolve(__dirname, 'product_images_template.csv');
const dbPath = path.resolve(__dirname, 'database.sqlite');

const remainingImages = {
  140: 'Care Lotion.webp',
  141: 'ponds lotion .jfif',
  161: 'Beauty-Cream-Skin-Brightening-Dark-Spot-Care-_-Daily-Moisturizing-Formula.jpg',
  162: 'Fair_Lovely_Cream_50Gm_7c45e4ba-1aa4-498f-9750-02a8b3667f5f.webp'
};

const rows = [];

fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (row) => {
    const id = parseInt(row.id, 10);
    if (remainingImages[id]) {
      row.image_file_name = remainingImages[id];
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
    console.log(`Updated CSV with remaining 4 images.`);

    const db = new sqlite3.Database(dbPath);
    db.serialize(() => {
      const stmt = db.prepare('UPDATE Products SET image_url = ? WHERE id = ?');
      for (const [id, filename] of Object.entries(remainingImages)) {
        const fullUrl = `http://localhost:5000/images/products/${filename}`;
        stmt.run(fullUrl, id, function(err) {
          if (err) console.error(`Error updating ${id}:`, err.message);
          else console.log(`Updated product ${id} with ${filename}`);
        });
      }
      stmt.finalize(() => {
        console.log(`Database updated for remaining cosmetics images.`);
        db.close();
      });
    });
  });
