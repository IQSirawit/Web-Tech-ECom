const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dbPath = path.join(__dirname, 'data', 'store.db');
console.log('store.db exists:', fs.existsSync(dbPath));
if (!fs.existsSync(dbPath)) process.exit(0);
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
db.serialize(() => {
  db.each("SELECT name, sql FROM sqlite_master WHERE type='table'", (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('table:', row.name);
    console.log(row.sql);
  }, () => db.close());
});
