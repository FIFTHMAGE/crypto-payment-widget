import { config } from '../config'

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  data?: any
  stack?: string
}

class Logger {
  private logLevel: LogLevel
  private logs: LogEntry[] = []
  private maxLogs = 1000

  constructor() {
    this.logLevel = config.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const levelName = LogLevel[level]
    let formatted = `[${timestamp}] [${levelName}] ${message}`

    if (data) {
      formatted += ` ${JSON.stringify(data)}`
    }

    return formatted
  }

  private addLogEntry(level: LogLevel, message: string, data?: any, stack?: string) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      stack,
    }

    this.logs.push(entry)

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }
  }

  debug(message: string, data?: any) {
    if (!this.shouldLog(LogLevel.DEBUG)) return

    console.debug(this.formatMessage(LogLevel.DEBUG, message, data))
    this.addLogEntry(LogLevel.DEBUG, message, data)
  }

  info(message: string, data?: any) {
    if (!this.shouldLog(LogLevel.INFO)) return

    console.info(this.formatMessage(LogLevel.INFO, message, data))
    this.addLogEntry(LogLevel.INFO, message, data)
  }

  warn(message: string, data?: any) {
    if (!this.shouldLog(LogLevel.WARN)) return

    console.warn(this.formatMessage(LogLevel.WARN, message, data))
    this.addLogEntry(LogLevel.WARN, message, data)
  }

  error(message: string, error?: any) {
    if (!this.shouldLog(LogLevel.ERROR)) return

    const stack = error?.stack || new Error().stack
    console.error(this.formatMessage(LogLevel.ERROR, message, error), stack)
    this.addLogEntry(LogLevel.ERROR, message, error, stack)

    // In production, you might want to send errors to a monitoring service
    if (config.isProduction) {
      this.sendToMonitoring(message, error, stack)
    }
  }

  private sendToMonitoring(message: string, error?: any, stack?: string) {
    // Implement integration with monitoring service (e.g., Sentry, LogRocket)
    // This is a placeholder
    if (config.features.enableAnalytics) {
      // Send to monitoring service
    }
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = level
  }

  getLogs(level?: LogLevel, limit = 100): LogEntry[] {
    let filtered = this.logs

    if (level !== undefined) {
      filtered = filtered.filter((log) => log.level === level)
    }

    return filtered.slice(-limit)
  }

  clearLogs() {
    this.logs = []
  }

  downloadLogs() {
    const logData = JSON.stringify(this.logs, null, 2)
    const blob = new Blob([logData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

export const logger = new Logger()

