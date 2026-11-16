# AJTraders - Project Rules (read before every task)

## Project Structure
/frontend                  React + Vite + Tailwind (customer and admin UI)
/backend
  server.js                Express app entry point
  database.sqlite          SQLite database (single source of truth)
  /src or /routes          API routes (do not change without need)
  /data                    CSV source files (products, images, descriptions)
  /public/images           Static images
    /categories            Category images
    /products              Product images
  /scripts
    import-products.js     GENERIC importer: reads a CSV from /backend/data
    /migrations            One-time fixes, numbered, run once each
    migrations.log         Record of every migration that has run
  /utils                   Shared helpers (db connection, slugify)

## Rules
1. NEVER create a new one-off script for a data task.
   - New products or prices  -> add rows to a CSV in /backend/data, then run
     `node scripts/import-products.js <csv-file>`
   - Image mapping           -> update the image_url column via the CSV importer
   - Anything that changes data once -> create /backend/scripts/migrations/NNN_description.js
2. Every script must be IDEMPOTENT (safe to run twice):
   - Products are identified by unique `name`. Use INSERT ... ON CONFLICT(name) DO UPDATE.
   - Migrations check migrations.log and skip if already applied.
3. Before adding anything, check whether it already exists (by name or slug).
4. Never delete products or files without asking the owner first.
5. Prices are in PKR. Stock defaults to 0 unless stated.
6. Category names must match exactly: Pulses, Rice, Oil and Ghee, Tea or Coffee,
   Noodle and Macaronis, Cleaning and Laundry, Personal Care, Cosmetics,
   Spices, Household, Everyday Grocery.
