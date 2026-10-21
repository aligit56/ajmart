const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const sqlite3 = require('sqlite3').verbose();
const { execSync } = require('child_process');

const pulsesData = [
  { id: 12, slug: 'dall-chana', name: 'Dall Chana', urdu: 'دال چنا' },
  { id: 13, slug: 'lobia-kapsool', name: 'Lobia Kapsool', urdu: 'لوبیا کیپسول' },
  { id: 14, slug: 'dall-mong', name: 'Dall Mong', urdu: 'دال مونگ' },
  { id: 15, slug: 'dall-masar', name: 'Dall Masar', urdu: 'دال مسور' },
  { id: 16, slug: 'mota-chana', name: 'Mota Chana', urdu: 'موٹا چنا' },
  { id: 17, slug: 'kala-masar', name: 'Kala Masar', urdu: 'کالا مسور' },
  { id: 18, slug: 'kala-mash', name: 'Kala Mash', urdu: 'کالا ماش' },
  { id: 19, slug: 'chana-bareek', name: 'Chana Bareek', urdu: 'چنا باریک' },
  { id: 20, slug: 'mong-sabit', name: 'Mong Sabit', urdu: 'مونگ ثابت' },
  { id: 21, slug: 'dall-mash', name: 'Dall Mash', urdu: 'دال ماش' },
  { id: 22, slug: 'malka-sabit-masar', name: 'Malka Sabit Masar', urdu: 'ملکہ ثابت مسور' },
  { id: 23, slug: 'kala-chana', name: 'Kala Chana', urdu: 'کالا چنا' },
  { id: 24, slug: 'mong-chilka-dall', name: 'Mong Chilka Dall', urdu: 'مونگ چھلکا دال' },
  { id: 25, slug: 'lobia-chitri-red', name: 'Lobia Chitri Red', urdu: 'لوبیا چتری' },
  { id: 26, slug: 'lobia-desi-bareek', name: 'Lobia Desi Bareek', urdu: 'لوبیا دیسی باریک' }
];

const logoPath = path.resolve(__dirname, '../../public/images/brand/ajtraders-logo-white.png');
const patchesDir = path.resolve(__dirname, 'patches');
const fillsDir = path.resolve(__dirname, 'fills');
const dbPath = path.resolve(__dirname, '../../database.sqlite');
const backendPulsesDir = path.resolve(__dirname, '../../public/images/products/pulses');
const frontendPulsesDir = path.resolve(__dirname, '../../../frontend/public/images/products/pulses');

if (!fs.existsSync(fillsDir)) fs.mkdirSync(fillsDir, { recursive: true });

