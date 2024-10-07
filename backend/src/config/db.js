const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const productPool = new Pool({
    connectionString: process.env.PRODUCT_DB_URL,
});

module.exports = { pool, productPool };
