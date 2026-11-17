const https = require('https');

const categories = [
  { id: 1, name: 'Pulses', url: '/images/categories/pulses.webp' },
  { id: 2, name: 'Rice', url: '/images/categories/rice.jpg' },
  { id: 4, name: 'Spices', url: '/images/categories/spices.WEBP' },
  { id: 5, name: 'Household', url: '/images/categories/Household.png' },
  { id: 6, name: 'Cosmetics', url: '/images/categories/cosmetics.WEBP' },
  { id: 7, name: 'Cleaning and Laundry', url: '/images/categories/cleaning.WEBP' },
  { id: 8, name: 'Personal Care', url: '/images/categories/personalcare.webp' },
  { id: 9, name: 'Tea or Coffee', url: '/images/categories/Coffetea.WEBP' },
  { id: 10, name: 'Noodle and Macaronis', url: '/images/categories/noodles.WEBP' },
  { id: 11, name: 'Oil and Ghee', url: '/images/categories/cookingoil.WEBP' },
  { id: 12, name: 'Everyday Grocery', url: '/images/categories/grocery.WEBP' }
];

function fetchHeadAndSample(path) {
  return new Promise((resolve) => {
    const fullUrl = 'https://ajmart-store.netlify.app' + path;
    const req = https.get(fullUrl, (res) => {
      let chunks = [];
      let totalBytes = 0;
      res.on('data', chunk => {
        chunks.push(chunk);
        totalBytes += chunk.length;
      });
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] || '';
        const isHtml = buffer.toString('utf8', 0, 50).includes('<!DOCTYPE') || buffer.toString('utf8', 0, 50).includes('<html');
        let imageType = 'unknown';
        if (buffer[0] === 0xFF && buffer[1] === 0xD8) imageType = 'JPEG';
        else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) imageType = 'PNG';
        else if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') imageType = 'WEBP';

        resolve({
          path,
          status: res.statusCode,
          contentType,
          contentLength: res.headers['content-length'] || totalBytes,
          actualBytes: totalBytes,
          isHtml,
          imageType
        });
      });
    });
    req.on('error', (err) => resolve({ path, error: err.message }));
  });
}

async function run() {
  console.log('AUDITING ALL 11 CATEGORY IMAGES ON LIVE NETLIFY (https://ajmart-store.netlify.app)\n');
  for (const cat of categories) {
    const res = await fetchHeadAndSample(cat.url);
    console.log(`Category: ${cat.name}`);
    console.log(`  Path: ${cat.url}`);
    console.log(`  HTTP Status: ${res.status}`);
    console.log(`  Content-Type: ${res.contentType}`);
    console.log(`  Actual Size: ${res.actualBytes} bytes (${(res.actualBytes / 1024).toFixed(1)} KB)`);
    console.log(`  Detected Magic Format: ${res.imageType}`);
    console.log(`  Is HTML fallback? ${res.isHtml ? 'YES (BROKEN! Returned index.html)' : 'NO (Valid image)'}`);
    console.log('----------------------------------------------------');
  }
}

run();
