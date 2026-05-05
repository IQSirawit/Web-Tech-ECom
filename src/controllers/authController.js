const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Reference your data folder - Locates the JSON file acting as a mock database
const DB_PATH = path.join(__dirname, '../../data/auth_user.json');
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
         * Reads the physical JSON file and parses the string into a JavaScript object.
         */
        const fileContents = fs.readFileSync(DB_PATH, 'utf8');
        const parsed = JSON.parse(fileContents);
        const users = Array.isArray(parsed) ? parsed : parsed.users || [];

        /**
         * 3. USER LOOKUP
         * Searches the array for a user object matching the provided email.
         */
        const user = users.find(u => u.email === email);

        /**
         * 4. SECURITY VERIFICATION
         * - Checks if user exists.
         * - Uses bcrypt to compare the plain-text password with the salted/hashed version.
         */
        if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        /**
         * 5. TOKEN GENERATION
         * If verified, creates a signed JWT containing the user ID.
         * This token is what the client will use for future authorized requests.
         */
        const token = jwt.sign(
            { userId: user.id }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );

        /**
         * 6. RESPONSE
         * Sends a 200 OK status back to the client along with the generated token.
         */
        res.status(200).json({ token });

    } catch (error) {
        // Error handling for file system issues or runtime crashes
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
         * 2. LOAD EXISTING USERS
         * Read the current user database.
         */
        const fileContents = fs.readFileSync(DB_PATH, 'utf8');
        const parsed = JSON.parse(fileContents);
        const users = Array.isArray(parsed) ? parsed : parsed.users || [];

        /**
         * 3. CHECK FOR DUPLICATE EMAIL
         * Reject registration if email is already in use.
         */
        const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        /**
         * 4. HASH THE PASSWORD
         * Salt rounds = 10, matching the existing records.
         */
        const password_hash = await bcrypt.hash(password, 10);

        /**
         * 5. CREATE NEW USER
         * Assign the next available ID and today's date.
         */
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const today = new Date().toISOString().split('T')[0];

        const newUser = {
            id: newId,
            email: email.toLowerCase(),
            password_hash,
            first_name: name,
            registration_date: today
        };

        users.push(newUser);

        /**
         * 6. PERSIST TO FILE
         * Write the updated users array back to auth_user.json.
         */
        const updatedData = Array.isArray(parsed) ? users : { ...parsed, users };
        fs.writeFileSync(DB_PATH, JSON.stringify(updatedData, null, 2), 'utf8');

        /**
         * 7. ISSUE JWT & RESPOND
         */
        const token = jwt.sign(
            { userId: newUser.id },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ token, message: 'Registration successful!' });

    } catch (error) {
        console.error('Auth register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};