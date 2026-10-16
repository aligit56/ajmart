const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const query = `
  SELECT p.id, p.name, c.name as category, p.brand, p.image_url
  FROM Products p
  LEFT JOIN Categories c ON p.category_id = c.id
  ORDER BY p.id
`;

db.all(query, (err, rows) => {
  if (err) {
    console.error('Error fetching products:', err);
    return;
  }

  const header = 'id,product_name,category,brand,image_file_name\n';
  const lines = rows.map(r => {
    let imgName = '';
    if (r.image_url) {
      const parts = r.image_url.split('/');
      imgName = parts[parts.length - 1] || '';
    }
    const escapedName = (r.name || '').replace(/"/g, '""');
    const escapedCategory = (r.category || '').replace(/"/g, '""');
    const escapedBrand = (r.brand || '').replace(/"/g, '""');
    return `"${r.id}","${escapedName}","${escapedCategory}","${escapedBrand}","${imgName}"`;
  });

  const csvPath = path.resolve(__dirname, 'product_images_template.csv');
  fs.writeFileSync(csvPath, header + lines.join('\n'), 'utf8');
  console.log(`Generated ${csvPath} with ${rows.length} products.`);
  db.close();
});
