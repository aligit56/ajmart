const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const migrationName = '016_update_store_location_hero_and_videos.js';
const migrationsLogPath = path.resolve(__dirname, 'migrations.log');
const dbPath = path.resolve(__dirname, '../../database.sqlite');

// 1. Check migrations.log to ensure idempotency
if (fs.existsSync(migrationsLogPath)) {
  const logContent = fs.readFileSync(migrationsLogPath, 'utf8');
  if (logContent.includes(`${migrationName} - APPLIED`)) {
    console.log(`✓ Migration ${migrationName} has already been applied, skipping.`);
    process.exit(0);
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to open database:', err.message);
    process.exit(1);
  }
});

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);

  await runQuery('BEGIN TRANSACTION');

  // 1. Update Settings table with Namak Mandi Rawalpindi address, Google Maps link, and card contact numbers
  const settingsEntries = [
    ['address', 'Shop # V-488, Namak Mandi Chowk, Raja Bazar, Rawalpindi'],
    ['phone', '0335-7727555 / 0312-5637557'],
    ['whatsapp_number', '923357727555'],
    ['delivery_areas', 'Rawalpindi & Islamabad'],
    ['owner_aqib', '0335-7727555'],
    ['owner_junaid', '0312-5637557'],
    ['google_maps_url', 'https://maps.google.com/maps?rlz=1C1JJTC_en-GBPK1128PK1128&sca_esv=bce34edbebca93c5&udm&fvr=1&pvq=Cg0vZy8xMXprcG0zMWZ0IhAKCmFqIHRyYWRlcnMQAhgDiQFZ6uReYoCV_w&lqi=ChNhaiB0cmFkZXJzIGxvY2F0aW9uSLmLxtnGvoCACFoUEAAQARgAGAEiCmFqIHRyYWRlcnOSAQ1ncm9jZXJ5X3N0b3Jl&vet=10CAAQoqAOahcKEwiwxv-MzImYAxUAAAAAHQAAAAAQBQ..i&cs=1&um=1&ie=UTF-8&fb=1&gl=pk&sa=X&ftid=0x38df95003331a049:0xff9580625ee4ea59'],
    ['google_maps_embed', 'https://maps.google.com/maps?q=AJ+Traders+Namak+Mandi+Chowk+Raja+Bazar+Rawalpindi&t=&z=16&ie=UTF8&iwloc=&output=embed'],
    ['announcement_bar_text', 'Free delivery on wholesale & retail grocery orders over PKR 3,000 across Rawalpindi & Islamabad!']
  ];

  for (const [key, val] of settingsEntries) {
    await runQuery(
      `INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [key, val]
    );
  }
  console.log('✓ Updated store settings with Namak Mandi Rawalpindi address, phone numbers, and Google Maps URL.');

  // 2. Replace placeholder hero slides with the 3 user-provided hero photos
  await runQuery('DELETE FROM hero_slides');
  const heroSlides = [
    [
      'image',
      '/images/hero/hero-slide-1.png',
      'Wholesale Grocery Staples',
      'Premium pulses, aged basmati rice, and pure spices at genuine wholesale rates',
      'Shop Now',
      '/products',
      1,
      1
    ],
    [
      'image',
      '/images/hero/hero-slide-2.png',
      'Guaranteed Purity & Quality',
      'Authentic branded oils, teas, and everyday grocery essentials delivered to your doorstep',
      'Explore Categories',
      '/categories',
      2,
      1
    ],
    [
      'image',
      '/images/hero/hero-slide-3.png',
      'Namak Mandi Rawalpindi',
      'Direct from Raja Bazar wholesale market to homes & retailers across Rawalpindi & Islamabad',
      'Special Offers',
      '/offers',
      3,
      1
    ]
  ];

  for (const slide of heroSlides) {
    await runQuery(
      `INSERT INTO hero_slides (media_type, media_url, title, subtitle, button_text, button_link, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      slide
    );
  }
  console.log('✓ Replaced hero slides with 3 user-provided banner photos.');

  // 3. Update featured videos: exactly 2 videos with user's uploaded videos
  await runQuery('DELETE FROM featured_videos');
  const videos = [
    [
      'AJTraders Store & Warehouse Walkthrough',
      '/videos/IMG_6128.MOV',
      '/images/hero/hero-slide-1.png',
      1,
      1
    ],
    [
      'Authentic Grains & Products Quality Check',
      '/videos/IMG_8205.MP4',
      '/images/hero/hero-slide-2.png',
      2,
      1
    ]
  ];

  for (const v of videos) {
    await runQuery(
      `INSERT INTO featured_videos (title, video_url, thumbnail_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      v
    );
  }
  console.log('✓ Set featured videos to 2 user-uploaded videos (removed 3rd placeholder card).');

  await runQuery('COMMIT');

  // 4. Record in migrations.log
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const logEntry = `\n[${now}] ${migrationName} - APPLIED - Updated store settings with Namak Mandi Rawalpindi Google Maps address, Aqib & Junaid phone numbers, replaced hero placeholders with 3 user slides, and set 2 featured store videos.`;
  fs.appendFileSync(migrationsLogPath, logEntry, 'utf8');
  console.log(`✓ Migration recorded in ${migrationsLogPath}`);

  db.close((err) => {
    if (err) console.error('Error closing DB:', err.message);
    else console.log(`✓ Migration ${migrationName} completed successfully.`);
  });
}

runMigration().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
