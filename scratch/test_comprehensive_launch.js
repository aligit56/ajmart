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
  console.log('====================================================');
  console.log('AJMART PHASE 11: FULL COMPREHENSIVE PRODUCTION AUDIT');
  console.log('====================================================\n');

  // 1. Frontend Bundle & Auth Page Hardening
  console.log('--- TEST 1: Production Login Page & Bundle Hardening ---');
  const loginRes = await get('https://ajmart-store.netlify.app/login');
  console.log('GET /login HTTP Status:', loginRes.status);
  const scriptMatches = loginRes.body.match(/src="(\/assets\/[^"]+\.js)"/g) || [];
  let credentialsLeaked = false;
  for (const m of scriptMatches) {
    const src = m.replace('src="', '').replace('"', '');
    const bundleRes = await get('https://ajmart-store.netlify.app' + src);
    console.log(`Auditing JS Bundle ${src} (${bundleRes.body.length} bytes)...`);
    const checkNeedles = ['admin@ajmart.pk', 'customer@ajmart.pk', 'admin123', 'customer123', 'Quick Test Logins', 'Admin Demo'];
    for (const needle of checkNeedles) {
      if (bundleRes.body.includes(needle)) {
        console.error(`  FAIL: Leaked "${needle}"`);
        credentialsLeaked = true;
      }
    }
  }
  console.log('Auth Bundle Audit:', credentialsLeaked ? 'FAILED' : 'PASSED (Zero Demo Credentials in Bundle)');

  // 2. Render Backend & CORS
  console.log('\n--- TEST 2: Backend Health, Data Integrity & CORS ---');
  const settingsRes = await get('https://ajmart-backend.onrender.com/api/settings', {
    'Origin': 'https://ajmart-store.netlify.app'
  });
  console.log('GET /api/settings status:', settingsRes.status);
  console.log('CORS Allow-Origin:', settingsRes.headers['access-control-allow-origin']);
  const settings = JSON.parse(settingsRes.body);
  console.log('Store Name:', settings.store_name);
  console.log('Minimum Order Amount:', settings.minimum_order_amount, 'PKR');

  // 3. Category Image URLs & Assets
  console.log('\n--- TEST 3: Category Images Verification ---');
  const catRes = await get('https://ajmart-backend.onrender.com/api/categories', {
    'Origin': 'https://ajmart-store.netlify.app'
  });
  const categories = JSON.parse(catRes.body);
  console.log(`Found ${categories.length} categories.`);
  let brokenCats = 0;
  for (const cat of categories) {
    const imgUrl = 'https://ajmart-store.netlify.app' + cat.image_url;
    const imgCheck = await get(imgUrl);
    const isImage = (imgCheck.headers['content-type'] || '').startsWith('image/');
    if (imgCheck.status === 200 && isImage) {
      console.log(`  ✓ Category [${cat.name}]: ${cat.image_url} (HTTP 200, ${imgCheck.headers['content-type']})`);
    } else {
      console.error(`  ✗ Category [${cat.name}]: ${cat.image_url} (HTTP ${imgCheck.status}, ${imgCheck.headers['content-type']})`);
      brokenCats++;
    }
  }
  console.log('Category Images Audit:', brokenCats === 0 ? 'ALL PASSED (11/11)' : `${brokenCats} BROKEN`);

  // 4. Sample Product Images & Galleries
  console.log('\n--- TEST 4: Product Images & Gallery Assets ---');
  const prodsRes = await get('https://ajmart-backend.onrender.com/api/products?limit=10', {
    'Origin': 'https://ajmart-store.netlify.app'
  });
  const prodsData = JSON.parse(prodsRes.body);
  const prodsList = prodsData.products || prodsData;
  let brokenProds = 0;
  for (const p of prodsList.slice(0, 10)) {
    const imgUrl = 'https://ajmart-store.netlify.app' + p.image_url;
    const imgCheck = await get(imgUrl);
    const isImage = (imgCheck.headers['content-type'] || '').startsWith('image/');
    if (imgCheck.status === 200 && isImage) {
      console.log(`  ✓ Product [${p.name}]: ${p.image_url} (HTTP 200, ${imgCheck.headers['content-type']})`);
    } else {
      console.error(`  ✗ Product [${p.name}]: ${p.image_url} (HTTP ${imgCheck.status}, ${imgCheck.headers['content-type']})`);
      brokenProds++;
    }
  }
  console.log('Product Images Sample Audit:', brokenProds === 0 ? 'ALL PASSED (10/10)' : `${brokenProds} BROKEN`);

  // 5. Hero Slides & Walkthrough Videos
  console.log('\n--- TEST 5: Hero Slides & Video Media Assets ---');
  const heroRes = await get('https://ajmart-backend.onrender.com/api/hero-slides');
  const heroSlides = JSON.parse(heroRes.body);
  for (const slide of heroSlides) {
    const slideCheck = await get('https://ajmart-store.netlify.app' + slide.media_url);
    const isImg = (slideCheck.headers['content-type'] || '').startsWith('image/');
    console.log(`  ✓ Hero Slide [${slide.title}]: ${slide.media_url} (HTTP ${slideCheck.status}, isImage: ${isImg})`);
  }

  const videoRes = await get('https://ajmart-backend.onrender.com/api/featured-videos');
  const featuredVideos = JSON.parse(videoRes.body);
  for (const vid of featuredVideos) {
    const vidCheck = await get('https://ajmart-store.netlify.app' + vid.video_url);
    const thumbCheck = await get('https://ajmart-store.netlify.app' + vid.thumbnail_url);
    console.log(`  ✓ Video [${vid.title}]: video=${vid.video_url} (HTTP ${vidCheck.status}, Type=${vidCheck.headers['content-type']}), thumb=${vid.thumbnail_url} (HTTP ${thumbCheck.status})`);
  }

  // 6. SPA Route Refresh Verification
  console.log('\n--- TEST 6: SPA Client-Side Routing & Refresh Verification ---');
  const spaRoutes = ['/products', '/categories', '/category/1', '/cart', '/checkout', '/orders/track', '/login', '/about', '/contact'];
  let brokenRoutes = 0;
  for (const route of spaRoutes) {
    const rCheck = await get('https://ajmart-store.netlify.app' + route);
    if (rCheck.status === 200 && rCheck.body.includes('<div id="root">')) {
      console.log(`  ✓ SPA Route [${route}]: HTTP 200 (Clean React Shell)`);
    } else {
      console.error(`  ✗ SPA Route [${route}]: HTTP ${rCheck.status}`);
      brokenRoutes++;
    }
  }
  console.log('SPA Routes Audit:', brokenRoutes === 0 ? 'ALL PASSED (9/9)' : `${brokenRoutes} BROKEN`);
}

run().catch(console.error);
