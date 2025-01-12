// Browser-compatible logger
const MAX_LOG_LENGTH = 1000 // Maximum number of log entries to keep in memory

class Logger {
  constructor(prefix = '') {
    this.logs = []
    this.listeners = new Set()
    this.prefix = prefix
  }

  formatLogEntry(level, args) {
    const timestamp = new Date().toISOString()
    const formattedArgs = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ')
    
    const prefixStr = this.prefix ? `[${this.prefix}] ` : ''
    return `[${timestamp}] [${level}] ${prefixStr}${formattedArgs}`
  }

  addLogEntry(level, entry) {
    this.logs.push({ timestamp: new Date(), level, message: entry })
    if (this.logs.length > MAX_LOG_LENGTH) {
      this.logs.shift() // Remove oldest log if we exceed max length
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener(this.logs))
    
    // If in development, also save to localStorage
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      try {
        localStorage.setItem('talk2d2_logs', JSON.stringify(this.logs))
      } catch (e) {
        // Ignore storage errors
      }
    }
  }

  debug(...args) {
    const entry = this.formatLogEntry('DEBUG', args)
    console.debug(...args) // Original console.debug
    this.addLogEntry('DEBUG', entry)
  }

  log(...args) {
    const entry = this.formatLogEntry('INFO', args)
    console.log(...args) // Original console.log
    this.addLogEntry('INFO', entry)
  }

  info(...args) {
    const entry = this.formatLogEntry('INFO', args)
    console.info(...args) // Original console.info
    this.addLogEntry('INFO', entry)
  }

  warn(...args) {
    const entry = this.formatLogEntry('WARN', args)
    console.warn(...args) // Original console.warn
    this.addLogEntry('WARN', entry)
  }

  error(...args) {
    const entry = this.formatLogEntry('ERROR', args)
    console.error(...args) // Original console.error
    this.addLogEntry('ERROR', entry)
  }

  clear() {
    this.logs = []
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      try {
        localStorage.removeItem('talk2d2_logs')
      } catch (e) {
        // Ignore storage errors
      }
    }
    this.listeners.forEach(listener => listener(this.logs))
  }

  // Subscribe to log updates
  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Get all logs
  getLogs() {
    return this.logs
  }

  // Create a new logger instance with a prefix
  withPrefix(prefix) {
    return new Logger(prefix)
  }
}

// Create singleton instance
const baseLogger = new Logger()

// Try to restore logs from localStorage in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  try {
    const savedLogs = localStorage.getItem('talk2d2_logs')
    if (savedLogs) {
      baseLogger.logs = JSON.parse(savedLogs)
    }
  } catch (e) {
    // Ignore storage errors
  }
}

// Export the singleton instance
export const logger = baseLogger 