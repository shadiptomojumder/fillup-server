/* eslint-disable no-undef */
import fs from 'fs';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, label, printf } = format;

// Define Vercel-safe log directory
const baseLogDir = path.join('/tmp', 'logs', 'winston');

// Ensure directories exist
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir(path.join(baseLogDir, 'successes'));
ensureDir(path.join(baseLogDir, 'errors'));

// Custom Log Format
const myFormat = printf(({ level, message, label, timestamp }) => {
  const date = new Date(timestamp as string);
  if (isNaN(date.getTime())) {
    console.error("Invalid timestamp received:", timestamp);
    return `${new Date().toDateString()} [${label}] ${level}: ${message}`;
  }

  const hour = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${date.toDateString()} ${hour}:${minutes}:${seconds} [${label}] ${level}: ${message}`;
});

// Main Info Logger
const logger = createLogger({
  level: 'info',
  format: combine(label({ label: 'HADI' }), timestamp(), myFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(baseLogDir, 'successes', 'phu-%DATE%-success.log'),
      datePattern: 'YYYY-DD-MM-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

// Error Logger
const errorlogger = createLogger({
  level: 'error',
  format: combine(label({ label: 'HADI' }), timestamp(), myFormat),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: path.join(baseLogDir, 'errors', 'phu-%DATE%-error.log'),
      datePattern: 'YYYY-DD-MM-HH',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

export { logger, errorlogger };
