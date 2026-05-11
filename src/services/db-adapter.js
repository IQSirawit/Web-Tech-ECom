/**
 * db-adapter.js - Database abstraction layer
 * 
 * This module provides a database-agnostic interface that works with multiple
 * database engines (SQLite, PostgreSQL, etc.). Switching databases requires only
 * changing the DB_TYPE environment variable.
 */

const { config } = require('../config');

let db = null;

const getDatabase = () => {
    if (!db) {
        if (config.DB_TYPE === 'postgresql' || config.DB_TYPE === 'postgres') {
            db = require('./db-adapters/postgres-adapter');
        } else if (config.DB_TYPE === 'sqlite' || config.DB_TYPE === 'sqlite3') {
            db = require('./db-adapters/sqlite-adapter');
        } else {
            throw new Error(
                `Unsupported database type: ${config.DB_TYPE}\n` +
                `Supported types: sqlite, postgresql`
            );
        }
    }
    return db;
};

const initializeDatabase = async () => {
    const database = getDatabase();
    await database.initialize();
    return database;
};

module.exports = {
    getDatabase,
    initializeDatabase
};