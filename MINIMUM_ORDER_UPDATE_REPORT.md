# AJMart — Minimum Delivery Order Update Report (PKR 3,500)

**Report Date:** November 17, 2026  
**Auditor:** Antigravity Autonomous Agent  
**Target Environment:** Staging Verified / Local Tested / Production Standby  
**Status:** READY FOR OWNER APPROVAL (No Production Writes, No Commits, No Pushes)

---

## 1. Executive Summary

In accordance with Phase 4 through Phase 9 of the project directives:
- The minimum doorstep delivery order threshold has been updated across the codebase from **PKR 2,000 to PKR 3,500**.
- The customer loyalty points reward policy was explicitly protected and **remains untouched at PKR 2,000** (customers still earn 50 reward points for every PKR 2,000 spent).
- Authoritative server-side price and discount recalculation ensures client-side price tampering and manipulated totals are strictly rejected.
- All 14 Phase 8 automated test cases were executed against the active Turso staging environment with a **100% pass rate**.
- Production database (`ajmart-prod`) remains untouched and on standby awaiting owner approval.

---

## 2. Files Modified

| File | Exact Changes Made | Purpose |
|---|---|---|
| `backend/server.js` | Line 716: updated fallback `minOrderAmount` from `2000` to `3500`. | Ensures backend independently enforces PKR 3,500 minimum even if DB setting is missing. Kept loyalty threshold at PKR 2,000. |
| `frontend/src/components/TopBar.jsx` | Line 10–11: badge updated to `MIN ORDER PKR 3,500` and text updated to `Minimum order of PKR 3,500 required for doorstep delivery across Rawalpindi & Islamabad`. | Updates mobile & desktop announcement rotators. Preserved 50 reward points per PKR 2,000 promo item. |
| `frontend/src/pages/Cart.jsx` | Line 21: updated fallback from `2000` to `3500`. | Re-computes dynamic remaining amount alert (`Add PKR (3500 - cartTotal) more to proceed`) and disables checkout button. |
| `frontend/src/pages/Checkout.jsx` | Line 50: updated fallback from `2000` to `3500`. | Blocks submission and surfaces warning alert if order is below PKR 3,500. Preserved `Math.floor(cartTotal / 2000) * 50` loyalty points. |
| `frontend/src/pages/FAQ.jsx` | Line 13: updated delivery answer from `PKR 2,000` to `PKR 3,500`. | Updates customer-facing delivery policy FAQ. |
| `frontend/src/pages/Terms.jsx` | Line 44: updated delivery policy from `PKR 2,000` to `PKR 3,500`. | Updates official terms and conditions for delivery. |
| `frontend/src/pages/admin/SettingsAdmin.jsx` | Line 14, 263: updated initial state & placeholder text to `PKR 3,500`. | Keeps administrative settings interface in sync. |

---

## 3. Database Settings Requiring Production Changes

When the owner grants approval to update the live production database (`ajmart-prod`), the following atomic SQL statements must be executed:

```sql
-- Target: ajmart-prod (Turso Cloud SQLite)
UPDATE settings
SET value = '3500'
WHERE key = 'minimum_order_amount';

UPDATE settings
SET value = 'Minimum order of PKR 3,500 required for delivery across Rawalpindi & Islamabad'
WHERE key = 'announcement_bar_text';
```

### Pre-Update Verification & Protected Rows:
- Target Database: `ajmart-prod-aligit56.aws-ap-south-1.turso.io`
- Verified Rows Affected: Exactly 2 rows (`minimum_order_amount` and `announcement_bar_text`).
- Unmodified Settings (MUST REMAIN INTACT):
  - `points_threshold` = `'2000'` (Preserved)
  - `points_reward` = `'50'` (Preserved)
  - Customer records, order history, inventory stock, and product pricing remain completely untouched.

---

## 4. Automated Testing Results (Phase 8 Suite)

The automated test suite was executed against the active staging server and database with 14 test cases:

