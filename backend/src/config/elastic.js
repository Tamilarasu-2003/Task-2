const { Client } = require('@elastic/elasticsearch');

const elasticClient = new Client({
    node: 'http://host.docker.internal:9200',
});

module.exports = elasticClient;
