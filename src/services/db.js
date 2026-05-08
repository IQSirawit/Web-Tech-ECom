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

const createProductsSql = `
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    image TEXT,
    title TEXT NOT NULL,
    author TEXT,
    category TEXT,
    rating INTEGER,
    price TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);`;

const createUsersSql = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    registration_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);`;

const initializeSchema = () => {
    db.serialize(() => {
        // Check and migrate orders table
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

        // Create products and users tables
        db.run(createProductsSql, (err) => {
            if (err) {
                console.error('Failed to create products table:', err.message);
            }
        });

        db.run(createUsersSql, (err) => {
            if (err) {
                console.error('Failed to create users table:', err.message);
            }
        });

        // Migrate data from JSON files if tables are empty
        migrateDataFromJSON();
    });
};

const migrateDataFromJSON = () => {
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) {
            console.error('Error checking products table:', err.message);
            return;
        }

        if (row.count === 0) {
            const productsPath = path.join(DB_FOLDER, 'products.json');
            if (fs.existsSync(productsPath)) {
                try {
                    const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
                    const products = data.products || [];
                    products.forEach(product => {
                        db.run(
                            `INSERT INTO products (id, image, title, author, category, rating, price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [product.id, product.image, product.title, product.author, product.category, product.rating, product.price, product.quantity],
                            (err) => {
                                if (err && !err.message.includes('UNIQUE')) {
                                    console.error('Error migrating product:', err.message);
                                }
                            }
                        );
                    });
                    console.log(`Migrated ${products.length} products from JSON to SQLite.`);
                } catch (parseErr) {
                    console.error('Error reading products.json:', parseErr.message);
                }
            }
        }
    });

    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) {
            console.error('Error checking users table:', err.message);
            return;
        }

        if (row.count === 0) {
            const usersPath = path.join(DB_FOLDER, 'auth_user.json');
            if (fs.existsSync(usersPath)) {
                try {
                    const data = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
                    const users = data.users || [];
                    users.forEach(user => {
                        db.run(
                            `INSERT INTO users (id, email, password_hash, first_name, registration_date) VALUES (?, ?, ?, ?, ?)`,
                            [user.id, user.email, user.password_hash, user.first_name, user.registration_date],
                            (err) => {
                                if (err && !err.message.includes('UNIQUE')) {
                                    console.error('Error migrating user:', err.message);
                                }
                            }
                        );
                    });
                    console.log(`Migrated ${users.length} users from JSON to SQLite.`);
                } catch (parseErr) {
                    console.error('Error reading auth_user.json:', parseErr.message);
                }
            }
        }
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

// Products CRUD
const getAllProducts = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM products ORDER BY id ASC', (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
};

const getProductById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

const updateProduct = ({ id, quantity, image, title, author, category, rating, price }) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE products SET quantity = ?, image = ?, title = ?, author = ?, category = ?, rating = ?, price = ? WHERE id = ?`,
            [quantity, image, title, author, category, rating, price, id],
            function (err) {
                if (err) return reject(err);
                resolve({ changes: this.changes });
            }
        );
    });
};

const updateProducts = (products) => {
    return new Promise((resolve, reject) => {
        const updates = products.map(p => 
            new Promise((res, rej) => {
                db.run(
                    `UPDATE products SET quantity = ?, image = ?, title = ?, author = ?, category = ?, rating = ?, price = ? WHERE id = ?`,
                    [p.quantity, p.image, p.title, p.author, p.category, p.rating, p.price, p.id],
                    (err) => {
                        if (err) return rej(err);
                        res();
                    }
                );
            })
        );

        Promise.all(updates).then(() => resolve()).catch(reject);
    });
};

// Users CRUD
const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

const createUser = ({ email, password_hash, first_name, registration_date }) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO users (email, password_hash, first_name, registration_date) VALUES (?, ?, ?, ?)`,
            [email, password_hash, first_name, registration_date],
            function (err) {
                if (err) return reject(err);
                resolve({ id: this.lastID });
            }
        );
    });
};

const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users ORDER BY id ASC', (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
};

module.exports = {
    db,
    insertOrderHeader,
    insertOrderItem,
    getAllProducts,
    getProductById,
    updateProduct,
    updateProducts,
    getUserByEmail,
    createUser,
    getAllUsers,
};
