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
         * If verified, creates a signed JWT containing user identity.
         * This token is what the client will use for future authorized requests.
         */
        const token = jwt.sign(
            { email: user.email, firstName: user.first_name }, 
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