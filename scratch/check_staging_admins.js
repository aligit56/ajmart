require('../backend/node_modules/dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') });
const { createClient } = require('../backend/node_modules/@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function run() {
  const res = await client.execute("SELECT id, name, email, role FROM Users WHERE role='admin'");
  console.log('Staging admins count:', res.rows.length);
  res.rows.forEach(r => console.log(r));
}
run().catch(console.error);
