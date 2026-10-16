const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("PRAGMA table_info(Products);", (err, cols) => console.log('Products:', cols));
    db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => console.log('Tables:', tables));
});
