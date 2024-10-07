const bcrypt = require('bcrypt');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

const authController = {
    signup: async (req, res) => {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try {
            await User.create(username, email, hashedPassword);
            res.status(201).json({ message: 'User created' });
        } catch (error) {
            res.status(500).json({ message: 'Error creating user' });
        }
    },
    signin: async (req, res) => {
        const { email, password } = req.body;
        try {
            const result = await User.findByEmail(email);
            if (result.rows.length > 0) {
                const user = result.rows[0];
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    const sessionToken = uuidv4();
                    res.json({ message: 'Logged in successfully', token: sessionToken, username: user.username });
                } else {
                    res.status(401).json({ message: 'Invalid credentials' });
                }
            } else {
                res.status(401).json({ message: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error signing in' });
        }
    }
};

module.exports = authController;
