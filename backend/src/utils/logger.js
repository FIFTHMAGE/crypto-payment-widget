import { config } from '../config/index.js'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

const colors = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  debug: '\x1b[35m',
  reset: '\x1b[0m',
}

class Logger {
  constructor(level = 'info') {
    this.level = levels[level] || levels.info
  }

  log(level, message, meta = {}) {
    if (levels[level] <= this.level) {
      const timestamp = new Date().toISOString()
      const color = colors[level]
      const reset = colors.reset
      
      const logMessage = typeof message === 'object' 
        ? JSON.stringify(message, null, 2)
        : message

      console.log(
        `${color}[${timestamp}] [${level.toUpperCase()}]${reset}`,
        logMessage,
        Object.keys(meta).length > 0 ? meta : ''
      )
    }
  }

  error(message, meta) {
    this.log('error', message, meta)
  }

  warn(message, meta) {
    this.log('warn', message, meta)
  }

  info(message, meta) {
    this.log('info', message, meta)
  }

  debug(message, meta) {
    this.log('debug', message, meta)
  }
}

export const logger = new Logger(config.logLevel)

