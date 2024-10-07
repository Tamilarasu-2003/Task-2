const { pool } = require('../config/db');

const User = {
    create: async (username, email, password) => {
        return await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, password]);
    },
    findByEmail: async (email) => {
        return await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    }
};

module.exports = User;
