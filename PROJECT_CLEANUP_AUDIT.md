# AJMart — Comprehensive Project Cleanup Audit

**Audit Date:** November 17, 2026  
**Auditor:** Antigravity Autonomous Agent  
**Repository:** `aligit56/ajmart`  
**Status:** READ-ONLY AUDIT COMPLETE — ZERO FILES DELETED (Awaiting User Approval)

---

## Executive Summary

A comprehensive read-only audit of the entire AJMart repository (`frontend/`, `backend/`, public media directories, scripts, and documentation) was performed to identify obsolete assets, replaced branding, unreferenced raw media, and duplicate development resources.

| Metric | Count / Size |
|---|---|
| **Total Non-Ignored Files Inspected** | **1,008 files** (194.92 MB total disk footprint) |
| **Active Essential Production Files (MUST KEEP)** | **926 files** (155.98 MB) |
| **Files Recommended for Safe Deletion (SAFE TO REMOVE)** | **53 files** (28.04 MB estimated storage savings) |
| **Files Requiring Manual Decision (NEEDS MANUAL REVIEW)** | **29 files** (10.90 MB) |
| **Total Potential Storage Savings** | **~38.94 MB (~20.0% of non-ignored repository size)** |

---

## Detailed Cleanup Candidate Matrix

| File / Directory | Size | Reason Considered Unused | Reference Verification | Risk | Recommendation |
|---|---|---|---|---|---|
| `backend/public/videos/IMG_6128.MOV` | 12.55 MB | Raw Apple QuickTime 9:16 store walkthrough recording. | Not referenced in DB (`featured_videos` references `ajtraders-store-walkthrough.mp4`) or frontend code. | Low | **SAFE TO REMOVE** |
| `backend/public/videos/IMG_8205.MP4` | 3.69 MB | Raw uncompressed products inspection video. | Not referenced in DB (`featured_videos` references `ajtraders-products-inspection.mp4`) or frontend code. | Low | **SAFE TO REMOVE** |
| `backend/public/images/hero/first hero slide.png` | 2.35 MB | Raw 2.35 MB initial hero slide. | Database `hero_slides` row 1 references `/images/hero/hero-slide-1.png` (646 KB). Unused duplicate. | Low | **SAFE TO REMOVE** |
| `backend/public/images/hero/second hero slide.png` | 2.46 MB | Duplicate uncompressed hero slide. | Database `hero_slides` row 2 references `/images/hero/hero-slide-2.png` (2.46 MB). Exact binary duplicate. | Low | **SAFE TO REMOVE** |
| `backend/public/images/hero/third slide hero.png` | 2.34 MB | Duplicate uncompressed hero slide. | Database `hero_slides` row 3 references `/images/hero/hero-slide-3.png` (2.34 MB). Exact binary duplicate. | Low | **SAFE TO REMOVE** |
| `backend/public/images/brand/ajbasketicon.png` | 712.1 KB | Raw user-uploaded square basket icon. | Converted & replaced by optimized `ajmart-icon.webp` (40 KB) and `favicon-192.png`. Not referenced in code or DB. | Low | **SAFE TO REMOVE** |
| `backend/public/images/brand/website footer.png` | 590.7 KB | Raw user-uploaded footer logo asset. | Converted & replaced by optimized `ajmart-logo-dark.webp` (125 KB). Not referenced in code or DB. | Low | **SAFE TO REMOVE** |
| `backend/public/images/brand/ajmainpage.png` | 584.4 KB | Raw user-uploaded primary horizontal logo. | Converted & replaced by optimized `ajmart-logo-primary.webp` (130 KB) and `ajmart-logo-primary-header.webp`. Not referenced in code or DB. | Low | **SAFE TO REMOVE** |
| `backend/public/images/products (Household)/` (11 files) | 976.2 KB | Legacy pre-migration directory for Max products. | Migration 010 moved and standardized all household items into `/images/products/household/`. No DB or code references. | Low | **SAFE TO REMOVE** |
| `backend/public/images/products (noodles)/` (10 files) | 526.4 KB | Legacy pre-migration directory for Indomie/Knorr/Bake Parlor. | Migration 010 standardized all items into `/images/products/noodle-and-macaronis/`. No DB or code references. | Low | **SAFE TO REMOVE** |
| `backend/public/images/products(oil and ghee)/` (11 files) | 436.5 KB | Legacy pre-migration directory for Sufi, Dalda, Shahtaj. | Migration 010 standardized all items into `/images/products/oil-and-ghee/`. No DB or code references. | Low | **SAFE TO REMOVE** |
| `backend/public/images/products (tea)/` (7 files) | 398.2 KB | Legacy pre-migration directory for Tapal, Islamabad Tea. | Migration 010 standardized all items into `/images/products/tea-or-coffee/`. No DB or code references. | Low | **SAFE TO REMOVE** |
| `backend/public/images/products (cleaning)/` (6 files) | 297.4 KB | Legacy pre-migration directory for Surf, Brite, Bonus. | Migration 010 standardized all items into `/images/products/cleaning-and-laundry/`. No DB or code references. | Low | **SAFE TO REMOVE** |
| `backend/public/images/products(everyday grocery)/` (1 file) | 25.1 KB | Legacy pre-migration directory for Kisan Dalia. | Standardized into `/images/products/everyday-grocery/`. No DB or code references. | Low | **SAFE TO REMOVE** |
| `frontend/public/images/brand/ajtraders-logo.png` | 16.7 KB | Old blue crown/shield storefront logo. | Completely replaced by AJMart green and gold logo (`ajmart-logo-primary.webp`). Verified 0 imports/usages. | Low | **SAFE TO REMOVE** |
| `backend/public/images/brand/ajtraders-logo.png` | 16.7 KB | Duplicate of old blue crown/shield logo in backend. | Zero references in backend or database. | Low | **SAFE TO REMOVE** |
| `frontend/public/images/brand/ajtraders-logo-white.png` | 16.1 KB | Old white blue-crown logo. | Replaced by `ajmart-logo-dark.webp`. Zero references. | Low | **SAFE TO REMOVE** |
| `backend/public/images/brand/ajtraders-logo-white.png` | 16.1 KB | Duplicate of old white blue-crown logo in backend. | Zero references. | Low | **SAFE TO REMOVE** |
| `frontend/public/logo-alpha.png` | 13.8 KB | Initial Vite/React template placeholder logo. | Zero references across codebase and database. | Low | **SAFE TO REMOVE** |
| `frontend/public/icons.svg` | 5.0 KB | Obsolete SVG icon sprite from initial boilerplate. | Zero references. Modern UI exclusively imports SVGs from `lucide-react`. | Low | **SAFE TO REMOVE** |
| `frontend/public/favicon.png` | 4.8 KB | Old generic favicon. | Superseded by `favicon.svg`, `favicon-32.png`, and `favicon-192.png` in `index.html`. | Low | **SAFE TO REMOVE** |
| `backend/scripts/check_schema.js` | 411 bytes | Ad-hoc single-table schema printing script. | Superseded by migrations and robust db inspection tools. | Low | **SAFE TO REMOVE** |
| `backend/public/images/products/pulses/*.jfif` (15 files) | 4.70 MB | Original raw mobile photo submissions of pulse mounds. | Standardized into `*-hand.jpg` and `*-bag.png` in `/images/products/pulses/`. The original source files are not served to visitors. | Medium | **NEEDS MANUAL REVIEW** *(Owner may wish to retain source photos for future re-sampling)* |
| `frontend/public/images/products/pulses/*.jfif` (15 files) | 4.70 MB | Duplicate of raw photo submissions copied into frontend. | Frontend only serves `.jpg`, `.webp`, and `.png`. Never loaded by frontend components. | Medium | **NEEDS MANUAL REVIEW** *(Identical to backend copies; safe to prune if backend retains them)* |
| `backend/scripts/bag-generator/` (patches, crops, fills) | ~1.50 MB | Intermediate grain patches and crop strips used to generate clear SVG pulse bags. | Bag generator output files (`*-bag.png`) are in `/images/products/`. These are the intermediate textures. | Medium | **NEEDS MANUAL REVIEW** *(Useful if new pulse varieties need transparent bags generated in the future)* |
| Historical Root Documentation (`TEST_RESULTS.md`, `SECURITY_TEST_RESULTS.md`, `PRODUCTION_DB_VERIFICATION.md`, `AJMART_UI_AND_BUSINESS_RULES_UPDATE.md`, `PRODUCTION_ORDER_AUDIT.md`) | ~68 KB total | Markdown logs from previous development and testing phases. | Informational documentation only. Does not affect runtime, build, or deployment. | Low | **NEEDS MANUAL REVIEW** *(Can be archived to a `docs/archive/` folder or retained in Git history)* |

