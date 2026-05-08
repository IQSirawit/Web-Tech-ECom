const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbService = require('../services/db');

// Security key used to sign the JWT (JSON Web Token)
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

exports.login = async (req, res) => {
    try {
        /**
         * 1. EXTRACT DATA
         * Pulls the user-provided email and password from the request body.
         */
        const { email, password } = req.body;

        /**
         * 2. DATA RETRIEVAL
         * Queries the SQLite database for the user by email.
         */
        const user = await dbService.getUserByEmail(email);

        /**
         * 3. SECURITY VERIFICATION
         * - Checks if user exists.
         * - Uses bcrypt to compare the plain-text password with the salted/hashed version.
         */
        if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        /**
         * 4. TOKEN GENERATION
         * If verified, creates a signed JWT containing the user ID.
         * This token is what the client will use for future authorized requests.
         */
        const token = jwt.sign(
            { userId: user.id }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        /**
         * 5. RESPONSE
         * Sends a 200 OK status back to the client along with the generated token.
         */
        res.status(200).json({ token });

    } catch (error) {
        // Error handling for database issues or runtime crashes
        console.error('Auth login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        /**
         * 1. VALIDATE INPUT
         * Ensure all required fields are provided.
         */
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        /**
         * 2. CHECK FOR DUPLICATE EMAIL
         * Query the database to ensure email is not already in use.
         */
        const existingUser = await dbService.getUserByEmail(email.toLowerCase());
        if (existingUser) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        /**
         * 3. HASH THE PASSWORD
         * Salt rounds = 10, matching the existing records.
         */
        const password_hash = await bcrypt.hash(password, 10);

        /**
         * 4. CREATE NEW USER IN DATABASE
         * Insert the new user into the SQLite database.
         */
        const today = new Date().toISOString().split('T')[0];

        const result = await dbService.createUser({
            email: email.toLowerCase(),
            password_hash,
            first_name: name,
            registration_date: today
        });

        /**
         * 5. ISSUE JWT & RESPOND
         */
        const token = jwt.sign(
            { userId: result.id },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ token, message: 'Registration successful!' });

    } catch (error) {
        console.error('Auth register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};