import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';
import { LOGGER_LEVEL } from '../utils/mainUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const loggerInfo = LOGGER_LEVEL;

const fileTransport = pino.transport({
  target: 'pino-roll',
  options: {
    file: join(__dirname, 'app.log'),
    frequency: 'daily',
    mkdir: true,
    size: '10M',
    keep: 7,
    compress: true,
  }
});

const prettyTransport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname'
  }
});

const logger = pino(
  {
    level: loggerInfo,
    formatters: {
      level(label) {
        return { level: label };
      }
    }
  },
  pino.multistream([
    { stream: prettyTransport },
    { stream: fileTransport }
  ])
);

export default logger;