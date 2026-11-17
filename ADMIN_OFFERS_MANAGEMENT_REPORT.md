# AJMart — Phase 16: Admin Offers & Discounts Management Report

**Date**: November 17, 2026  
**Platform**: AJMart Grocery E-Commerce  
**Author**: Antigravity DeepMind Agent  
**Environment**: Local Workspace + `ajmart-staging` (Turso Cloud SQLite)  
**Production Status**: **UNTOUCHED / READ-ONLY** (`ajmart-prod` has 0 changes)  

---

## Executive Summary

Phase 16 introduces a production-grade, secure, and intuitive **Offers & Discounts Management System** inside the AJMart Admin Dashboard. Store administrators can now add products to promotional deals, apply custom percentage discounts, edit existing offers, pause/reactivate promotions, and safely remove deals without touching catalog data or writing code.

All 25 functional, security, and edge-case test scenarios passed against `ajmart-staging` with a **100% pass rate (25/25)**. The frontend Vite production build succeeded cleanly with zero bundling errors.

---

## Task 1: Existing Architecture Inspection & Alignment

Before implementing new features, the existing database and codebase were thoroughly inspected:
1. **Existing Discounts Table**:
   - Schema: `Discounts (id, product_id, discount_percent, valid_until)`
   - Baseline Active Discounts:
     1. **Dalda Oil 1kg** (ID 36): 10% OFF (Original: PKR 610 $\rightarrow$ Deal: PKR 549)
     2. **Knorr Family Pack** (ID 127): 15% OFF (Original: PKR 300 $\rightarrow$ Deal: PKR 255)
     3. **Golden Pearl Romance Body Spray** (ID 148): 20% OFF (Original: PKR 500 $\rightarrow$ Deal: PKR 400)
     4. **Tapal Tea 1kg** (ID 79): 10% OFF (Original: PKR 1,850 $\rightarrow$ Deal: PKR 1,665)
2. **Schema Extension (Migration 026)**:
   - To support administrator activation/deactivation and scheduled promotions without breaking existing queries, two backwards-compatible columns were added via `026_add_offers_discounts_columns.js`:
     - `is_active INTEGER NOT NULL DEFAULT 1`
     - `start_date DATETIME DEFAULT CURRENT_TIMESTAMP`
   - All existing discounts retain `is_active = 1` and remain 100% active.
3. **Price Calculation Alignment**:
   - Discounts are calculated as `ROUND(price * (100.0 - discount_percent) / 100.0)`.
   - `CartContext` and `server.js` enforce authoritative server-side calculation.
   - In `ProductCard.jsx` and `ProductDetail.jsx`, variant prices now seamlessly inherit the product's active discount percentage (e.g. Flavour B at PKR 3,500 with 10% discount displays as PKR 3,150), matching backend billing.

---

## Task 2 & 9: Admin Dashboard Offers Management Interface

A dedicated **Offers & Discounts** management suite has been integrated into the Admin Dashboard (`/admin/offers`):

### 1. Sidebar Navigation
- Added `Offers & Discounts` navigation entry with the Lucide `Tag` icon in `AdminDashboard.jsx`.
- Positioned immediately alongside Orders and Products.

### 2. Comprehensive Offers Table
- **Product Overview**: Thumbnail image, product name, category badge.
- **Financial Metrics**: Original price, discount percentage badge (`% OFF` in `#E8A12D`), discounted deal price (in `#278A67`), and amount saved per unit (`-Rs X`).
- **Promotion Status Badges**:
  - `Active` (Emerald green badge with check icon)
  - `Inactive / Paused` (Amber badge with clock icon)
  - `Expired` (Red badge with cancel icon)
  - `Scheduled` (Blue badge for future start dates)
- **Schedule Window**: Start date and expiration date display.
- **Inline Actions**:
  - **Pause / Activate**: One-click status toggler.
  - **Edit**: Opens modal pre-populated with current settings.
  - **Remove**: Opens confirmation dialog for safe promotion deletion.

