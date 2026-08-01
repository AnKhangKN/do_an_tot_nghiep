const { Redis } = require('ioredis');
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_TLS } = require('./env.config');

const connection = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD || undefined,
    tls: REDIS_TLS === "true" ? {} : undefined,
    maxRetriesPerRequest: null
});

module.exports = connection;
