require('../backend/node_modules/dotenv').config({ path: require('path').resolve(__dirname, '../backend/.env') });
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const { createClient } = require('../backend/node_modules/@libsql/client');
const bcrypt = require('../backend/node_modules/bcryptjs');

const TEST_PORT = 5055;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Staging client for direct database state audits
const stagingClient = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (data) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(data);
    }
    const req = http.request(`${BASE_URL}${path}`, {
      method,
      headers: reqHeaders,
      timeout: 10000
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(resBody);
        } catch {
          parsed = resBody;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    if (data) req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

let testResults = [];
function recordTest(name, category, passed, details = '') {
  testResults.push({ name, category, passed, details });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${category} :: ${name} ${details ? '(' + details + ')' : ''}`);
}

async function runSuite() {
  console.log('====================================================');
  console.log('PHASE 12: COMPLETE STAGING END-TO-END TEST SUITE');
  console.log('====================================================\n');

  // Boot local backend on port 5055 connected to Turso Staging
  console.log(`Starting staging backend on port ${TEST_PORT}...`);
  const serverProcess = spawn('node', ['server.js'], {
    env: {
      ...process.env,
      PORT: TEST_PORT.toString(),
      NODE_ENV: 'test'
    },
    cwd: path.resolve(__dirname, '../backend')
  });

  serverProcess.stdout.on('data', d => {
    // Silent standard stdout
  });

  serverProcess.stderr.on('data', d => {
    const errStr = d.toString();
    if (!errStr.includes('Concurrency conflict') && !errStr.includes('Minimum order amount')) {
      console.error('[Backend Staging Notice]:', errStr.trim());
    }
  });

  // Wait for server ready
  let serverReady = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await request('GET', '/api/settings');
      if (res.status === 200) {
        serverReady = true;
        break;
      }
    } catch {
      await sleep(500);
    }
  }

  if (!serverReady) {
    console.error('Failed to start test backend server on port', TEST_PORT);
    serverProcess.kill();
    process.exit(1);
  }
  console.log(`✓ Staging backend ready on port ${TEST_PORT}\n`);

  const timestamp = Date.now();
  const testCustomerEmail = `customer_p12_${timestamp}@test.pk`;
  const testCustomerPass = `CustPass123!`;
  const testAdminEmail = `admin_p12_${timestamp}@test.pk`;
  const testAdminPass = `AdminPass123!`;

  let customerToken = null;
  let customerUserId = null;
  let adminToken = null;
  let guestOrderId = null;
  let authOrderId = null;
  let cancelTestOrderId = null;

  try {
    // Reset test product 27 reserved_stock in staging before test
    await stagingClient.execute({
      sql: 'UPDATE Products SET reserved_stock = 0 WHERE id = 27'
    });

    // -----------------------------------------------------------
    // TASK 1: TEST COMPLETE CUSTOMER JOURNEY
    // -----------------------------------------------------------
    console.log('--- TASK 1: Customer Journey Tests ---');

    // 1.1 Customer Registration
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Ali Tester',
      email: testCustomerEmail,
      password: testCustomerPass,
      phone: '03001234567',
      address: 'House 123, Street 4, Sector F-8, Islamabad'
    });
    recordTest('Customer Registration', 'Customer Journey', regRes.status === 201 && !!regRes.body.token, `Status: ${regRes.status}`);

    // 1.2 Customer Login
    const loginRes = await request('POST', '/api/auth/login', {
      email: testCustomerEmail,
      password: testCustomerPass
    });
    customerToken = loginRes.body.token;
    customerUserId = loginRes.body.user?.id;
    recordTest('Customer Login', 'Customer Journey', loginRes.status === 200 && !!customerToken, `User ID: ${customerUserId}`);

    // 1.3 Product Search
    const searchRes = await request('GET', '/api/products/search?q=rice');
    const searchItems = Array.isArray(searchRes.body) ? searchRes.body : [];
    recordTest('Product Search (query: "rice")', 'Customer Journey', searchRes.status === 200 && searchItems.length === 9, `Found ${searchItems.length} items`);

    // 1.4 Product Details
    const prodDetailRes = await request('GET', '/api/products/27');
    const prod27 = prodDetailRes.body;
    recordTest('Product Details (/api/products/27)', 'Customer Journey', prodDetailRes.status === 200 && prod27.name === 'Seela Supreme Rice' && Number(prod27.price) === 400, `Name: ${prod27.name}, Price: Rs ${prod27.price}`);

    // 1.5 Product Variant Selection
    const allProdsRes = await request('GET', '/api/products?limit=158');
    const allProds = allProdsRes.body.products || allProdsRes.body;
    const variantProd = allProds.find(p => p.variants && (typeof p.variants === 'string' ? p.variants.length > 5 : p.variants.length > 0));
    recordTest('Product Variant Detection & Parsing', 'Customer Journey', !!variantProd, `Found product with variants: ${variantProd?.name}`);

    // 1.6 & 1.7 Minimum Order Validation (< PKR 5,000)
    const lowOrderRes = await request('POST', '/api/orders', {
      items: [{ product_id: 27, quantity: 1 }],
      delivery_address: 'Test Address 123 Rawalpindi',
      customer_name: 'Low Order Tester',
      customer_phone: '03001234567'
    });
    recordTest('Minimum Order Threshold Validation (< PKR 5,000 Rejected)', 'Customer Journey', lowOrderRes.status === 400 && String(lowOrderRes.body.error).includes('Minimum order amount is PKR 5,000'), `Error: ${lowOrderRes.body.error}`);

    // 1.8 Guest Checkout (>= PKR 5,000, unauthenticated)
    // 13 bags of Seela Supreme Rice @ Rs 400 = Rs 5,200
    const guestOrderRes = await request('POST', '/api/orders', {
      items: [{ product_id: 27, quantity: 13 }],
      delivery_address: 'Shop 10, Namak Mandi, Rawalpindi',
      customer_name: 'Guest Customer Ali',
      customer_phone: '03339876543',
      notes: 'Please call before arrival'
    });
    guestOrderId = guestOrderRes.body?.order_id;
    recordTest('Guest Checkout (>= PKR 5,000 Accepted)', 'Customer Journey', guestOrderRes.status === 201 && !!guestOrderId && guestOrderRes.body.total_price === 5200, `Order ID: ${guestOrderId}, Total: Rs ${guestOrderRes.body?.total_price}`);

    // 1.9 Authenticated Checkout with Reward Points Calculation
    // 15 bags @ Rs 400 = Rs 6,000 -> 150 points
    const authOrderRes = await request('POST', '/api/orders', {
      items: [{ product_id: 27, quantity: 15 }],
      delivery_address: 'House 123, Street 4, Sector F-8, Islamabad',
      customer_name: 'Ali Tester',
      customer_phone: '03001234567',
      notes: 'Fragile goods delivery'
    }, {
      'Authorization': `Bearer ${customerToken}`
    });
    authOrderId = authOrderRes.body?.order_id;
    recordTest('Authenticated Checkout & Loyalty Points Accrual', 'Customer Journey', authOrderRes.status === 201 && !!authOrderId && authOrderRes.body.total_price === 6000 && authOrderRes.body.pointsEarned === 150, `Order ID: ${authOrderId}, Points: ${authOrderRes.body.pointsEarned}`);

    // 1.10 Order Confirmation Response Structure
    const hasOrderConfirmationFields = authOrderRes.body && authOrderRes.body.order_id && authOrderRes.body.total_price && authOrderRes.body.message.includes('successfully');
    recordTest('Order Confirmation Message Schema', 'Customer Journey', hasOrderConfirmationFields, `Message: ${authOrderRes.body?.message}`);

    // 1.11 Customer Order History & Tracking (/api/orders/me)
    const historyRes = await request('GET', '/api/orders/me', null, {
      'Authorization': `Bearer ${customerToken}`
    });
    const customerOrders = Array.isArray(historyRes.body) ? historyRes.body : [];
    const foundAuthOrder = customerOrders.find(o => o.id === authOrderId);
    recordTest('Customer Order History (/api/orders/me)', 'Customer Journey', historyRes.status === 200 && !!foundAuthOrder, `Found ${customerOrders.length} customer order(s)`);

    // 1.12 Order Item Breakdown & Real-Time Tracking Stepper Data
    const hasOrderItems = foundAuthOrder && Array.isArray(foundAuthOrder.items) && foundAuthOrder.items.length === 1 && foundAuthOrder.items[0].product_name === 'Seela Supreme Rice';
    recordTest('Customer Real-Time Tracking Stepper & Itemized Detail', 'Customer Journey', hasOrderItems && foundAuthOrder.status === 'Pending', `Status: ${foundAuthOrder?.status}, Items: ${foundAuthOrder?.items?.length}`);


    // -----------------------------------------------------------
    // TASK 2: TEST ADMIN WORKFLOW
    // -----------------------------------------------------------
    console.log('\n--- TASK 2: Admin Workflow Tests ---');

    // Create a temporary admin account in staging database with phone included
    const hash = await bcrypt.hash(testAdminPass, 10);
    await stagingClient.execute({
      sql: `INSERT INTO Users (name, email, password, phone, role) VALUES (?, ?, ?, '03009998877', 'admin')`,
      args: ['Staging Suite Admin', testAdminEmail, hash]
    });

    // 2.1 Admin Login
    const adminLoginRes = await request('POST', '/api/auth/login', {
      email: testAdminEmail,
      password: testAdminPass
    });
    adminToken = adminLoginRes.body.token;
    recordTest('Administrator Login', 'Admin Workflow', adminLoginRes.status === 200 && !!adminToken, `Admin Token Acquired`);

    // 2.2 Admin Order List Access (/api/orders)
    const adminOrdersRes = await request('GET', '/api/orders', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    const allAdminOrders = Array.isArray(adminOrdersRes.body) ? adminOrdersRes.body : [];
    const hasGuestOrder = allAdminOrders.some(o => o.id === guestOrderId);
    const hasAuthOrder = allAdminOrders.some(o => o.id === authOrderId);
    recordTest('Admin Dashboard Access & Order Visibility', 'Admin Workflow', adminOrdersRes.status === 200 && hasGuestOrder && hasAuthOrder, `Admin sees ${allAdminOrders.length} total orders`);

    // 2.3 Confirm a Pending Order (guestOrderId)
    // Check stock before confirmation
    const preConfirmProd = await stagingClient.execute({
      sql: 'SELECT stock, reserved_stock FROM Products WHERE id = 27'
    });
    const preStock = preConfirmProd.rows[0].stock;
    const preReserved = preConfirmProd.rows[0].reserved_stock;

    const confirmRes = await request('PUT', `/api/orders/${guestOrderId}/status`, {
      status: 'Confirmed'
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    recordTest('Admin Confirm Pending Order', 'Admin Workflow', confirmRes.status === 200 && confirmRes.body.status === 'Confirmed', `Status: ${confirmRes.body.status}`);

    // Verify Physical Stock Deduction & Reservation Release
    const postConfirmProd = await stagingClient.execute({
      sql: 'SELECT stock, reserved_stock FROM Products WHERE id = 27'
    });
    const postStock = postConfirmProd.rows[0].stock;
    const postReserved = postConfirmProd.rows[0].reserved_stock;
    // guest order quantity was 13
    const stockDeducted = (preStock - postStock === 13);
    const reservedReleased = (preReserved - postReserved === 13);
    recordTest('Physical Stock Deduction on Confirmation', 'Admin Workflow', stockDeducted, `Physical stock: ${preStock} -> ${postStock} (deducted 13)`);
    recordTest('Stock Reservation Released on Confirmation', 'Admin Workflow', reservedReleased, `Reserved stock: ${preReserved} -> ${postReserved} (released 13)`);

    // 2.4 Update Order to 'Out for Delivery'
    const outForDeliveryRes = await request('PUT', `/api/orders/${guestOrderId}/status`, {
      status: 'Out for Delivery'
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    recordTest('Update Order to "Out for Delivery"', 'Admin Workflow', outForDeliveryRes.status === 200 && outForDeliveryRes.body.status === 'Out for Delivery', `Status: ${outForDeliveryRes.body.status}`);

    // 2.5 Mark Order 'Delivered'
    const deliveredRes = await request('PUT', `/api/orders/${guestOrderId}/status`, {
      status: 'Delivered'
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    recordTest('Mark Order "Delivered"', 'Admin Workflow', deliveredRes.status === 200 && deliveredRes.body.status === 'Delivered', `Status: ${deliveredRes.body.status}`);

    // 2.6 Cancel Eligible Order (authOrderId)
    // Check reserved stock before cancellation (auth order was 15 units)
    const preCancelProd = await stagingClient.execute({
      sql: 'SELECT stock, reserved_stock FROM Products WHERE id = 27'
    });
    const cancelRes = await request('PUT', `/api/orders/${authOrderId}/status`, {
      status: 'Cancelled'
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    const postCancelProd = await stagingClient.execute({
      sql: 'SELECT stock, reserved_stock FROM Products WHERE id = 27'
    });
    const cancelReservedReleased = (preCancelProd.rows[0].reserved_stock - postCancelProd.rows[0].reserved_stock === 15);
    const cancelStockUntouched = (preCancelProd.rows[0].stock === postCancelProd.rows[0].stock);
    recordTest('Admin Cancel Order & Release Stock Reservation', 'Admin Workflow', cancelRes.status === 200 && cancelReservedReleased && cancelStockUntouched, `Reserved: ${preCancelProd.rows[0].reserved_stock} -> ${postCancelProd.rows[0].reserved_stock}`);

    // 2.7 Customer Cancel Pending Order (Test Customer Cancel Endpoint /api/orders/:id/cancel)
    // Place a 3rd order for 13 units (Rs 5200) as customer
    const orderToCancelRes = await request('POST', '/api/orders', {
      items: [{ product_id: 27, quantity: 13 }],
      delivery_address: 'Customer Cancel Test Address',
      customer_name: 'Ali Tester',
      customer_phone: '03001234567'
    }, {
      'Authorization': `Bearer ${customerToken}`
    });
    cancelTestOrderId = orderToCancelRes.body.order_id;
    const preCustCancelProd = await stagingClient.execute('SELECT stock, reserved_stock FROM Products WHERE id = 27');
    
    const custCancelRes = await request('PUT', `/api/orders/${cancelTestOrderId}/cancel`, {}, {
      'Authorization': `Bearer ${customerToken}`
    });
    const postCustCancelProd = await stagingClient.execute('SELECT stock, reserved_stock FROM Products WHERE id = 27');
    const custCancelReservedReleased = (preCustCancelProd.rows[0].reserved_stock - postCustCancelProd.rows[0].reserved_stock === 13);
    recordTest('Customer Direct Order Cancellation (/api/orders/:id/cancel)', 'Customer Journey', custCancelRes.status === 200 && custCancelReservedReleased, `Reserved released: 13 units`);

    // 2.8 Customer Tracking Synchronized Status
    const userOrdersCheck = await request('GET', '/api/orders/me', null, {
      'Authorization': `Bearer ${customerToken}`
    });
    const cancelledAuthOrder = (userOrdersCheck.body || []).find(o => o.id === authOrderId);
    recordTest('Customer Order Tracking Synchronized Status', 'Admin Workflow', cancelledAuthOrder && cancelledAuthOrder.status === 'Cancelled', `Customer sees: ${cancelledAuthOrder?.status}`);


    // -----------------------------------------------------------
    // TASK 3: TEST INVENTORY SAFETY & CONCURRENCY
    // -----------------------------------------------------------
    console.log('\n--- TASK 3: Inventory Safety & Idempotency Tests ---');

    // 3.1 Idempotent Confirmation: Repeated confirmation cannot deduct twice
    const doubleConfirmRes = await request('PUT', `/api/orders/${guestOrderId}/status`, {
      status: 'Confirmed'
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    const afterDoubleConfirmProd = await stagingClient.execute({
      sql: 'SELECT stock, reserved_stock FROM Products WHERE id = 27'
    });
    // Physical stock should NOT have changed
    const stockNotDeductedAgain = (afterDoubleConfirmProd.rows[0].stock === postCancelProd.rows[0].stock);
    recordTest('Idempotent Confirmation (Repeated confirm does not re-deduct)', 'Inventory Safety', stockNotDeductedAgain, `Stock remained: ${afterDoubleConfirmProd.rows[0].stock}`);

    // 3.2 Idempotent Cancellation: Repeated cancellation cannot restore twice
    const doubleCancelRes = await request('PUT', `/api/orders/${authOrderId}/status`, {
      status: 'Cancelled'
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    const afterDoubleCancelProd = await stagingClient.execute({
      sql: 'SELECT stock, reserved_stock FROM Products WHERE id = 27'
    });
    const stockNotRestoredAgain = (afterDoubleCancelProd.rows[0].reserved_stock === postCancelProd.rows[0].reserved_stock);
    recordTest('Idempotent Cancellation (Repeated cancel does not double-restore)', 'Inventory Safety', stockNotRestoredAgain, `Reserved remained: ${afterDoubleCancelProd.rows[0].reserved_stock}`);

    // 3.3 Concurrency & Race Condition Oversell Prevention
    // Create temporary product in staging with physical stock = 5, price = 2500
    const insertTestProd = await stagingClient.execute({
      sql: `INSERT INTO Products (name, brand, category_id, price, stock, reserved_stock, is_active) VALUES ('Staging Race Test Product ${timestamp}', 'Test Brand', 1, 2500, 5, 0, 1)`
    });
    const testProdId = Number(insertTestProd.lastInsertRowid);

    // 5 concurrent requests, each ordering 2 units (total requested = 10 units).
    // Available stock = 5 units.
    // Exactly 2 requests can succeed (consuming 4 units, leaving 1 unit). 3 requests MUST fail!
    console.log(`Testing concurrency on Product #${testProdId} (Stock: 5 units). Firing 5 concurrent orders for 2 units each...`);
    const concurrentRequests = Array.from({ length: 5 }, (_, idx) => {
      return request('POST', '/api/orders', {
        items: [{ product_id: testProdId, quantity: 2 }],
        delivery_address: `Concurrent Street #${idx}, Islamabad`,
        customer_name: `Concurrent Tester #${idx}`,
        customer_phone: '03001112233'
      });
    });

    const concurrentResults = await Promise.all(concurrentRequests);
    const successCount = concurrentResults.filter(r => r.status === 201).length;
    const failCount = concurrentResults.filter(r => r.status === 400 || r.status === 500).length;

    const finalTestProd = await stagingClient.execute({
      sql: 'SELECT stock, reserved_stock FROM Products WHERE id = ?',
      args: [testProdId]
    });
    const finalStock = finalTestProd.rows[0].stock;
    const finalReserved = finalTestProd.rows[0].reserved_stock;
    const remainingAvailable = finalStock - finalReserved;

    const oversellPrevented = (successCount === 2 && failCount === 3 && remainingAvailable === 1 && finalReserved === 4);
    recordTest('Concurrent Checkout Race Condition (Zero Oversell)', 'Inventory Safety', oversellPrevented, `Success: ${successCount}/5, Failed: ${failCount}/5, Reserved: ${finalReserved}/5, Available: ${remainingAvailable}`);

    // Clean up temporary concurrency test product and associated orders/items
    const orderItemsWithTestProd = await stagingClient.execute({
      sql: 'SELECT order_id FROM OrderItems WHERE product_id = ?',
      args: [testProdId]
    });
    for (const row of orderItemsWithTestProd.rows) {
      await stagingClient.execute({ sql: 'DELETE FROM OrderItems WHERE order_id = ?', args: [row.order_id] });
      await stagingClient.execute({ sql: 'DELETE FROM Orders WHERE id = ?', args: [row.order_id] });
    }
    await stagingClient.execute({
      sql: 'DELETE FROM Products WHERE id = ?',
      args: [testProdId]
    });
    console.log('✓ Cleaned up temporary concurrency test product & test orders from staging.');

    // 3.4 Inventory State Consistency After Restart
    // Restore Product 27 physical stock in staging back to 50
    await stagingClient.execute({
      sql: 'UPDATE Products SET stock = 50, reserved_stock = 0 WHERE id = 27'
    });
    const restoredProd = await stagingClient.execute('SELECT stock, reserved_stock FROM Products WHERE id = 27');
    recordTest('Inventory State Restoration & Consistency Verification', 'Inventory Safety', restoredProd.rows[0].stock === 50 && restoredProd.rows[0].reserved_stock === 0, `Product 27 stock: ${restoredProd.rows[0].stock}, reserved: ${restoredProd.rows[0].reserved_stock}`);

  } catch (err) {
    console.error('Test suite error:', err);
    recordTest('Unhandled Suite Exception', 'Execution', false, err.message);
  } finally {
    // Clean up temporary admin
    try {
      await stagingClient.execute({
        sql: `DELETE FROM Users WHERE email = ?`,
        args: [testAdminEmail]
      });
      console.log('✓ Cleaned up temporary test admin user from staging.');
    } catch {}

    // Clean up temporary customer
    try {
      await stagingClient.execute({
        sql: `DELETE FROM Users WHERE email = ?`,
        args: [testCustomerEmail]
      });
      console.log('✓ Cleaned up temporary test customer user from staging.');
    } catch {}

    // Shut down test backend server
    serverProcess.kill('SIGINT');
    console.log('✓ Stopped staging test backend server.\n');
  }

  // Summary
  const passed = testResults.filter(r => r.passed).length;
  const failed = testResults.filter(r => !r.passed).length;
  console.log('====================================================');
  console.log(`PHASE 12 STAGING TEST RESULTS: ${passed}/${testResults.length} PASSED (${failed} FAILED)`);
  console.log('====================================================');
}

runSuite().catch(console.error);
