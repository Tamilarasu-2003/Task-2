const Product = require('../models/Product');
const { productPool } = require('../config/db');
const elasticClient = require('../config/elastic');

const productController = {
    getProducts: async (req, res) => {
        const { page = 1, limit = 12, category } = req.query;
        const offset = (page - 1) * limit;

        try {
            const result = await Product.findAll(category, limit, offset);
            const totalCountResult = await Product.count(category);
            const totalCount = parseInt(totalCountResult.rows[0].count, 10);

            res.json({
                products: result.rows,
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).send('Server error');
        }
    },
    searchProducts: async (req, res) => {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        let priceFilter = null;
        const priceRangeRegex = /(?:under|above|between)\s+(\d+)(?:\s+and\s+(\d+))?/i;
        const priceMatch = query.match(priceRangeRegex);

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

            let alternateProducts = [];

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
    }
};


module.exports = productController;