7. Image filenames & storage:
   - Stored path: /images/products/<category-slug>/<filename>
   - Filename format: brand-product-size.jpg (lowercase, hyphens, no spaces, e.g. personal-care/dove-soap-100g.jpg). For pulses gallery: pulses/<slug>-hand.jpg and pulses/<slug>-bag.png.
   - Image Standard: 800 x 800 px, pure white background (#FFFFFF), product centered (80-85% canvas fill, 8-10% padding), JPG (quality 85) or WebP, under 150 KB (hand photos under 200 KB). Bag images: 1000 x 1000 px transparent PNG.
   - Product gallery rule: Products can have multiple images stored in `product_images` table. Main gallery order: first image (sort_order 0) = main image (hand photo for pulses), second image (sort_order 1) = bag image.
   - Frontend cards: aspect-square, object-contain, bg-white, padding 8px. Hover transition to bag image on desktop, swipe indicators on mobile. Fallback to /images/placeholder-product.jpg.
8. After every task: update this file's "Change Log" section (one line per change).
9. Before finishing a task, report: files created, files changed, rows affected,
   and how to verify.

## Change Log
- 2026-10-16: Reorganized backend scripts, added generic CSV importer, created /backend/data/, archived one-off scripts, and verified 157 products (0 duplicates).
- 2026-10-19: Added store layout: navigation bar with mega menu, hero slider, featured sections, footer, floating WhatsApp, 8 new pages (/products, /categories, /offers, /about, /contact, /faq, /terms, /privacy), admin management for hero slides, featured videos, store settings, and product featuring (migration 002).
- 2026-10-19: Fixed page scroll alignment: added ScrollToTop listener, scroll-margin-top / scroll-padding-top for sticky header offset, and smooth pagination reset.
- 2026-10-20: Updated Sufi Oil and Ghee brand from 'AJ Brand' to 'Sufi' via migration 003, updated CSV template, and generated categorized branded products breakdown.
- 2026-10-20: Imported 17 product images across Cleaning, Household, and Everyday Grocery via migration 004, standardized to /images/products/, updated CSV template, and verified outer card and detail page dimensions.
- 2026-10-20: Replaced low-res 60x60 thumbnail images for all Max household products with high-resolution 1000x1000 product images, eliminating card and detail view blurriness.
- 2026-10-20: Updated image mapping for Max Long Bar and Max 60 via migration 005 and updated CSV template.
- 2026-10-20: Replaced Max Long Bar images with clean size-free 1000x1000 visuals, imported 10 noodles/macaroni images via migration 006, implemented multi-image card slider for Indomie Noodles (3 images), and interactive variant image switching (Chatpatta vs Chicken) for Knorr Family Pack on card and detail views.
- 2026-10-20: Added user-provided Lemon Max Long Bar photo to Max Long Bar and Max Longbar Double, and removed 165gm bar image from Max 60 via migration 007.
- 2026-10-20: Imported and mapped size-free cropped tea images from products (tea) to all 9 branded Tea products across all sizes via migration 008.
- 2026-10-20: Imported and mapped size-free cropped oil and ghee images from products(oil and ghee) to all 11 branded Oil & Ghee products via migration 009.
- 2026-10-20: Created category-slug folder structure for product images, added README.txt and updated image storage & processing standards.
- 2026-10-20: Sourced, standardized (800x800 white canvas) and imported 19 Personal Care images via generic importer, implemented Admin Image Upload with thumbnail preview and Sharp processing, generated image manifest and needs-owner audit.
- 2026-10-20: Sourced, standardized (800x800 white canvas) and imported 19 Spices images (Shan, National, Mehran) via generic importer, updated manifest and needs-owner audit.
- 2026-10-20: Standardized all product images across all categories into category-slug folders (/images/products/<category-slug>/<filename>) via migration 010, updated DB, CSV template, and frontend assets.
- 2026-10-21: Processed and imported 14 user-provided Pulses images into /images/products/pulses/ (800x800 white canvas, <150KB), mapped to DB via generic importer, updated template CSV, manifest, and flagged Malka Sabit Masar as missing.
- 2026-10-21: Implemented product gallery support (migration 011), brand asset lockups, pulses hand images gallery mapping, and programmatic clear pouch generator pipeline.
- 2026-10-21: Generated 14 wide-angle clear pillow pouches with pure pulse fills and AJTraders branding, linked to DB product_images, updated manifest, and verified frontend card hover and gallery switching.
- 2026-10-21: Re-sampled 100% pure pulse grain patches from sacks/mounds, eliminating all brown hand-skin background artifacts across all 14 pulse pouches.
- 2026-10-21: Re-sampled and eliminated palm-skin artifacts from Mota Chana and Lobia Chitri Red, and mapped Dall Masar hand & generated pouch visuals to Malka Sabit Masar activating all 15 pulses.
- 2026-11-14: Imported and standardized 8 user-provided images for 9 local products (Surf Aj, Aj Dish Washer, Aj Macroni, Golden Colourful Vermicelli, Mehran Kasuri Methi, Ajwa Talbina, Khulli Pati 1kg, Shahtaj Oil Bottle 5L/3L) via migration 012, updated template CSV, manifest, and product_images table.
- 2026-11-14: Imported and standardized 5 Khan Spices images (Haldi, Lal Mirch, Dara Mirch, Salan Masala, Dhaniya Powder), created new card for Dhaniya Powder 200gm (ID 169), and imported professional studio images for Laar Soap, Door Soap, Oat Meal, and Spiral via migration 013.
- 2026-11-15: Sourced, standardized (800x800, <200KB), and imported 9 professional market inspection hand photos for all Rice products (Seela Supreme, Seela VIP, Kainaat 1121 Special, Kainaat 1121 Basmati, Kainaat, Daghi Kainaat Rice 1121, Short Grain Poona, B-1 Tota, B-2 Tota) via migration 014.
- 2026-11-15: Generated 9 professional AJ Brand transparent pillow bags for Rice and 5 professional AJ Brand transparent pillow bags for Spices (Haldi, Lal Mirch, Dara Mirch, Salan Masala, Dhaniya Powder), updated Spices brand to 'AJ Brand', and enabled dual-gallery hover cards via migration 015.
- 2026-11-15: Updated store address & Google Maps to Namak Mandi Raja Bazar Rawalpindi, set owner contact cards (Aqib & Junaid), replaced hero placeholders with 3 user banner slides, configured 2 featured walkthrough videos, and embedded official shop visiting card via migration 016.
- 2026-11-15: Transcoded walkthrough videos from HEVC (H.265) to universal H.264 (AVC1) with faststart, generated real frame poster thumbnails via migration 017, and expanded Hero slider height (340px-560px) with tuned natural gradient.
- 2026-11-15: Stripped audio from first store walkthrough video, updated second video title to 'Wholesale Grocery & Branded Products Showcase', and optimized video cards and modal player for uncropped vertical (9:16) viewing via migration 018.
- 2026-11-15: Reordered homepage sections: moved Featured Videos to bottom right above the Trust Strip & Footer, moved Deals & Featured Products above videos, and polished section container styling.
- 2026-11-15: Added title and subtitle header to Trust Strip, positioned Featured Products above Today's Deals, and balanced video card dimensions (aspect-16/10 & aspect-4/3, max-w-3xl) to prevent screen dominance.
- 2026-11-15: Added official TikTok, Facebook, Instagram, and WhatsApp Channel links to settings (migration 019), implemented dedicated SocialIcons component with authentic WhatsApp SVG icons across FloatingWhatsApp, Header, Footer, Contact, and FAQ pages, and added Social Channels showcase section on Contact page.
- 2026-11-15: Reordered Contact page sections: positioned Shop Location Google Maps directly below the Visiting Card showcase, followed by Store Details & Inquiry form, and placed Official Social & Community Channels at the end.
- 2026-11-15: Aligned Contact form card height with the left store information grid using items-stretch and flex-layout, and styled the 'Submit via WhatsApp' button in WhatsApp brand green (#25D366) with official WhatsApp icon.
- 2026-11-15: Updated 24 products with zero stock to 50 via migration 020, implemented floating top announcement bar with promotional rotator (free delivery over PKR 5,000) & social icons, redesigned Login & Register with password reveal & auto-login, and added interactive User Account dropdown menu in Header.
- 2026-11-15: Replaced demo phone number across checkout order dispatch with Aqib's real WhatsApp number (0335-7727555 / 923357727555) in generateWhatsAppLink, Checkout page, Header fallback, and Terms.
- 2026-11-15: Enabled guest ordering without mandatory login, implemented customer loyalty reward points system (50 points on min order of PKR 2,000 for signed-in accounts), removed free delivery claims, and enforced PKR 5,000 minimum delivery order requirement across TopBar rotator, Cart, Checkout, FAQ, and Terms via migration 021.
- 2026-11-15: Built comprehensive order management for admin (view customer identity, confirm, cancel, update status, WhatsApp contact, itemized modal) and real-time customer tracking with visual 4-step progress stepper in My Orders.
- 2026-11-15: Appended 'Rice' to all Rice category products via migration 022 (updating 8 DB rows, CSV templates, and manifest), enabling search for 'rice' to return all 9 Rice products.
- 2026-11-15: Rebranded store name to 'AJMart' across database settings, user accounts, frontend components, and WhatsApp dispatch, and cleaned baked-in 'AJTraders' watermark from hero slide 1 via migration 023.
- 2026-11-15: Fixed light/dark mode contrast across the store, upgraded order tracking stepper with connected progress bar and high-contrast status nodes, fixed vanishing 'Out for Delivery' step via solid amber palette, and refined Tailwind light/dark palette and card separation.
- 2026-11-16: Prepared production deployment configurations: created vercel.json rewrite rules and Netlify _redirects for seamless SPA routing, verified dist build assets and environment variables.
- 2026-11-16: Added Node.js 20 LTS pinning (.node-version, .nvmrc, engines in package.json) to fix Render GLIBC_2.38 sqlite3 deployment issue.
- 2026-11-16: Integrated Turso cloud libSQL adapter (db.js) with interactive transactions, migrated catalog schema and 158 products to staging, preserving local SQLite and customer privacy.
- 2026-11-16: Implemented reservation-based inventory control (migration 024), authoritative checkout price/total recalculation, atomic libSQL transactions, helmet security headers, and auth rate limiting.
- 2026-11-16: Completed Phase 6 production readiness review: validated 59/59 tests (100% pass rate), audited zero production npm vulnerabilities, verified Vite production build, hardened production Turso fail-safe exit, and confirmed frontend stock compatibility.
- 2026-11-16: Hardened deployment configuration: isolated sqlite3 native module from Turso cloud runtime, enforced fatal exit on missing/default JWT_SECRET in production, verified dynamic 0.0.0.0 PORT binding, and preserved Render build configuration.
- 2026-11-16: Created and migrated production database (ajmart-prod): seeded 158 products, 11 categories, 211 images, 25 settings, 4 discounts, initialized reserved_stock to 0, preserved customer data isolation (0 users, 0 orders), and verified 11/11 read-only checks.
- 2026-11-16: Deployed hardened backend to Render production, verified all 7 public API endpoints return HTTP 200, and initialized verified primary administrator account in ajmart-prod with bcrypt hashing.
