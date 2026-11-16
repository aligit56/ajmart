/**
 * Secure One-Time Production Admin Account Creation for AJMart
 * 
 * Usage:
 *   node backend/scripts/create-admin.js
 * 
 * This script runs locally, connects securely to ajmart-prod using credentials
 * in backend/.env, and prompts interactively for admin credentials.
 * Zero credentials are ever hardcoded or committed to Git.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const readline = require('readline');
const bcrypt = require('bcryptjs');
const createDatabase = require('../utils/db');

// Strictly require production credentials and verify ajmart-prod target
const targetUrl = process.env.TURSO_PROD_DATABASE_URL;
const targetToken = process.env.TURSO_PROD_AUTH_TOKEN;

if (!targetUrl || !targetToken) {
  console.error('[SAFETY BLOCK] Missing TURSO_PROD_DATABASE_URL or TURSO_PROD_AUTH_TOKEN in backend/.env.');
  console.error('This script is strictly intended for production (ajmart-prod).');
  process.exit(1);
}

if (!targetUrl.includes('ajmart-prod')) {
  console.error('[SAFETY BLOCK] Target URL does not specifically contain "ajmart-prod"!');
  console.error('To protect your environments, this script will only execute against ajmart-prod.');
  process.exit(1);
}

// Override environment so createDatabase targets production
process.env.TURSO_DATABASE_URL = targetUrl;
process.env.TURSO_AUTH_TOKEN = targetToken;

const db = createDatabase();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question, isPassword = false) {
  return new Promise((resolve) => {
    if (!isPassword) {
      rl.question(question, (answer) => resolve(answer.trim()));
    } else {
      process.stdout.write(question);
      const stdin = process.stdin;
      const oldRaw = stdin.isRaw;
      if (stdin.setRawMode) stdin.setRawMode(true);
      stdin.resume();
      let pass = '';
      
      const onData = (char) => {
        char = char + '';
        switch (char) {
          case '\n':
          case '\r':
          case '\u0004':
            if (stdin.setRawMode) stdin.setRawMode(oldRaw);
            stdin.removeListener('data', onData);
            process.stdout.write('\n');
            resolve(pass.trim());
            break;
          case '\u0003': // Ctrl+C
            process.exit();
            break;
          case '\u0008': // Backspace
          case '\x7f':
            if (pass.length > 0) {
              pass = pass.slice(0, -1);
              process.stdout.write('\b \b');
            }
            break;
          default:
            pass += char;
            process.stdout.write('*');
            break;
        }
      };
      stdin.on('data', onData);
    }
  });
}

async function createAdmin() {
  console.log('========================================================');
  console.log('       AJMART PRODUCTION ADMIN ACCOUNT INITIALIZATION   ');
  console.log('========================================================');
  console.log('Target Database:', targetUrl.split('@').pop());
  console.log('\nPlease enter the details for your primary administrator account:\n');

  const name = await ask('Admin Name [Aqib]: ') || 'Aqib';
  const email = (await ask('Admin Email: ')).toLowerCase();
  if (!email || !email.includes('@')) {
    console.error('Invalid email address. Aborted.');
    rl.close();
    process.exit(1);
  }

  const phone = await ask('Admin Phone (e.g. 03357727555): ');
  if (!phone) {
    console.error('Phone number is required. Aborted.');
    rl.close();
    process.exit(1);
  }

  const password = await ask('Admin Password (min 8 characters): ', true);
  if (!password || password.length < 8) {
    console.error('Password must be at least 8 characters long. Aborted.');
    rl.close();
    process.exit(1);
  }

  const confirmPassword = await ask('Confirm Admin Password: ', true);
  if (password !== confirmPassword) {
    console.error('Passwords do not match. Aborted.');
    rl.close();
    process.exit(1);
  }

  console.log('\nHashing password and creating admin account in ajmart-prod...');
  const passwordHash = bcrypt.hashSync(password, 10);

  db.run(
    `INSERT INTO Users (name, email, phone, address, password, role, points) VALUES (?, ?, ?, ?, ?, 'admin', 0)`,
    [name, email, phone, 'Shop #12, Namak Mandi, Raja Bazar, Rawalpindi', passwordHash],
    function(err) {
      rl.close();
      if (err) {
        if (err.message && err.message.includes('UNIQUE constraint')) {
          console.error('[ERROR] An account with this email already exists in production.');
        } else {
          console.error('[ERROR] Failed to insert admin user:', err.message);
        }
        process.exit(1);
      }

      console.log('========================================================');
      console.log(`SUCCESS: Administrator account "${name}" (${email}) created!`);
      console.log(`Role: admin | User ID: ${this.lastID}`);
      console.log('========================================================');
      process.exit(0);
    }
  );
}

createAdmin().catch(err => {
  console.error('Fatal error:', err);
  rl.close();
  process.exit(1);
});
