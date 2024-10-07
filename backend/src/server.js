const app = require('./app');
const { pool, productPool } = require('./config/db');

const PORT = process.env.PORT || 5000;

const checkDatabaseConnection = async () => {
    try {
        await pool.query('SELECT NOW()');
        console.log('Connected to the user database successfully');

        await productPool.query('SELECT NOW()');
        console.log('Connected to the product database successfully');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); // Exit the process on failure
    }
};

const startServer = async () => {
    await checkDatabaseConnection();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

// Start the server
startServer();

// Optional: Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down server...');
    process.exit(0);
});
