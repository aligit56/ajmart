const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function testFunctionality() {
  console.log('--- Functional Verification ---');

  // 1. Search for 'rice'
  const searchRes = await get('https://ajmart-backend.onrender.com/api/products?search=rice');
  const searchData = JSON.parse(searchRes.body);
  const riceItems = searchData.products || searchData;
  console.log(`Search 'rice' returned ${riceItems.length} products (expected 9):`, riceItems.map(p => p.name));

  // 2. Search for 'dalda'
  const daldaRes = await get('https://ajmart-backend.onrender.com/api/products?search=dalda');
  const daldaData = JSON.parse(daldaRes.body);
  const daldaItems = daldaData.products || daldaData;
  console.log(`Search 'dalda' returned ${daldaItems.length} products:`, daldaItems.map(p => p.name));

  // 3. Check product details & variants for a known variant product (e.g., Knorr Family Pack or oil bottle)
  const allProdsRes = await get('https://ajmart-backend.onrender.com/api/products?limit=158');
  const allProdsData = JSON.parse(allProdsRes.body);
  const allList = allProdsData.products || allProdsData;
  console.log(`Total active products in production catalog: ${allList.length}`);

  // 4. Store settings
  const settingsRes = await get('https://ajmart-backend.onrender.com/api/settings');
  const settings = JSON.parse(settingsRes.body);
  console.log('Store Settings Verification:');
  console.log('  store_name:', settings.store_name);
  console.log('  minimum_order_amount:', settings.minimum_order_amount);
  console.log('  whatsapp_phone:', settings.whatsapp_phone);
  console.log('  store_address:', settings.store_address);
  console.log('  business_hours:', settings.business_hours);
}

testFunctionality().catch(console.error);
