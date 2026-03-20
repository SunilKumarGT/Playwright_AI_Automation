const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;
const fs = require('fs');

// Ensure logs directory exists
if (!fs.existsSync('reports/logs')) {
  fs.mkdirSync('reports/logs', { recursive: true });
}

const logFormat = printf(({ level, message, timestamp: ts }) => {
  return `[${ts}] ${level.toUpperCase()}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    // Console output with colors
    new transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
    }),
    // Full log file
    new transports.File({
      filename: 'reports/logs/test-run.log',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    // Error-only log
    new transports.File({
      filename: 'reports/logs/errors.log',
      level: 'error',
    }),
  ],
});

module.exports = logger;