async function run() {
  console.log(`Starting bag generation for ${pulsesData.length} pulses...`);

  // Read logo
  const logoWhiteBase64 = fs.readFileSync(logoPath).toString('base64');
  const logoWhiteDataUri = `data:image/png;base64,${logoWhiteBase64}`;

  // 1. Generate seamless fills via python helper
  console.log('Generating seamless pulse fills for all pulses...');
  execSync('python backend/scripts/bag-generator/generate_fills.py', { stdio: 'inherit' });

  // Pouch outline path (wide angle pillow bag)
  const pouchPathD = `
    M 260 165
    Q 215 320, 222 500
    Q 215 680, 268 810
    L 732 810
    Q 785 680, 778 500
    Q 785 320, 740 165
    Z
  `;

  const pouchMaskSvg = `
    <svg width="1000" height="1000" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
      <path d="${pouchPathD}" fill="#ffffff" />
    </svg>
  `;

  // Process each pulse
  for (const p of pulsesData) {
    const fillPath = path.join(fillsDir, `${p.slug}_fill.jpg`);
    const backendOut = path.join(backendPulsesDir, `${p.slug}-bag.png`);
    const frontendOut = path.join(frontendPulsesDir, `${p.slug}-bag.png`);

    // Mask the pulse fill
    const maskedTexture = await sharp(fillPath)
      .ensureAlpha()
      .composite([
        {
          input: Buffer.from(pouchMaskSvg),
          blend: 'dest-in'
        }
      ])
      .png()
      .toBuffer();

    // SVG Overlay
    const overlaySvg = `
      <svg width="1000" height="1000" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="labelShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="12" />
            <feOffset dx="0" dy="8" />
            <feComponentTransfer><feFuncA type="linear" slope="0.22"/></feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#0F172A" stop-opacity="0.30"/>
            <stop offset="50%" stop-color="#0F172A" stop-opacity="0.14"/>
            <stop offset="80%" stop-color="#0F172A" stop-opacity="0.03"/>
            <stop offset="100%" stop-color="#0F172A" stop-opacity="0"/>
          </radialGradient>

          <linearGradient id="crimpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#94A3B8"/>
            <stop offset="15%" stop-color="#E2E8F0"/>
            <stop offset="50%" stop-color="#F8FAFC"/>
            <stop offset="85%" stop-color="#CBD5E1"/>
            <stop offset="100%" stop-color="#94A3B8"/>
          </linearGradient>

          <linearGradient id="crimpDepth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.55"/>
            <stop offset="20%" stop-color="#64748B" stop-opacity="0.18"/>
            <stop offset="80%" stop-color="#475569" stop-opacity="0.20"/>
            <stop offset="100%" stop-color="#1E293B" stop-opacity="0.35"/>
          </linearGradient>

          <linearGradient id="glossLeftCurve" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
            <stop offset="30%" stop-color="#FFFFFF" stop-opacity="0.08"/>
            <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.35"/>
            <stop offset="70%" stop-color="#FFFFFF" stop-opacity="0.10"/>
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>

          <linearGradient id="glossRightRim" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
            <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
          </linearGradient>

          <clipPath id="wideLabelClip">
            <rect x="325" y="365" width="350" height="275" rx="16" ry="16" />
          </clipPath>
        </defs>

        <!-- 1. SOFT GROUND SHADOW -->
        <ellipse cx="500" cy="874" rx="255" ry="18" fill="url(#groundShadow)"/>

        <!-- 2. CLEAR PLASTIC GLOSS TINT -->
        <path d="${pouchPathD}" fill="#FFFFFF" fill-opacity="0.04" />

        <!-- 3. TOP CRIMP HEAT SEAL -->
        <path d="
          M 260 165
          L 260 125
          L 263 121 L 268 125 L 273 121 L 278 125 L 283 121 L 288 125 L 293 121 L 298 125
          L 303 121 L 308 125 L 313 121 L 318 125 L 323 121 L 328 125 L 333 121 L 338 125
          L 343 121 L 348 125 L 353 121 L 358 125 L 363 121 L 368 125 L 373 121 L 378 125
          L 383 121 L 388 125 L 393 121 L 398 125 L 403 121 L 408 125 L 413 121 L 418 125
          L 423 121 L 428 125 L 433 121 L 438 125 L 443 121 L 448 125 L 453 121 L 458 125
          L 463 121 L 468 125 L 473 121 L 478 125 L 483 121 L 488 125 L 493 121 L 498 125
          L 503 121 L 508 125 L 513 121 L 518 125 L 523 121 L 528 125 L 533 121 L 538 125
          L 543 121 L 548 125 L 553 121 L 558 125 L 563 121 L 568 125 L 573 121 L 578 125
          L 583 121 L 588 125 L 593 121 L 598 125 L 603 121 L 608 125 L 613 121 L 618 125
          L 623 121 L 628 125 L 633 121 L 638 125 L 643 121 L 648 125 L 653 121 L 658 125
          L 663 121 L 668 125 L 673 121 L 678 125 L 683 121 L 688 125 L 693 121 L 698 125
          L 703 121 L 708 125 L 713 121 L 718 125 L 723 121 L 728 125 L 733 121 L 738 125
          L 740 125
          L 740 165
          Z
        " fill="url(#crimpGradient)" stroke="#94A3B8" stroke-width="1.2" />

        <path d="M 260 123 L 740 123 L 740 165 L 260 165 Z" fill="url(#crimpDepth)" />
        <line x1="261" y1="130" x2="739" y2="130" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.8"/>
        <line x1="261" y1="134" x2="739" y2="134" stroke="#475569" stroke-width="1" stroke-opacity="0.3"/>
        <line x1="261" y1="139" x2="739" y2="139" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.7"/>
        <line x1="261" y1="143" x2="739" y2="143" stroke="#475569" stroke-width="1" stroke-opacity="0.25"/>
        <line x1="261" y1="148" x2="739" y2="148" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.7"/>
        <line x1="261" y1="152" x2="739" y2="152" stroke="#475569" stroke-width="1" stroke-opacity="0.25"/>
        <line x1="261" y1="157" x2="739" y2="157" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.8"/>
        <line x1="261" y1="161" x2="739" y2="161" stroke="#475569" stroke-width="1" stroke-opacity="0.3"/>

        <!-- 4. BOTTOM CRIMP HEAT SEAL -->
        <path d="
          M 268 810
          L 268 850
          L 271 854 L 276 850 L 281 854 L 286 850 L 291 854 L 296 850
          L 301 854 L 306 850 L 311 854 L 316 850 L 321 854 L 326 850 L 331 854 L 336 850
          L 341 854 L 346 850 L 351 854 L 356 850 L 361 854 L 366 850 L 371 854 L 376 850
          L 381 854 L 386 850 L 391 854 L 396 850 L 401 854 L 406 850 L 411 854 L 416 850
          L 421 854 L 426 850 L 431 854 L 436 850 L 441 854 L 446 850 L 451 854 L 456 850
          L 461 854 L 466 850 L 471 854 L 476 850 L 481 854 L 486 850 L 491 854 L 496 850
          L 501 854 L 506 850 L 511 854 L 516 850 L 521 854 L 526 850 L 531 854 L 536 850
          L 541 854 L 546 850 L 551 854 L 556 850 L 561 854 L 566 850 L 571 854 L 576 850
          L 581 854 L 586 850 L 591 854 L 596 850 L 601 854 L 606 850 L 611 854 L 616 850
          L 621 854 L 626 850 L 631 854 L 636 850 L 641 854 L 646 850 L 651 854 L 656 850
          L 661 854 L 666 850 L 671 854 L 676 850 L 681 854 L 686 850 L 691 854 L 696 850
          L 701 854 L 706 850 L 711 854 L 716 850 L 721 854 L 726 850 L 731 854 L 732 850
          L 732 810
          Z
        " fill="url(#crimpGradient)" stroke="#94A3B8" stroke-width="1.2" />

        <path d="M 268 810 L 732 810 L 732 852 L 268 852 Z" fill="url(#crimpDepth)" />
        <line x1="269" y1="816" x2="731" y2="816" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.8"/>
        <line x1="269" y1="820" x2="731" y2="820" stroke="#475569" stroke-width="1" stroke-opacity="0.3"/>
        <line x1="269" y1="825" x2="731" y2="825" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.7"/>
        <line x1="269" y1="829" x2="731" y2="829" stroke="#475569" stroke-width="1" stroke-opacity="0.25"/>
        <line x1="269" y1="834" x2="731" y2="834" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.7"/>
        <line x1="269" y1="838" x2="731" y2="838" stroke="#475569" stroke-width="1" stroke-opacity="0.25"/>
        <line x1="269" y1="843" x2="731" y2="843" stroke="#FFFFFF" stroke-width="1.2" stroke-opacity="0.8"/>

        <!-- 5. OUTER POUCH PERIMETER -->
        <path d="${pouchPathD}" fill="none" stroke="#94A3B8" stroke-width="2" />

        <!-- 6. HIGH-GLOSS CLEAR PLASTIC REFLECTIONS -->
        <path d="
          M 275 170
          Q 240 330, 245 500
          Q 240 670, 285 805
          L 340 805
          Q 300 670, 305 500
          Q 300 330, 325 170
          Z
        " fill="url(#glossLeftCurve)" />

        <path d="M 235 200 Q 228 500, 245 780" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.45" />

        <path d="
          M 675 170
          Q 700 330, 695 500
          Q 700 670, 660 805
          L 715 805
          Q 760 670, 755 500
          Q 760 330, 725 170
          Z
        " fill="url(#glossRightRim)" />

        <path d="M 260 210 Q 380 250, 480 200 Q 380 235, 260 210 Z" fill="#FFFFFF" fill-opacity="0.22" />
        <path d="M 520 200 Q 620 250, 740 210 Q 620 235, 520 200 Z" fill="#FFFFFF" fill-opacity="0.20" />

        <!-- 7. CENTER RETAIL BRANDING LABEL -->
        <g filter="url(#labelShadow)">
          <rect x="325" y="365" width="350" height="275" rx="16" ry="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />

          <g clip-path="url(#wideLabelClip)">
            <rect x="325" y="365" width="350" height="78" fill="#0F2E59" />
            <rect x="325" y="439" width="350" height="4" fill="#00B8D9" />
            <image href="${logoWhiteDataUri}" x="375" y="371" width="250" height="64" preserveAspectRatio="xMidYMid meet" />
          </g>

          <rect x="415" y="455" width="170" height="20" rx="10" ry="10" fill="#F0F9FF" />
          <text x="500" y="469" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#0284C7" letter-spacing="1.2">PREMIUM QUALITY</text>

          <text x="500" y="506" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="900" fill="#0F172A" letter-spacing="0.5">${p.name.toUpperCase()}</text>

          <text x="500" y="538" text-anchor="middle" font-family="'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', 'Urdu Typesetting', Arial, sans-serif" font-size="22" font-weight="700" fill="#334155">${p.urdu}</text>

          <line x1="350" y1="552" x2="650" y2="552" stroke="#E2E8F0" stroke-width="1" />
          <text x="500" y="567" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="600" fill="#64748B" letter-spacing="0.8">100% CLEAN &amp; SORTED • HIGH PROTEIN</text>

          <rect x="345" y="579" width="310" height="52" rx="8" ry="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />

          <text x="365" y="598" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="700" fill="#64748B" letter-spacing="0.8">NET WEIGHT</text>
          <text x="365" y="621" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#0F2E59">1 KG</text>

          <line x1="470" y1="587" x2="470" y2="623" stroke="#CBD5E1" stroke-width="1" />

          <text x="490" y="598" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="700" fill="#64748B" letter-spacing="0.8">ORIGIN / MARKET</text>
          <text x="490" y="612" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="#0284C7">RAWALPINDI / ISLAMABAD</text>
          <text x="490" y="624" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="600" fill="#64748B">GUARANTEED FRESHNESS</text>
        </g>
      </svg>
    `;

    const finalBuffer = await sharp(maskedTexture)
      .composite([
        {
          input: Buffer.from(overlaySvg),
          top: 0,
          left: 0
        }
      ])
      .png({ compressionLevel: 8 })
      .toBuffer();

    fs.writeFileSync(backendOut, finalBuffer);
    fs.writeFileSync(frontendOut, finalBuffer);
    console.log(`✓ Generated bag: ${p.slug}-bag.png`);
  }

  // 2. Link all bags into SQLite product_images
  console.log('Linking bag images into SQLite product_images table...');
  const db = new sqlite3.Database(dbPath);
  for (const p of pulsesData) {
    const bagRelUrl = `/images/products/pulses/${p.slug}-bag.png`;
    const handRelUrl = `/images/products/pulses/${p.slug}-hand.jpg`;

    // Link hand image
    if (fs.existsSync(path.join(backendPulsesDir, `${p.slug}-hand.jpg`))) {
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO product_images (product_id, image_url, image_type, sort_order)
          VALUES (?, ?, 'hand', 0)
          ON CONFLICT(product_id, image_type) DO UPDATE SET
            image_url = excluded.image_url,
            sort_order = excluded.sort_order
        `, [p.id, handRelUrl], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Update Products table image_url for backward compatibility
      await new Promise((resolve, reject) => {
        db.run(`UPDATE Products SET image_url = ? WHERE id = ?`, [handRelUrl, p.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Link bag image
    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO product_images (product_id, image_url, image_type, sort_order)
        VALUES (?, ?, 'bag', 1)
        ON CONFLICT(product_id, image_type) DO UPDATE SET
          image_url = excluded.image_url,
          sort_order = excluded.sort_order
      `, [p.id, bagRelUrl], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  db.close();
  console.log('✓ All 15 pulses linked with hand and bag images in database successfully!');
}

run().catch(err => {
  console.error('❌ Failed batch bag generation:', err);
  process.exit(1);
});
