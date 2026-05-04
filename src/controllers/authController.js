const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Reference your data folder
const DB_PATH = path.join(__dirname, '../../data/auth_user.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const fileContents = fs.readFileSync(DB_PATH, 'utf8');
        const parsed = JSON.parse(fileContents);
        const users = Array.isArray(parsed) ? parsed : parsed.users || [];
        const user = users.find(u => u.email === email);

        if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ email: user.email, firstName: user.first_name }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Auth login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};