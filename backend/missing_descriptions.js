const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
db.all("SELECT id, name FROM Products WHERE description IS NULL OR description = ''", (err, rows) => {
    console.log(JSON.stringify(rows, null, 2));
});
