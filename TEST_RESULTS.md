# AJMart Staging Integration & Inventory Verification Report

**Environment**: Turso Cloud libSQL (`ajmart-staging`)  
**Backend Runtime**: Node.js v20 (Express + Universal libSQL/SQLite Adapter)  
**Execution Timestamp**: 2026-11-16 20:48:00 UTC  
**Overall Status**: **33 / 33 TESTS PASSED (100% SUCCESS)**

---

## 1. Executive Summary

The database compatibility layer, atomic transaction mechanism, and reservation-based inventory lifecycle model for AJMart were verified against the isolated `ajmart-staging` database.

- **Original Database Preserved**: `backend/database.sqlite` (172 KB) was accessed strictly read-only and remains completely unchanged.
- **Reservation Inventory Model**: Stock is reserved at `Pending` order placement and physical stock is deducted strictly upon admin order confirmation (`Confirmed`).
- **Zero Overselling / Concurrency Safe**: Concurrency guards (`(stock - reserved_stock) >= requested_qty`) prevent multiple simultaneous checkout requests from overselling available inventory.
- **Persistence Across Restarts**: Tested by executing process kills and cold restarts of `node server.js`. All data, orders, reservations, and loyalty points persisted in Turso cloud.

---

## 2. Inventory Lifecycle & Reservation Matrix (Phase 5 - 16 Tests)

| Test ID | Scenario | Expected State | Actual Result | Status |
|:---:|---|---|---|:---:|
| **INV-01** | Product stock = 50, customer orders 10 | Physical 50, Reserved 10, Available 40 | Physical: 50, Reserved: 10, Available: 40 | **PASS** |
| **INV-02** | Second customer orders 40 | Physical 50, Reserved 50, Available 0 | Physical: 50, Reserved: 50, Available: 0 | **PASS** |
| **INV-03** | Third customer orders 10 | Rejected (HTTP 400 Insufficient stock) | Rejected: `"Insufficient available stock... only 0 available"` | **PASS** |
| **INV-04** | Admin confirms Order 1 | Physical 40, Reserved 40, Available 0 | Physical: 40, Reserved: 40, Available: 0 | **PASS** |
| **INV-05** | Admin confirms Order 2 | Physical 0, Reserved 0, Available 0 | Physical: 0, Reserved: 0, Available: 0 | **PASS** |
| **INV-06** | Cancel Pending order | Releases reservation, physical unchanged | Physical: 20, Reserved: 0, Available: 20 | **PASS** |
| **INV-07** | Confirm same order twice | Idempotent, physical stock never double-deducted | Stock remains 20 (no duplicate deduction) | **PASS** |
| **INV-08** | Cancel same order twice | Rejected with 400 (no duplicate restoration) | Status: 400, Reserved remains 0 | **PASS** |
| **INV-09** | Concurrent checkout race | Exactly 1 order succeeds, 1 rejected | 1 order 201 Created, 1 order 400 Rejected | **PASS** |
| **INV-10** | Inactive & ghost products | Rejected with HTTP 400 | Ghost: 400 Bad Request, Inactive: 400 Bad Request | **PASS** |
| **INV-11** | Negative & zero quantities | Rejected with HTTP 400 | Negative: 400 Bad Request, Zero: 400 Bad Request | **PASS** |
| **INV-12** | Database error rollback | Atomic rollback (0 stock reserved) | Status: 400, Reserved stock remains 0 | **PASS** |
| **INV-13** | Guest checkout inventory | Reserves inventory identically | Order 201 Created, Guest: true, Reserved: 10 | **PASS** |
| **INV-14** | Admin & user tracking | Consistent real-time tracking | Status: "Pending" synchronized in real time | **PASS** |
| **DUP-01** | Duplicate items in cart | Aggregated total checked against stock | Aggregated 40 units > 30 stock, rejected with 400 | **PASS** |
| **VAR-01** | Variant price lookup | Authoritative variant price applied | Brite "500 gm" charged at PKR 320 (not PKR 600) | **PASS** |

---

## 3. Core API Integration Matrix (Phase 1 - 17 Tests)

| # | Test Case | Target Endpoint / Action | Expected Result | Actual Result | Status |
|:---:|---|---|---|---|:---:|
| 1 | **Root Health Check** | `GET /` | HTTP 200 with service banner | `AJMart Backend API is running!` | **PASS** |
| 2 | **Category Catalog** | `GET /api/categories` | 11 categories returned | Exactly 11 categories retrieved | **PASS** |
| 3 | **Product Catalog** | `GET /api/products` | 158 products with images/variants | Exactly 158 active products | **PASS** |
| 4 | **Category Filter** | `GET /api/products?category=1` | Pulses filtered properly | 15 pulses returned (e.g. Dall Chana) | **PASS** |
| 5 | **Product Search** | `GET /api/products/search?q=rice` | All rice products returned | 9 rice products matching query | **PASS** |
| 6 | **Store Settings** | `GET /api/settings` | 25 key-value settings | `AJMart`, min order 5000, 923357727555 | **PASS** |
| 7 | **Hero Banner Slides** | `GET /api/hero-slides` | 3 banner slides | Exactly 3 active slides | **PASS** |
| 8 | **Featured Videos** | `GET /api/featured-videos` | 2 walkthrough video configs | Exactly 2 active videos | **PASS** |
| 9 | **Customer Registration** | `POST /api/auth/register` | Account created & JWT issued | User ID generated, JWT issued | **PASS** |
| 10 | **Customer Authentication** | `POST /api/auth/login` | Login success with points balance | Authenticated with points balance | **PASS** |
| 11 | **Admin Authorization Guard** | `POST /api/auth/login` | Validates `role = 'admin'` | Verified admin elevation and token | **PASS** |
| 12 | **Order Checkout** | `POST /api/orders` | Creates Order & OrderItems atomically | `order_id` assigned, 100 points rewarded | **PASS** |
| 13 | **Order Detail & Items** | `GET /api/orders/me` | Fetches order with attached items | Retrieved order with 2 item line records | **PASS** |
| 14 | **Admin Order Dispatch** | `PUT /api/orders/:id/status` | Updates status to 'Out for Delivery' | Status updated successfully | **PASS** |
| 15 | **Real-Time Order Tracking** | `GET /api/orders/me` | Customer sees new status immediately | Status reflected: `Out for Delivery` | **PASS** |
| 16 | **Order Validation Guard** | `POST /api/orders` (empty items) | HTTP 400 Bad Request | HTTP 400: `"Order must contain at least one item."` | **PASS** |
| 17 | **Cloud Persistence Check** | Direct libSQL query to Turso | Independent record verification | Order verified directly in Turso cloud | **PASS** |

---

## 4. Data Integrity & Relationship Verification

```
+------------------+-------------------+--------------------+------------------------+
| Table Name       | Local SQLite (Old)| Turso Staging (New)| Verification Status    |
+------------------+-------------------+--------------------+------------------------+
| Categories       | 11                | 11                 | 100% Matched           |
| Products         | 158               | 158                | 100% Matched           |
| product_images   | 211               | 211                | 100% Matched           |
| settings         | 25                | 25                 | 100% Matched           |
| hero_slides      | 3                 | 3                  | 100% Matched           |
| featured_videos  | 2                 | 2                  | 100% Matched           |
| Users (Privacy)  | 2 (local only)    | 0 (clean slate)    | Privacy Guaranteed     |
| Orders (Privacy) | 5 (local only)    | 0 (clean slate)    | Privacy Guaranteed     |
+------------------+-------------------+--------------------+------------------------+
```
