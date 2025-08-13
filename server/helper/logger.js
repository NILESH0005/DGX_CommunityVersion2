// logger.js
import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Define the log directory and files
// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the parent directory path
const parentDirectory = path.resolve(__dirname, '..');


// Define the log directory and files
const logDirectory = path.join(parentDirectory, 'logs');
// console.log(logDirectory)
const errorLogFile = path.join(logDirectory, 'error.log');
const warningLogFile = path.join(logDirectory, 'warning.log');
const infoLogFile = path.join(logDirectory, 'info.log');

// Ensure the log directory exists
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Create a Winston logger instance
const logger = winston.createLogger({
    level: 'info', // The lowest level this logger will log, covering both warn and error
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: errorLogFile, level: 'error' }),
        new winston.transports.File({ filename: warningLogFile, level: 'warn' }),
        new winston.transports.File({ filename: infoLogFile, level: 'info' })
    ]
});

// Logger functions
export function logError(error) {
    logger.error({ message: error.message, stack: error.stack });
}

export function logWarning(warning) {
    logger.warn({ message: warning });
}

export function logInfo(info) {
    logger.info({ message: info });
}

