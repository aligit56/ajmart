# AJMart Production Database (`ajmart-prod`) Verification Report

- **Date & Time**: 2026-11-16T22:58:00+05:00
- **Environment**: Turso Cloud libSQL (Production)
- **Target Database**: `ajmart-prod` (AWS Region: `ap-south-1` / Mumbai)
- **Migration Status**: **COMPLETED SUCCESSFULLY**
- **Verification Status**: **11 / 11 CHECKS PASSED (100%)**

---

## 1. Executive Summary

The production database `ajmart-prod` has been initialized from scratch with complete schema definitions, indexes, constraints, and the verified catalog extracted from the local database. 

- **Total Tables**: 11
- **Catalog Products Migrated**: 158
- **Product Categories Migrated**: 11
- **Product Gallery Images**: 211
- **Initial Reserved Stock**: 0 across all 158 products
- **Active Discounts**: 4
- **Store Settings**: 25
- **Homepage Media**: 3 Hero Slides, 2 Featured Videos
- **Customer Privacy**: 0 users, 0 orders (100% data isolation preserved)

---

## 2. Table Counts & Schema Comparison

| Table Name | Source (Local SQLite) | Target (`ajmart-prod`) | Match Status | Notes |
| :--- | :---: | :---: | :---: | :--- |
| `Categories` | 11 | 11 | **MATCH** | All 11 approved categories |
| `Products` | 158 | 158 | **MATCH** | Foreign keys valid, prices intact |
| `product_images` | 211 | 211 | **MATCH** | Multi-image gallery mappings (`main`, `hand`, `bag`) |
| `Discounts` | 4 | 4 | **MATCH** | Active percentage discounts mapped |
| `settings` | 25 | 25 | **MATCH** | Store name, delivery thresholds, social links |
| `hero_slides` | 3 | 3 | **MATCH** | Active banner media and links |
| `featured_videos` | 2 | 2 | **MATCH** | Shop walkthrough videos |
| `Users` | *Private* | **0** | **ISOLATED** | No customer accounts or credentials migrated |
| `Orders` | *Private* | **0** | **ISOLATED** | No historical customer orders migrated |
| `OrderItems` | *Private* | **0** | **ISOLATED** | Clean order items table |
| `MigrationsLog` | 1 | 1 | **RECORDED** | Migration `024_add_reserved_stock_inventory.js` applied |

---

## 3. Detailed Read-Only Verification Checklist

| # | Verification Check | Assertion / Test Method | Result | Details |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Table Schema Verification | Inspect `sqlite_master` for all 11 required tables | **PASS** | Found: 11 / Missing: 0 |
| **2** | Categories Count | `SELECT COUNT(*) FROM Categories` | **PASS** | Count: 11 |
| **3** | Products Count | `SELECT COUNT(*) FROM Products` | **PASS** | Count: 158 |
| **4** | Foreign Key Integrity | Check for products with invalid `category_id` | **PASS** | 0 dangling product references |
| **5** | Reserved Stock Reset | `SELECT SUM(reserved_stock) FROM Products` | **PASS** | Exactly 0 reserved stock (0 non-zero items) |
| **6** | Product Pricing Sanity | Check for non-positive prices (`price <= 0`) | **PASS** | 0 items with zero price; stock range 13 to 97 |
| **7** | Image Mapping Paths | Check all images start with `/images/products/` | **PASS** | 211 images verified; 0 invalid paths |
| **8** | Store Settings Integrity | Check `store_name` and `minimum_order_amount` | **PASS** | `store_name`: 'AJMart', `min_order`: '5000' |
| **9** | Homepage Media Assets | Verify `hero_slides` and `featured_videos` | **PASS** | 3 slides, 2 videos |
| **10** | Customer Data Isolation | Ensure `Users` and `Orders` tables are empty | **PASS** | Users: 0, Orders: 0 (Privacy preserved) |
| **11** | Backend Query Compatibility | Execute catalog JOIN with categories & sorting | **PASS** | Successfully loaded 5 sample items |

---

## 4. Required Render Environment Variables

To connect your Render backend web service to `ajmart-prod`, set the following environment variables in the Render dashboard (**Environment** tab):

| Key | Recommended Value / Format | Purpose |
| :--- | :--- | :--- |
| `NODE_VERSION` | `20.20.2` | Enforces Node 20 LTS runtime |
| `NODE_ENV` | `production` | Enables production security & fatal exits |
| `TURSO_DATABASE_URL` | `<Your TURSO_PROD_DATABASE_URL from backend/.env>` | Connects to `ajmart-prod` |
| `TURSO_AUTH_TOKEN` | `<Your TURSO_PROD_AUTH_TOKEN from backend/.env>` | Production authentication token |
| `JWT_SECRET` | `<Your cryptographically random production secret>` | Protects authentication tokens |
| `FRONTEND_URL` | `https://<your-frontend-deployment-url>` | Configures CORS policy |

*(Note: Do not configure `PORT` manually; Render automatically provides `process.env.PORT`).*

---

## 5. Render Service Settings

- **Service Type**: Web Service
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm rebuild sqlite3 --build-from-source`
- **Start Command**: `node server.js`
- **Health Check Path**: `/` (Returns HTTP 200: `"AJMart Backend API is running!"`)

---

## 6. Safety Audit & Git Status

- `backend/database.sqlite`: **172 KB, 100% UNTOUCHED**.
- `backend/database.sqlite.backup`: **172 KB, INTACT**.
- `ajmart-staging`: **100% UNMODIFIED** (retained for future testing).
- `backend/.env`: **EXCLUDED FROM GIT** (`git status` confirms untracked/ignored).
- No code has been pushed to GitHub.
- No production deployment has been triggered.
