/**
 * config.js - Centralized configuration management
 * 
 * This module validates environment variables and provides a single source of truth
 * for all configuration. Allows database switching via DB_TYPE env variable.
 */

const requiredVars = {
    production: ['JWT_SECRET'],
    development: ['JWT_SECRET'],
    test: ['JWT_SECRET']
};

const validateConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    const required = requiredVars[env] || requiredVars.development;
    const missing = required.filter(v => !process.env[v]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            `Environment: ${env}\n` +
            `Please check your .env file or .env.${env} file.`
        );
    }
};

const config = {
    // Server Configuration
    PORT: process.env.PORT || 3000,
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database Configuration
    DB_PATH: process.env.DB_PATH || './data/store.db',

    // JWT Configuration
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',

    // CORS Configuration
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : ['http://localhost:3000', 'http://127.0.0.1:5501', 'http://localhost:5501'],

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

module.exports = {
    config,
    validateConfig
};