### 3. Add Offer Modal with Dynamic Preview
- **Product Search & Selector**: Search catalog by name or brand with thumbnail previews.
- **Conflict Prevention Alert**: If the selected product already has an active discount, the UI flags it and instructs the admin to edit the existing offer instead.
- **Custom Discount Input**: Accepts any valid percentage (e.g. 5%, 10%, 12.5%, 15%, 20%, 25%, 30%, etc.). Quick preset chips provided for convenience.
- **Live Pricing Preview Card**: Automatically computes and displays:
  - Original catalog price
  - Promotional deal price
  - Customer savings per unit
- **Optional Scheduling**: Datetime fields for `start_date` and `valid_until` (defaults to 1 year validity).

### 4. Safe Removal Guarantee
When an admin removes an offer:
- The discount row is deleted from `Discounts`.
- The product itself is **NOT** deleted.
- Original product pricing, descriptions, images, and inventory are **100% preserved**.
- Normal catalog pricing is restored on the storefront immediately.
- Historical orders retain their recorded purchase prices.

---

## Task 3: Overlapping Discount Prevention

To prevent accidental discount stacking or conflicting price displays:
1. **Database-Level Conflict Check**:
   Before creating or reactivating an offer, `server.js` executes:
   ```sql
   SELECT id, discount_percent FROM Discounts 
   WHERE product_id = ? 
     AND (is_active = 1 OR is_active IS NULL)
     AND (valid_until IS NULL OR valid_until >= datetime('now'))
   ```
   If an active discount exists, the API rejects the request with **HTTP 409 Conflict**:
   `"Product \"...\" already has an active discount (X%). Please edit or deactivate the existing offer instead."`
2. **Reactivation Guard**:
   When editing an inactive offer to reactivate it, the server verifies no other active discount exists for that same product before applying the update.

---

## Task 4: Storefront & Offers Page Synchronization

Storefront endpoints were updated to synchronize active discounts across all shopping surfaces:
- `GET /api/products/deals`: Returns all products with `p.is_active = 1` and `d.is_active = 1` within valid date ranges.
- `GET /api/products`: LEFT JOINs active discounts so promotional pricing and discount badges appear seamlessly on catalog browsing.
- `GET /api/products/:id`: LEFT JOINs active discounts for single product detail pages.
- `GET /api/products/featured`, `/search`, `/new-arrivals`: Synchronized with active discounts.
- **Automatic Deactivation**: When an offer is paused or passes its `valid_until` timestamp, it disappears from `/offers` and reverts to standard pricing across the entire storefront without hiding the product.

---

## Task 5: Security Controls & Authorization

1. **Authentication Guard**:
   `GET /api/admin/discounts`, `POST /api/discounts`, `PUT /api/discounts/:id`, and `DELETE /api/discounts/:id` strictly require `verifyToken` and `isAdmin`.
   - Unauthenticated requests $\rightarrow$ **HTTP 403 Forbidden**.
   - Authenticated customer accounts $\rightarrow$ **HTTP 403 Forbidden**.
2. **Input Validation**:
   - Rejects non-numeric, negative, 0%, and $\ge 100\%$ discount percentages with HTTP 400.
   - Sanitizes and validates dates.
3. **Authoritative Checkout**:
   - `POST /api/orders` queries active discounts from the database at the moment of checkout.
   - Client-side price tampering is completely overridden by server rates.
   - Purchased prices are recorded permanently in `OrderItems`.

---

## Task 6: Product Variant Compatibility

AJMart products with variants (e.g. Knorr Noodles flavors, Max Dishwash variants) now have unified pricing:
- Product-level percentage discounts apply consistently across all eligible variant prices.
- When customers switch variants on `ProductCard` or `ProductDetail`, the UI displays the variant's original price (strikethrough) and the discounted price in bold green.
- Checkout applies the discount to the selected variant price:
  `authoritativePrice = Math.round(variant.price * (100.0 - discountPct) / 100.0)`.

