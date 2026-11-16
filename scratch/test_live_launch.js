const https = require('https');

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('=== 1. Checking Live Netlify Frontend Deploy ===');
  const fe = await get('https://ajmart-store.netlify.app/login');
  console.log('GET https://ajmart-store.netlify.app/login -> Status:', fe.status);
  
  // Extract script src
  const matches = fe.body.match(/src="(\/assets\/[^"]+\.js)"/g) || [];
  console.log('Script matches found in HTML:', matches);
  
  for (const m of matches) {
    const src = m.replace('src="', '').replace('"', '');
    const scriptUrl = 'https://ajmart-store.netlify.app' + src;
    console.log('Fetching live bundle:', scriptUrl);
    const scriptRes = await get(scriptUrl);
    console.log('Bundle fetched, size:', scriptRes.body.length, 'bytes');
    
    const checkNeedles = ['admin@ajmart.pk', 'customer@ajmart.pk', 'admin123', 'customer123', 'Quick Test Logins', 'Admin Demo'];
    for (const needle of checkNeedles) {
      const found = scriptRes.body.includes(needle);
      console.log(`Checking for "${needle}":`, found ? 'FOUND (FAIL!)' : 'NOT FOUND (PASS)');
    }
  }

  console.log('\n=== 2. Checking Render Backend CORS & Public Endpoints ===');
  const settingsRes = await get('https://ajmart-backend.onrender.com/api/settings', {
    'Origin': 'https://ajmart-store.netlify.app'
  });
  console.log('GET /api/settings status:', settingsRes.status);
  console.log('access-control-allow-origin:', settingsRes.headers['access-control-allow-origin']);
  const settings = JSON.parse(settingsRes.body);
  console.log('Store Name:', settings.store_name);
  console.log('Min Order Amount:', settings.minimum_order_amount);
  console.log('WhatsApp Phone:', settings.whatsapp_phone);

  const categoriesRes = await get('https://ajmart-backend.onrender.com/api/categories', {
    'Origin': 'https://ajmart-store.netlify.app'
  });
  console.log('GET /api/categories status:', categoriesRes.status);
  const categories = JSON.parse(categoriesRes.body);
  console.log('Categories count:', Array.isArray(categories) ? categories.length : 'not array');

  const productsRes = await get('https://ajmart-backend.onrender.com/api/products?limit=5', {
    'Origin': 'https://ajmart-store.netlify.app'
  });
  console.log('GET /api/products status:', productsRes.status);
  const products = JSON.parse(productsRes.body);
  console.log('Products sample total:', products.total || (Array.isArray(products) ? products.length : 'N/A'));

  console.log('\n=== 3. Checking Static Media Assets on Netlify ===');
  // Check category image
  const catImg = await get('https://ajmart-store.netlify.app/images/categories/pulses.png');
  console.log('GET /images/categories/pulses.png -> Status:', catImg.status, 'Content-Type:', catImg.headers['content-type']);

  // Check product image
  const prodImg = await get('https://ajmart-store.netlify.app/images/products/pulses/daal-chana-hand.jpg');
  console.log('GET /images/products/pulses/daal-chana-hand.jpg -> Status:', prodImg.status, 'Content-Type:', prodImg.headers['content-type']);

  // Check hero slide
  const heroImg = await get('https://ajmart-store.netlify.app/images/hero/hero-slide-1.jpg');
  console.log('GET /images/hero/hero-slide-1.jpg -> Status:', heroImg.status, 'Content-Type:', heroImg.headers['content-type']);

  // Check video thumbnail
  const videoPoster = await get('https://ajmart-store.netlify.app/videos/shop-tour-poster.jpg');
  console.log('GET /videos/shop-tour-poster.jpg -> Status:', videoPoster.status, 'Content-Type:', videoPoster.headers['content-type']);
}

run().catch(console.error);
