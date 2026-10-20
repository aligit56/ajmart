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
7. Image filenames: use lowercase, hyphens, no spaces (e.g. dall-chana.jpg).
   Stored path: /images/products/<filename>.
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
