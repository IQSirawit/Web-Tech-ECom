/**
 * validators.js - Input validation utilities
 * 
 * Centralized validation functions to prevent:
 * - SQL Injection
 * - Parameter Tampering
 * - Type Confusion
 * - Buffer Overflow
 */

/**
 * Validate numeric parameter (page, limit, quantity)
 * Prevents: Type confusion, negative numbers, excessive values
 */
const validateNumericParam = (value, min = 1, max = 10000, defaultValue = 1) => {
    const num = parseInt(value, 10);
    
    if (!Number.isInteger(num)) {
        throw new Error(`Invalid numeric value: must be an integer`);
    }
    
    if (num < min) {
        return min;
    }
    
    if (num > max) {
        return max;
    }
    
    return num;
};

/**
 * Validate string parameter
 * Prevents: Excessive length, null bytes, special characters
 */
const validateStringParam = (value, maxLength = 255, allowedChars = /^[\w\s.-]+$/) => {
    if (!value || typeof value !== 'string') {
        throw new Error('Invalid string value');
    }
    
    const trimmed = value.trim();
    
    if (trimmed.length === 0) {
        throw new Error('String cannot be empty');
    }
    
    if (trimmed.length > maxLength) {
        throw new Error(`String exceeds maximum length of ${maxLength} characters`);
    }
    
    if (!allowedChars.test(trimmed)) {
        throw new Error('String contains invalid characters');
    }
    
    return trimmed;
};

/**
 * Validate email format
 * Prevents: Email injection, malformed emails
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }
    
    if (email.length > 254) {
        throw new Error('Email exceeds maximum length');
    }
    
    return email.toLowerCase();
};

/**
 * Validate product ID
 * Prevents: SQL injection via product ID
 */
const validateProductId = (id) => {
    const productIdString = id.toString();
    
    if (productIdString.length > 50) {
        throw new Error('Product ID is too long');
    }
    
    // Only allow alphanumeric, dash, underscore
    if (!/^[a-zA-Z0-9_-]+$/.test(productIdString)) {
        throw new Error('Product ID contains invalid characters');
    }
    
    return productIdString;
};

/**
 * Validate payment token
 * Prevents: Malformed tokens, injection attacks
 */
const validatePaymentToken = (token) => {
    if (!token || typeof token !== 'string') {
        throw new Error('Invalid payment token');
    }
    
    if (token.length > 500) {
        throw new Error('Payment token exceeds maximum length');
    }
    
    // Only allow alphanumeric and common token characters
    if (!/^[a-zA-Z0-9_-]+$/.test(token)) {
        throw new Error('Payment token contains invalid characters');
    }
    
    return token;
};

/**
 * Validate cart object
 * Prevents: Parameter tampering, injection attacks
 */
const validateCart = (cart) => {
    if (!cart || typeof cart !== 'object') {
        throw new Error('Invalid cart format');
    }
    
    const cartKeys = Object.keys(cart);
    
    if (cartKeys.length === 0) {
        throw new Error('Cart cannot be empty');
    }
    
    if (cartKeys.length > 1000) {
        throw new Error('Cart contains too many items');
    }
    
    // Validate each cart item
    const validatedCart = {};
    for (const [id, item] of Object.entries(cart)) {
        const productId = validateProductId(id);
        const quantity = validateNumericParam(item.quantity, 1, 10000);
        
        validatedCart[productId] = {
            quantity
        };
    }
    
    return validatedCart;
};

/**
 * Validate category parameter
 * Prevents: SQL injection, excessive length
 */
const validateCategory = (category) => {
    if (!category || category === '') {
        return null; // Category is optional
    }
    
    return validateStringParam(category, 100, /^[a-zA-Z0-9\s&'-]+$/);
};

module.exports = {
    validateNumericParam,
    validateStringParam,
    validateEmail,
    validateProductId,
    validatePaymentToken,
    validateCart,
    validateCategory
};