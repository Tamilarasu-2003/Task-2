require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');


const { Client: PgClient } = require('pg');
const { Client: ElasticClient } = require('@elastic/elasticsearch');

// PostgreSQL connection
const pgClient = new PgClient({
    connectionString: 'postgresql://postgres:Tamil@localhost:5432/product_data',
});

// Elasticsearch connection
const elasticClient = new ElasticClient({
    node: 'http://localhost:9200',
});

const syncData = async () => {
    try {
        await pgClient.connect();
        console.log("Connected to PostgreSQL");

        // Query data from PostgreSQL
        const res = await pgClient.query('SELECT * FROM products');
        console.log("Data retrieved from PostgreSQL");

        // Index data into Elasticsearch
        for (const row of res.rows) {
            let specs;

            // Check if specs is already an object or a JSON string
            if (typeof row.specs === 'string') {
                specs = JSON.parse(row.specs.replace(/""/g, '"')); // Parse JSON string if it's a string
            } else if (typeof row.specs === 'object') {
                specs = row.specs; // If it's already an object, use it directly
            } else {
                throw new Error(`Unexpected specs format: ${typeof row.specs}`);
            }

            await elasticClient.index({
                index: 'products',
                id: row.id.toString(),
                body: {
                    name: row.name,
                    category: row.category,
                    price: parseFloat(row.price), // Ensure price is a float
                    offer_price: parseFloat(row.offer_price), // Ensure offer_price is a float
                    specs: {
                        brand: specs.brand, // Extract brand
                        model: specs.model, // Extract model
                        features: specs.features // Ensure features is an array
                    },
                },
            });
        }
        console.log("Data indexed into Elasticsearch");
    } catch (err) {
        console.error("Error during syncing data:", err);
    } finally {
        await pgClient.end();
        console.log("PostgreSQL connection closed");
    }
};

syncData();



const app = express();
const PORT = process.env.PORT || 5000;

// Database configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const productPool = new Pool({
    connectionString: process.env.PRODUCT_DB_URL,
});

// Middleware
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, origin);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(bodyParser.json());
app.use(express.json());


const checkDatabaseConnection = async () => {
    try {
        // Test connection to the user database
        await pool.query('SELECT NOW()');
        console.log('Connected to the user database successfully');

        // Test connection to the product database
        await productPool.query('SELECT NOW()');
        console.log('Connected to the product database successfully');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); 
    }
};

// Call the connection check function
checkDatabaseConnection();



// Signup route
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    console.log(username);
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, hashedPassword]);
        res.status(201).json({ message: 'User created' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Signin route
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log(await bcrypt.hash(user.password, 10))
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                const sessionToken = uuidv4(); 
                res.json({ message: 'Logged in successfully', token: sessionToken,username:user.username });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error signing in' });
    }
});

// Categories route
app.get('/categories', async (req, res) => {
    try {
        const result = await productPool.query('SELECT * FROM category');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

//Products Route
app.get('/products', async (req, res) => {
    const { page = 1, limit = 12, category } = req.query; 
    const offset = (page - 1) * limit;

    try {
        let query = 'SELECT * FROM products';
        const queryParams = [];

        // If a category is provided
        if (category) {
            query += ' WHERE category = $1::text';
            queryParams.push(category);
        }

        query += ' LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);

        queryParams.push(limit, offset);

        const result = await productPool.query(query, queryParams);
        const totalCountResult = await productPool.query('SELECT COUNT(*) FROM products' + (category ? ' WHERE category = $1::text' : ''), category ? [category] : []);
        const totalCount = totalCountResult.rows[0].count;

        res.json({
            products: result.rows,
            totalCount: totalCount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

//  products/search


app.get('/products/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
    }

    // Initialize price filter
    let priceFilter = null;
    const priceRangeRegex = /(?:under|above|between)\s+(\d+)(?:\s+and\s+(\d+))?/i;
    const priceMatch = query.match(priceRangeRegex);

    // Extract price filter if present
    if (priceMatch) {
        const lowerBound = parseFloat(priceMatch[1]);
        if (priceMatch[0].includes('under')) {
            priceFilter = { range: { price: { lte: lowerBound } } };
        } else if (priceMatch[0].includes('above')) {
            priceFilter = { range: { price: { gte: lowerBound } } };
        } else if (priceMatch[0].includes('between') && priceMatch[2]) {
            const upperBound = parseFloat(priceMatch[2]);
            priceFilter = { range: { price: { gte: lowerBound, lte: upperBound } } };
        }
    }

    try {
        const cleanedQuery = query.replace(priceRangeRegex, '').trim();

        // Prepare must conditions for exact matches
        const mustConditions = [
            {
                bool: {
                    should: [
                        {
                            match: {
                                name: {
                                    query: cleanedQuery,
                                    boost: 2
                                }
                            }
                        },
                        {
                            multi_match: {
                                query: cleanedQuery,
                                fields: ['category', 'specs.brand'],
                                operator: 'or'
                            }
                        }
                    ]
                }
            }
        ];

        if (priceFilter) {
            mustConditions.push(priceFilter);
        }

        // Search for exact matches
        const exactSearchBody = {
            index: 'products',
            body: {
                from: 0,
                size: 100,
                query: {
                    bool: {
                        must: mustConditions
                    }
                }
            }
        };

        const exactResults = await elasticClient.search(exactSearchBody);
        const exactProducts = exactResults.hits.hits.map(hit => ({
            id: hit._id,
            ...hit._source,
        }));

        let alternateProducts = [];  // Initialize alternateProducts

        if (exactProducts.length === 0 && priceFilter) {
            const mustConditionsWithoutPrice = [
                {
                    multi_match: {
                        query: cleanedQuery,
                        fields: ['name', 'category', 'specs.brand'],
                        operator: 'and'
                    }
                }
            ];

            const fallbackSearchBody = {
                index: 'products',
                body: {
                    from: 0,
                    size: 1000,
                    query: {
                        bool: {
                            must: mustConditionsWithoutPrice
                        }
                    }
                },
            };

            const fallbackSearchResults = await elasticClient.search(fallbackSearchBody);
            alternateProducts = fallbackSearchResults.hits.hits.map(hit => ({
                id: hit._id,
                ...hit._source,
            }));
        }

        // Determine the category from the exact results or the alternate products
        const category = exactProducts.length > 0 ? exactProducts[0].category : (alternateProducts.length > 0 ? alternateProducts[0].category : null);
        let similarProducts = [];

        if (category) {
            const exactProductIds = exactProducts.map(product => product.id);
            const similarSearchBody = {
                index: 'products',
                body: {
                    from: 0,
                    size: 100, 
                    query: {
                        bool: {
                            must: [
                                { term: { category: category } },
                                ...(priceFilter ? [priceFilter] : [])
                            ],
                            
                        }
                    }
                }
            };

            const similarResults = await elasticClient.search(similarSearchBody);
            similarProducts = similarResults.hits.hits
                .map(hit => ({
                    id: hit._id,
                    ...hit._source,
                }))
                .filter(similar => !exactProductIds.includes(similar.id)); 

            similarProducts = similarProducts.slice(0, 12);
        }

        res.json({
            exactProducts,
            similarProducts,
        });

    } catch (error) {
        console.error('Error fetching products from Elasticsearch:', error);
        res.status(500).send('Server error');
    }
});



// Protected route
app.get('/dashboard', (req, res) => {
    res.json({ message: 'Welcome to the dashboard!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
