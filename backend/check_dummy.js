const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.all(`SELECT name, price, category_id FROM Products WHERE name LIKE '%dummy%' OR name LIKE '%test%' OR price = 0 OR price IS NULL`, (err, rows) => {
    console.log('Dummy products:', rows);
});
