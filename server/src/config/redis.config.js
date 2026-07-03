const { Redis } = require('ioredis');
const { REDIS_HOST, REDIS_PORT } = require('./env.config');

const connection = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null
});

module.exports = connection;