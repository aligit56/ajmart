require('../backend/node_modules/dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') });
const { createClient } = require('../backend/node_modules/@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function checkStaging() {
  console.log('Connecting to Staging URL:', process.env.TURSO_DATABASE_URL.split('@').pop());
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Staging tables:', tables.rows.map(r => r.name));
  
  const prods = await client.execute('SELECT count(*) as count, sum(stock) as stock, sum(reserved_stock) as reserved FROM Products');
  console.log('Staging products stats:', prods.rows[0]);
  
  const users = await client.execute('SELECT count(*) as count FROM Users');
  console.log('Staging users count:', users.rows[0].count);
  
  const orders = await client.execute('SELECT count(*) as count FROM Orders');
  console.log('Staging orders count:', orders.rows[0].count);
}

checkStaging().catch(console.error);
