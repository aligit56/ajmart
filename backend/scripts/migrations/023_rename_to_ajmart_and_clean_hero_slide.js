const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const sharp = require('../../node_modules/sharp');

const migrationName = '023_rename_to_ajmart_and_clean_hero_slide.js';
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

async function cleanHeroSlideImage() {
  const heroSlideSrc = path.resolve(__dirname, '../../public/images/hero/hero-slide-1.png');
  const heroSlideDestBackend = path.resolve(__dirname, '../../public/images/hero/hero-slide-1.png');
  const heroSlideDestFrontend = path.resolve(__dirname, '../../../frontend/public/images/hero/hero-slide-1.png');

  if (!fs.existsSync(heroSlideSrc)) {
    console.warn('⚠️ hero-slide-1.png not found, skipping image cleaning');
    return;
  }

  const { data, info } = await sharp(heroSlideSrc).raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  const yStart = 250;
  const yEnd = 555;
  const xStart = 40;
  const xEnd = 735;

  const buffer = Buffer.from(data);

  // Vertical interpolation between clean top band and clean bottom band for each column x
  for (let x = xStart; x <= xEnd; x++) {
    // Top sample: average of rows (yStart - 12) to yStart
    let topR = 0, topG = 0, topB = 0;
    const sampleH = 12;
    for (let dy = 0; dy < sampleH; dy++) {
      const idx = ((yStart - sampleH + dy) * width + x) * channels;
      topR += buffer[idx];
      topG += buffer[idx + 1];
      topB += buffer[idx + 2];
    }
    topR /= sampleH; topG /= sampleH; topB /= sampleH;

    // Bottom sample: average of rows yEnd to (yEnd + sampleH)
    let botR = 0, botG = 0, botB = 0;
    for (let dy = 0; dy < sampleH; dy++) {
      const idx = ((yEnd + dy) * width + x) * channels;
      botR += buffer[idx];
      botG += buffer[idx + 1];
      botB += buffer[idx + 2];
    }
    botR /= sampleH; botG /= sampleH; botB /= sampleH;

    for (let y = yStart; y <= yEnd; y++) {
      const t = (y - yStart) / (yEnd - yStart);
      const smoothT = (1 - Math.cos(t * Math.PI)) / 2;

      const r = Math.round(topR * (1 - smoothT) + botR * smoothT);
      const g = Math.round(topG * (1 - smoothT) + botG * smoothT);
      const b = Math.round(topB * (1 - smoothT) + botB * smoothT);

      // Edge feathering
      const featherX = 20;
      let blendFactorX = 1.0;
      if (x - xStart < featherX) blendFactorX = (x - xStart) / featherX;
      else if (xEnd - x < featherX) blendFactorX = (xEnd - x) / featherX;

      const featherY = 15;
      let blendFactorY = 1.0;
      if (y - yStart < featherY) blendFactorY = (y - yStart) / featherY;
      else if (yEnd - y < featherY) blendFactorY = (yEnd - y) / featherY;

      const totalBlend = blendFactorX * blendFactorY;

      const idx = (y * width + x) * channels;
      buffer[idx] = Math.round(buffer[idx] * (1 - totalBlend) + r * totalBlend);
      buffer[idx + 1] = Math.round(buffer[idx + 1] * (1 - totalBlend) + g * totalBlend);
      buffer[idx + 2] = Math.round(buffer[idx + 2] * (1 - totalBlend) + b * totalBlend);
    }
  }

  const cleanedPng = await sharp(buffer, { raw: { width, height, channels } })
    .png({ quality: 95 })
    .toBuffer();

  fs.writeFileSync(heroSlideDestBackend, cleanedPng);
  console.log(`✓ Cleaned hero-slide-1.png saved to ${heroSlideDestBackend}`);

  if (fs.existsSync(path.dirname(heroSlideDestFrontend))) {
    fs.writeFileSync(heroSlideDestFrontend, cleanedPng);
    console.log(`✓ Cleaned hero-slide-1.png copied to ${heroSlideDestFrontend}`);
  }
}

async function runMigration() {
  console.log(`Starting migration: ${migrationName}...`);

  await runQuery('BEGIN TRANSACTION');

  try {
    // 1. Update store_name in settings to 'AJMart'
    await runQuery(`
      INSERT INTO settings (key, value) VALUES ('store_name', 'AJMart')
      ON CONFLICT(key) DO UPDATE SET value = 'AJMart'
    `);
    console.log("✓ Updated settings.store_name to 'AJMart'");

    // 2. Update email in settings to 'info@ajmart.pk'
    await runQuery(`
      INSERT INTO settings (key, value) VALUES ('email', 'info@ajmart.pk')
      ON CONFLICT(key) DO UPDATE SET value = 'info@ajmart.pk'
    `);
    console.log("✓ Updated settings.email to 'info@ajmart.pk'");

    // 3. Update featured video title for video ID 6
    await runQuery(`
      UPDATE featured_videos 
      SET title = 'AJMart Store Walkthrough' 
      WHERE id = 6 OR title LIKE '%AJTraders Store Walkthrough%'
    `);
    console.log("✓ Updated featured_videos title to 'AJMart Store Walkthrough'");

    await runQuery('COMMIT');

    // 4. Clean hero slide 1 picture
    await cleanHeroSlideImage();

    // 5. Append to migrations.log
    const logEntry = `\n${new Date().toISOString()} - ${migrationName} - APPLIED - Renamed brand store_name to 'AJMart', updated email to 'info@ajmart.pk', updated video title, and removed 'AJTraders' watermark from first hero slide.\n`;
    fs.appendFileSync(migrationsLogPath, logEntry);
    console.log(`✓ Migration logged to ${migrationsLogPath}`);

  } catch (error) {
    await runQuery('ROLLBACK');
    console.error(`❌ Migration failed:`, error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

runMigration();