---

## Task 8: Investigation of Previous E2E Audit Findings

### Finding A: Concurrent Checkout Error
- **Observation in Previous Audit**: Under millisecond contention for remaining stock, Order 1 succeeded (201) while Order 2 returned HTTP 500 (transaction rolled back; no oversell occurred).
- **Root Cause Identified**: When SQLite/libSQL detects concurrent writes on the same row, or when `reserveUpdate.changes === 0` indicates stock exhaustion, the database threw a lock/concurrency exception. The transaction catch block caught this and returned a generic `res.status(500)`.
- **Resolution Implemented**: In `backend/server.js`, the catch block now checks for stock conflict and database lock indicators (`STOCK_CONFLICT`, `SQLITE_BUSY`, `Insufficient available stock`). When triggered, it returns **HTTP 409 Conflict** with an informative message:
  `"Stock availability conflict: Another customer recently purchased or reserved this item. Please review your cart."`
- **Result**: Concurrency safety is fully preserved, and the API responds with an explicit 409 rather than an unexplained 500.

### Finding B: Loyalty Points Discrepancy
- **Observation in Previous Audit**: The audit markdown report stated: `"PKR 4,000 order | 50 loyalty reward points awarded"`, whereas the business rule awards 50 points per complete PKR 2,000 spent (expected 100 points).
- **Code & Database Inspection**: In `backend/server.js` line 804, the code is:
  `pointsEarned = Math.floor(authoritativeTotal / 2000) * 50;`
  For PKR 4,000: `Math.floor(4000 / 2000) * 50 = 2 * 50 = 100 points`.
- **Test Suite Verification**: In `scratch/run_full_e2e_security_suite.js` line 271, the test assertion actually tested `pointsOrderRes.data.pointsEarned === 100` and passed!
- **Conclusion**: The backend implementation is **100% correct** and already implements the documented tier-based business rule. The discrepancy was purely a typographical slip in the summary text of the markdown table in the previous report. No code modification was necessary.

---

## Task 7: Staging Test Results (25/25 Passed)

The dedicated Phase 16 test suite (`scratch/test_phase16_offers_suite.js`) was executed against `ajmart-staging`:

