const pino = require('pino');
const { env } = require('./config.cjs');
const logger = pino({ level: env.LOG_LEVEL || 'info' });
module.exports = { logger };