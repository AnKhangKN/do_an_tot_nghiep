const { Redis } = require('ioredis');
const { REDIS_URL, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_TLS } = require('./env.config');

const connection = REDIS_URL
    ? new Redis(REDIS_URL, {
          enableReadyCheck: false,
          maxRetriesPerRequest: null
      })
    : new Redis({
          host: REDIS_HOST,
          port: REDIS_PORT,
          password: REDIS_PASSWORD || undefined,
          tls: REDIS_TLS === "true" ? {} : undefined,
          enableReadyCheck: false,
          maxRetriesPerRequest: null
      });

module.exports = connection;
