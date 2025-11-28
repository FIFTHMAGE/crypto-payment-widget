import { config } from '../config';

/**
 * Logger utility with colored console output
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogMeta {
  [key: string]: unknown;
}

const LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const COLORS: Record<LogLevel | 'reset', string> = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m', // Yellow
  info: '\x1b[36m', // Cyan
  debug: '\x1b[35m', // Magenta
  reset: '\x1b[0m',
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  error: 'ERROR',
  warn: 'WARN',
  info: 'INFO',
  debug: 'DEBUG',
};

class Logger {
  private level: number;
  private silent: boolean;

  constructor(level: LogLevel = 'info', silent = false) {
    this.level = LEVELS[level] ?? LEVELS.info;
    this.silent = silent;
  }

  /**
   * Set the log level
   */
  setLevel(level: LogLevel): void {
    this.level = LEVELS[level] ?? LEVELS.info;
  }

  /**
   * Enable/disable silent mode
   */
  setSilent(silent: boolean): void {
    this.silent = silent;
  }

  /**
   * Log a message at a specific level
   */
  private log(level: LogLevel, message: unknown, meta?: LogMeta): void {
    if (this.silent || LEVELS[level] > this.level) {
      return;
    }

    const timestamp = new Date().toISOString();
    const color = COLORS[level];
    const reset = COLORS.reset;
    const label = LEVEL_LABELS[level];

    const formattedMessage =
      typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message);

    const metaString =
      meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';

    // Use appropriate console method
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

    consoleMethod(`${color}[${timestamp}] [${label}]${reset} ${formattedMessage}${metaString}`);
  }

  /**
   * Log an error message
   */
  error(message: unknown, meta?: LogMeta): void {
    this.log('error', message, meta);
  }

  /**
   * Log a warning message
   */
  warn(message: unknown, meta?: LogMeta): void {
    this.log('warn', message, meta);
  }

  /**
   * Log an info message
   */
  info(message: unknown, meta?: LogMeta): void {
    this.log('info', message, meta);
  }

  /**
   * Log a debug message
   */
  debug(message: unknown, meta?: LogMeta): void {
    this.log('debug', message, meta);
  }

  /**
   * Create a child logger with a prefix
   */
  child(prefix: string): ChildLogger {
    return new ChildLogger(this, prefix);
  }
}

/**
 * Child logger with a prefix
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private prefix: string
  ) {}

  error(message: unknown, meta?: LogMeta): void {
    this.parent.error(`[${this.prefix}] ${message}`, meta);
  }

  warn(message: unknown, meta?: LogMeta): void {
    this.parent.warn(`[${this.prefix}] ${message}`, meta);
  }

  info(message: unknown, meta?: LogMeta): void {
    this.parent.info(`[${this.prefix}] ${message}`, meta);
  }

  debug(message: unknown, meta?: LogMeta): void {
    this.parent.debug(`[${this.prefix}] ${message}`, meta);
  }
}

// Get log level from config or environment
const logLevel = (config?.logLevel as LogLevel) || (process.env.LOG_LEVEL as LogLevel) || 'info';

export const logger = new Logger(logLevel);

export default logger;
