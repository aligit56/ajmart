const sharp = require('../backend/node_modules/sharp');
const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.resolve(__dirname, '../frontend/public/images/categories'),
  path.resolve(__dirname, '../backend/public/images/categories')
];

async function optimizeImages() {
  console.log('=== OPTIMIZING CATEGORY IMAGES ===\n');

  for (const dir of targetDirs) {
    console.log(`Processing directory: ${dir}`);
    if (!fs.existsSync(dir)) continue;

    // 1. Optimize Rice (rice.jpg: was 4.06 MB, 5472x3648!)
    const ricePath = path.join(dir, 'rice.jpg');
    if (fs.existsSync(ricePath)) {
      const riceBuf = fs.readFileSync(ricePath);
      const optimizedRice = await sharp(riceBuf)
        .resize(800, 533, { fit: 'cover' })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
      fs.writeFileSync(ricePath, optimizedRice);
      console.log(`✓ Optimized rice.jpg: 4.06 MB -> ${(optimizedRice.length / 1024).toFixed(1)} KB (800x533 JPEG)`);

      // Also create a webp version for modern browsers
      const riceWebp = await sharp(riceBuf)
        .resize(800, 533, { fit: 'cover' })
        .webp({ quality: 85 })
        .toBuffer();
      fs.writeFileSync(path.join(dir, 'rice.webp'), riceWebp);
      console.log(`✓ Generated rice.webp: ${(riceWebp.length / 1024).toFixed(1)} KB`);
    }

    // 2. Optimize Pulses (pulses.webp: was 441 KB, 1280x1280)
    const pulsesPath = path.join(dir, 'pulses.webp');
    if (fs.existsSync(pulsesPath)) {
      const pulsesBuf = fs.readFileSync(pulsesPath);
      const optimizedPulses = await sharp(pulsesBuf)
        .resize(800, 800, { fit: 'cover' })
        .webp({ quality: 85 })
        .toBuffer();
      fs.writeFileSync(pulsesPath, optimizedPulses);
      console.log(`✓ Optimized pulses.webp: 441 KB -> ${(optimizedPulses.length / 1024).toFixed(1)} KB (800x800 WebP)`);

      // Also create a jpg fallback
      const pulsesJpg = await sharp(pulsesBuf)
        .resize(800, 800, { fit: 'cover' })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
      fs.writeFileSync(path.join(dir, 'pulses.jpg'), pulsesJpg);
      console.log(`✓ Generated pulses.jpg: ${(pulsesJpg.length / 1024).toFixed(1)} KB`);
    }

    // 3. Optimize Household (Household.PNG / Household.png: was 1.26 MB)
    const householdFiles = ['Household.PNG', 'Household.png', 'household.png', 'household.PNG'];
    let householdBuf = null;
    for (const hf of householdFiles) {
      const p = path.join(dir, hf);
      if (fs.existsSync(p)) {
        householdBuf = fs.readFileSync(p);
        break;
      }
    }
    if (householdBuf) {
      const optHousehold = await sharp(householdBuf)
        .resize(800, 533, { fit: 'cover' })
        .png({ compressionLevel: 8 })
        .toBuffer();
      fs.writeFileSync(path.join(dir, 'Household.PNG'), optHousehold);
      fs.writeFileSync(path.join(dir, 'Household.png'), optHousehold);
      fs.writeFileSync(path.join(dir, 'household.png'), optHousehold);
      console.log(`✓ Optimized Household.png / Household.PNG: 1.26 MB -> ${(optHousehold.length / 1024).toFixed(1)} KB (800x533 PNG)`);

      const householdWebp = await sharp(householdBuf)
        .resize(800, 533, { fit: 'cover' })
        .webp({ quality: 85 })
        .toBuffer();
      fs.writeFileSync(path.join(dir, 'Household.webp'), householdWebp);
      fs.writeFileSync(path.join(dir, 'household.webp'), householdWebp);
    }

    // 4. Fix files that had .WEBP extension but were actually JPEG format
    const webpFiles = [
      'spices.WEBP', 'cosmetics.WEBP', 'cleaning.WEBP',
      'noodles.WEBP', 'cookingoil.WEBP', 'grocery.WEBP',
      'Coffetea.WEBP', 'personalcare.WEBP', 'IMG_7942.WEBP'
    ];

    for (const wf of webpFiles) {
      const p = path.join(dir, wf);
      if (fs.existsSync(p)) {
        const buf = fs.readFileSync(p);
        // Convert to genuine WebP
        const genuineWebp = await sharp(buf)
          .resize(800, 533, { fit: 'cover' })
          .webp({ quality: 85 })
          .toBuffer();
        fs.writeFileSync(p, genuineWebp);

        // Also write lowercase variant (.webp)
        const lowerName = wf.replace('.WEBP', '.webp');
        fs.writeFileSync(path.join(dir, lowerName), genuineWebp);

        // Also create true JPEG fallback (.jpg)
        const genuineJpg = await sharp(buf)
          .resize(800, 533, { fit: 'cover' })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();
        fs.writeFileSync(path.join(dir, wf.replace(/\.WEBP$/i, '.jpg')), genuineJpg);

        console.log(`✓ Re-encoded ${wf} & ${lowerName} into genuine WebP: ${(genuineWebp.length / 1024).toFixed(1)} KB`);
      }
    }
  }

  console.log('\nAll category images optimized and re-encoded successfully!');
}

optimizeImages().catch(console.error);
