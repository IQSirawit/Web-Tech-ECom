const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_FOLDER = path.join(__dirname, '../../data');
const DB_PATH = path.join(DB_FOLDER, 'store.db');

if (!fs.existsSync(DB_FOLDER)) {
    fs.mkdirSync(DB_FOLDER, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (error) => {
    if (error) {
        console.error('Unable to open SQLite database:', error.message);
        process.exit(1);
    }
    console.log(`Connected to SQLite database at ${DB_PATH}`);
});

const createOrdersSql = `
CREATE TABLE orders (
    order_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    total_price REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);`;

const createOrderItemsSql = `
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    item_price REAL NOT NULL,
    total_price REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(order_id)
);`;

const initializeSchema = () => {
    db.serialize(() => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'", (error, row) => {
            if (error) {
                console.error('Schema check failed:', error.message);
                return;
            }

            const hasOrders = !!row;
            db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='order_items'", (error2, row2) => {
                if (error2) {
                    console.error('Schema check failed:', error2.message);
                    return;
                }

                const hasOrderItems = !!row2;

                const createOrdersTable = () => {
                    db.run(createOrdersSql, (createErr) => {
                        if (createErr) {
                            console.error('Failed to create orders table:', createErr.message);
                        }
                    });
                };

                const createOrderItemsTable = () => {
                    db.run(createOrderItemsSql, (createErr) => {
                        if (createErr) {
                            console.error('Failed to create order_items table:', createErr.message);
                        }
                    });
                };

                if (hasOrders && !hasOrderItems) {
                    db.run('ALTER TABLE orders RENAME TO orders_legacy', (renameErr) => {
                        if (renameErr) {
                            if (renameErr.message.includes('duplicate')) {
                                console.warn('Legacy orders_legacy table already exists; leaving old orders table in place.');
                            } else {
                                console.error('Could not rename legacy orders table:', renameErr.message);
                            }
                        } else {
                            console.log('Renamed legacy orders table to orders_legacy.');
                        }

                        createOrdersTable();
                        createOrderItemsTable();
                    });
                } else {
                    if (!hasOrders) {
                        createOrdersTable();
                    }
                    if (!hasOrderItems) {
                        createOrderItemsTable();
                    }
                }
            });
        });
    });
};

initializeSchema();

const insertOrderHeader = ({ order_id, user_id, total_price }) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO orders (order_id, user_id, total_price) VALUES (?, ?, ?)`;
        db.run(sql, [order_id, user_id, total_price], function (err) {
            if (err) {
                return reject(err);
            }
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

const insertOrderItem = ({ order_id, product_id, quantity, item_price, total_price }) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO order_items (order_id, product_id, quantity, item_price, total_price) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [order_id, product_id, quantity, item_price, total_price], function (err) {
            if (err) {
                return reject(err);
            }
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

module.exports = {
    db,
    insertOrderHeader,
    insertOrderItem,
};
