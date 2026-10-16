const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const csvPath = path.resolve(__dirname, 'product_images_template.csv');

const imageMapping = {
  // Standard Body Sprays
  148: 'Golden-Pearl-Romance-Body-Spray-for-Women-Sensual-Woody-Romantic-_-Long-Lasting-Fragrance.webp',
  149: 'Golden-Pearl-Attraction-Body-Spray-for-Women-Floral-Feminine-_-Long-Lasting-Fragrance.webp',
  150: 'Golden-Pearl-Blue-Yacht-Body-Spray-for-Men-Fresh-Aquatic-Crisp-_-Long-Lasting-Fragrance.webp',
  151: 'Golden-Pearl-Flirt-Body-Spray-for-Women-Floral-Breezy-Calming-_-Long-Lasting-Fragrance.webp',
  152: 'Golden-Pearl-Golden-Touch-Body-Spray-for-Men-Exotic-Spicy-Musky-_-Long-Lasting-Fragrance.webp',
  153: 'Golden-Pearl-Leader-Body-Spray-for-Men-Fresh-Aromatic-Masculine-_-Long-Lasting-Fragrance.webp',
  154: 'Golden-Pearl-Oud-Body-Spray-for-Men-Rich-Exotic-_-Long-Lasting-Oud-Fragrance.webp',
  155: 'Golden-Pearl-Charge-Body-Spray-for-Men-Energetic-Fresh-_-Long-Lasting-Fragrance.webp',
  156: 'Golden-Pearl-Passion-Body-Spray-for-Me-Warm-Spicy-Musky-_-Long-Lasting-Fragrance.webp',
  157: 'Golden-Pearl-Dark-Energy-Body-Spray-for-Men-Woody-Musky-Energetic-_-Long-Lasting-Fragrance.webp',
  158: 'Golden-Pearl-Urge-Body-Spray-for-Men-Cool-Refreshing-_-Long-Lasting-Aquatic-Fragrance.webp',
  159: 'Golden-Pearl-Seduce-Body-Spray-for-Women-Fruity-Citrus-Sensual-_-Long-Lasting-Fragrance.webp',
  160: 'Golden-Pearl-Soldier-Body-Spray-for-Men-Bold-Earthy-Musky-_-Long-Lasting-Fragrance.webp',

  // Legacy Editions
  165: 'Golden_Pearl_Leader_Body_Spray.webp',
  166: 'Passion-Body-Spray-03.webp',
  167: 'Urge-Body-Spray-01.webp',
  168: 'Seduce-Body-Spray-01.webp'
};

const rows = [];

fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (row) => {
    const id = parseInt(row.id, 10);
    if (imageMapping[id]) {
      row.image_file_name = imageMapping[id];
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
    console.log(`Updated product_images_template.csv with ${Object.keys(imageMapping).length} body spray images.`);
  });
