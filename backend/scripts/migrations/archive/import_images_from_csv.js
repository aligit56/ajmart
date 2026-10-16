const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const csvPath = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, 'product_images_template.csv');

if (!fs.existsSync(csvPath)) {
  console.error(`CSV file not found at: ${csvPath}`);
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);
const results = [];

fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(`Read ${results.length} rows from CSV.`);

    db.serialize(() => {
      const updateById = db.prepare(`UPDATE Products SET image_url = ? WHERE id = ?`);
      const updateByName = db.prepare(`UPDATE Products SET image_url = ? WHERE LOWER(name) = LOWER(?)`);

      let updatedCount = 0;

      results.forEach((row) => {
        const id = row.id ? parseInt(row.id, 10) : null;
        const name = (row.product_name || row.name || '').trim();
        const rawImg = (row.image_file_name || row.image_url || '').trim();

        if (!rawImg) return;

        let finalUrl = rawImg;
        // If user just provided filename (e.g. "cream.jpg"), construct backend URL
        if (!rawImg.startsWith('http://') && !rawImg.startsWith('https://')) {
          finalUrl = `http://localhost:5000/images/products/${rawImg}`;
        }

        if (id) {
          updateById.run(finalUrl, id, function (err) {
            if (err) console.error(`Error updating ID ${id}:`, err.message);
            else if (this.changes > 0) updatedCount++;
          });
        } else if (name) {
          updateByName.run(finalUrl, name, function (err) {
            if (err) console.error(`Error updating "${name}":`, err.message);
            else if (this.changes > 0) updatedCount++;
          });
        }
      });

      updateById.finalize();
      updateByName.finalize(() => {
        console.log(`Image import complete! Successfully updated products.`);
        db.close();
      });
    });
  });
