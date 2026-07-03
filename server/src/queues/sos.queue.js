const { Queue } = require('bullmq');
const connection = require('../config/redis.config');

const sosQueue = new Queue('sos', { connection });

module.exports = sosQueue;