| # | Test Case Scenario | Input / Conditions | Expected Authoritative Result | Status |
|---|---|---|---|:---:|
| 1 | Read Setting | `GET /api/settings` | Returns `minimum_order_amount: '3500'` | ✅ PASS |
| 2 | Below Minimum | 1 unit cheap item (PKR 35) | HTTP 400: `Minimum order amount is PKR 3,500.` | ✅ PASS |
| 3 | Old Minimum (PKR 2,000) | Cart total exactly PKR 2,000 | HTTP 400: Rejected under new PKR 3,500 threshold | ✅ PASS |
| 4 | Boundary Test (PKR 3,499) | Cart total PKR 3,499 | HTTP 400: Rejected (1 PKR short) | ✅ PASS |
| 5 | Exact Minimum (PKR 3,500) | Cart total exactly PKR 3,500 | HTTP 201: Accepted, Order placed successfully | ✅ PASS |
| 6 | Above Minimum (PKR 4,000) | Cart total PKR 4,000 | HTTP 201: Accepted | ✅ PASS |
| 7 | Promotional Discounts | Item PKR 5,000 with 10% promo | HTTP 201: Authoritatively computed as PKR 4,500 | ✅ PASS |
| 8 | Client Price Tampering | Client sends `price: 50` on PKR 3,500 item | Client price overridden; authoritatively billed at PKR 3,500 | ✅ PASS |
| 9 | Admin Checkout Guard | Authenticated admin token | HTTP 403: Administrators restricted from placing orders | ✅ PASS |
| 10 | Invalid Quantities | Quantity = 0 and Quantity = -2 | HTTP 400: Positive integer quantity enforced | ✅ PASS |
| 11 | Atomic Stock Reservation | Order placed for 2 units | `reserved_stock` incremented atomically by 2 | ✅ PASS |
| 12 | Cancellation Release | Customer cancels pending order | `reserved_stock` decremented atomically by 2 | ✅ PASS |
| 13 | Loyalty Points Protection | Customer order of PKR 4,000 | Awarded 100 points (2 x 50 points based on PKR 2,000 threshold) | ✅ PASS |
| 14 | Mobile String Formatting | Cart total PKR 2,100 | Dynamic banner: `Add PKR 1,400 more to proceed` | ✅ PASS |

**Test Failures Encountered & Resolved:**
- Zero test failures remain. All 14 tests completed with 100% pass rate.
- Staging test orders and temporary test records were cleanly pruned after test execution.

---

## 5. Rollback Instructions

If for any business reason the minimum delivery order must be reverted to PKR 2,000:

1. **Database Rollback (`ajmart-prod` / staging / local SQLite):**
   ```sql
   UPDATE settings SET value = '2000' WHERE key = 'minimum_order_amount';
   UPDATE settings SET value = 'Minimum order of PKR 2,000 required for delivery across Rawalpindi & Islamabad' WHERE key = 'announcement_bar_text';
   ```
2. **Code Rollback:**
   - In `backend/server.js`, revert line 716 fallback to `2000`.
   - In `frontend/src/pages/Cart.jsx` and `Checkout.jsx`, revert fallback to `2000`.
   - In `TopBar.jsx`, `FAQ.jsx`, `Terms.jsx`, and `SettingsAdmin.jsx`, replace `3,500` with `2,000`.
   - Re-run `npm --prefix frontend run build`.

---

## 6. Remaining Risks & Pre-Deployment Checklist

1. **Production Write Safety**:
   - As mandated, **no changes have been committed, pushed, or deployed**, and **no production database updates have been executed**.
2. **Zero Deployment Drift**:
   - The frontend production build (`dist/`) builds cleanly with zero errors.
   - All category images and product images continue to resolve with resilient fallbacks.
3. **Owner Approval Needed**:
   - Owner confirmation is required to apply the database change to `ajmart-prod` and to deploy the frontend/backend updates to Netlify and Render.