| Test ID | Scenario | Expected Outcome | Actual Result | Status |
| :---: | :--- | :--- | :--- | :---: |
| **T01** | Admin creates a 10% offer | HTTP 201 with 10% discount | HTTP 201, ID created | **PASS** |
| **T02** | Admin creates a 20% offer | HTTP 201 with 20% discount | HTTP 201, ID created | **PASS** |
| **T03** | Admin edits 10% to 15% | HTTP 200 with 15% discount | HTTP 200, percent: 15 | **PASS** |
| **T04** | Admin deactivates an offer | HTTP 200 with `is_active: 0` | HTTP 200, is_active: 0 | **PASS** |
| **T05** | Admin reactivates an offer | HTTP 200 with `is_active: 1` | HTTP 200, is_active: 1 | **PASS** |
| **T06** | Admin removes an offer | HTTP 200 Success | HTTP 200, row deleted | **PASS** |
| **T07** | Product preserved after offer removal | HTTP 200, stock=50, active=1 | HTTP 200, stock intact | **PASS** |
| **T08** | Original price preserved | Price=4,000, discount cleared | Price=4000, discounted=null | **PASS** |
| **T09** | Discounted price calculated correctly | 15% of PKR 2,000 = PKR 1,700 | Discounted price = 1,700 | **PASS** |
| **T10** | Appears in Offers when active | Listed in `/api/products/deals` | Found: true, Price: 1,700 | **PASS** |
| **T11** | Disappears from Offers when inactive | Absent from `/api/products/deals` | Found: false | **PASS** |
| **T12** | Expired promotion stops applying | Excluded from deals, regular price | Found: false, normal price | **PASS** |
| **T13** | Customer cannot create an offer | HTTP 403 Forbidden | HTTP 403 | **PASS** |
| **T14** | Customer cannot edit an offer | HTTP 403 Forbidden | HTTP 403 | **PASS** |
| **T15** | Unauthenticated user cannot manage offers | HTTP 403 Forbidden | HTTP 403 | **PASS** |
| **T16** | Duplicate overlapping promotions rejected | HTTP 409 Conflict | HTTP 409 Conflict | **PASS** |
| **T17** | Negative discounts rejected | HTTP 400 Bad Request | HTTP 400 | **PASS** |
| **T18** | Discounts $\ge$ 100% rejected | HTTP 400 Bad Request | HTTP 400 | **PASS** |
| **T19** | Price tampering overridden at checkout | Authoritative sum billed (7,400) | HTTP 201, Total: 7,400 | **PASS** |
| **T20** | Cart and checkout price sync | Line item recorded at PKR 1,700 | Recorded price = 1,700 | **PASS** |
| **T21** | Product variants calculate correctly | Variant B (3,500 - 10% = 3,150) | Line item price = 3,150 | **PASS** |
| **T22** | Order history preserves purchased prices | Historical price remains 1,700 | Historical price = 1,700 | **PASS** |
| **T23** | Inventory reservation logic intact | Physical=50, Reserved=3 | Physical=50, Reserved=3 | **PASS** |
| **T24** | PKR 3,500 minimum order enforced | HTTP 400 with threshold warning | HTTP 400 | **PASS** |
| **T25** | Loyalty rewards unchanged | 100 points on PKR 4,000 order | pointsEarned = 100 | **PASS** |

---

## Production Verification (`ajmart-prod`)

Direct, non-mutating inspection of `ajmart-prod` confirmed zero alterations during this session:
- **Products**: Exactly 158 active products.
- **Physical Stock**: Exactly 7,343 units intact.
- **Reserved Stock**: Exactly 10 units (held by validation Order #4).
- **Discounts**: Exactly 4 baseline discounts intact.
- **Orders**: Exactly 4 historical orders.
- **Zero code pushed to GitHub, Render, or Netlify.**

---

## Files Changed & Created

1. **Created Files**:
   - `frontend/src/pages/admin/OffersAdmin.jsx` (Admin offers management page)
   - `backend/scripts/migrations/026_add_offers_discounts_columns.js` (Idempotent database migration)
   - `scratch/test_phase16_offers_suite.js` (Automated 25-test suite)
   - `ADMIN_OFFERS_MANAGEMENT_REPORT.md` (Master documentation report)
2. **Modified Files**:
   - `backend/server.js` (Added discounts endpoints, updated catalog queries with LEFT JOIN discounts, and added HTTP 409 concurrency error handling)
   - `frontend/src/pages/admin/AdminDashboard.jsx` (Added Offers & Discounts to sidebar navigation and router)
   - `frontend/src/components/ProductCard.jsx` (Unified variant discounted price rendering)
   - `frontend/src/pages/ProductDetail.jsx` (Unified variant discounted price rendering)
   - `AGENTS.md` (Change Log updated)
3. **Database Changes (Applied on Staging, Pending on Production)**:
   - `ALTER TABLE Discounts ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;`
   - `ALTER TABLE Discounts ADD COLUMN start_date DATETIME DEFAULT CURRENT_TIMESTAMP;`

---

## Recommended Production Rollout Plan (When Approved)

When approved by the store owner:
1. Run migration `026_add_offers_discounts_columns.js` against `ajmart-prod`.
2. Commit code changes: `feat(offers): add admin offers and discounts management system`.
3. Push to `origin/main` to trigger automated deployment to Netlify and Render.
4. Execute read-only smoke tests on live production to confirm the 4 baseline discounts and new admin interface.