---

## Critical Files Protected (MUST KEEP)

The following files were explicitly inspected and marked **CRITICAL / MUST KEEP**:

1. **Brand Identity & Favicons**:
   - `frontend/public/images/brand/ajmart-logo-primary.webp` & `.png` (Main desktop & mobile logo)
   - `frontend/public/images/brand/ajmart-logo-primary-header.webp` & `.png` (Header-optimized version)
   - `frontend/public/images/brand/ajmart-logo-dark.webp` & `.png` (Footer logo)
   - `frontend/public/images/brand/ajmart-icon.webp` & `.png` (Square basket emblem)
   - `frontend/public/favicon.svg`, `favicon-32.png`, `favicon-192.png` (Active multi-res favicons)
   - `frontend/public/images/brand/ajtraders-visiting-card.jpg` (Embedded visiting card on Contact page)
2. **Category Visuals & Fallbacks**:
   - All 11 `.webp` and 11 `.jpg` category assets in `frontend/public/images/categories/` and `backend/public/images/categories/`. (Active runtime fallbacks in `imageHelpers.js`).
3. **Product Media**:
   - All 211 active product images in `frontend/public/images/products/` and `backend/public/images/products/` matching database records.
4. **Hero Slides & Active Walkthrough Videos**:
   - `hero-slide-1.png`, `hero-slide-2.png`, `hero-slide-3.png`
   - `ajtraders-store-walkthrough.mp4`, `ajtraders-store-walkthrough-thumb.jpg`
   - `ajtraders-products-inspection.mp4`, `ajtraders-products-inspection-thumb.jpg`
5. **Placeholders**:
   - `placeholder.jpg` (Category fallback)
   - `placeholder-product.jpg` (Product card fallback)
6. **Infrastructure & Deployment**:
   - `frontend/public/_redirects` (Netlify SPA routing rules)
   - `netlify.toml` (Netlify build settings)
   - `backend/server.js`, `backend/utils/db.js` (Server & Turso Cloud database adapter)
   - `backend/.env`, `frontend/.env.production` (Environment configuration)
   - `backend/scripts/migrations/` (All 25 numbered migrations and `migrations.log`)

---

## Summary of Findings & Next Steps

1. **Immediate Deletion Status**: **ZERO** files have been deleted.
2. **Immediate Action Required**: Review the above table and confirm whether you approve removing the **53 "SAFE TO REMOVE"** items (yielding **28.04 MB** disk space savings).
3. **Manual Review Items**: Indicate whether you would like to keep the raw `.jfif` photos as backups or prune them to minimize repo clone times.
