const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
}

const LOG_COLORS = {
  DEBUG: '#7f8c8d', // Gray
  INFO: '#3498db',  // Blue
  WARN: '#f1c40f',  // Yellow
  ERROR: '#e74c3c'  // Red
}

const LOG_ICONS = {
  DEBUG: '🔍',
  INFO: 'ℹ️',
  WARN: '⚠️',
  ERROR: '❌'
}

class Logger {
  constructor(namespace = 'App') {
    this.namespace = namespace
    this.level = LOG_LEVELS.DEBUG // Default to most verbose
  }

  setLevel(level) {
    this.level = LOG_LEVELS[level] || LOG_LEVELS.DEBUG
  }

  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString()
    const icon = LOG_ICONS[level]
    const color = LOG_COLORS[level]
    
    let formattedMessage = `%c${icon} [${timestamp}] [${this.namespace}] [${level}] ${message}`
    
    if (data) {
      formattedMessage += '\n📦 Data:'
      if (typeof data === 'object') {
        try {
          formattedMessage += `\n${JSON.stringify(data, null, 2)}`
        } catch (e) {
          formattedMessage += `\n[Circular or Invalid JSON]: ${data}`
        }
      } else {
        formattedMessage += `\n${data}`
      }
    }
    
    return [formattedMessage, `color: ${color}; font-weight: bold`]
  }

  debug(message, data) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      console.log(...this.formatMessage('DEBUG', message, data))
    }
  }

  info(message, data) {
    if (this.level <= LOG_LEVELS.INFO) {
      console.log(...this.formatMessage('INFO', message, data))
    }
  }

  warn(message, data) {
    if (this.level <= LOG_LEVELS.WARN) {
      console.warn(...this.formatMessage('WARN', message, data))
    }
  }

  error(message, error) {
    if (this.level <= LOG_LEVELS.ERROR) {
      console.error(...this.formatMessage('ERROR', message, {
        message: error?.message,
        stack: error?.stack,
        ...error
      }))
    }
  }

  group(label) {
    console.group(label)
  }

  groupEnd() {
    console.groupEnd()
  }

  // Performance logging
  time(label) {
    console.time(label)
  }

  timeEnd(label) {
    console.timeEnd(label)
  }
}

// Create default logger instance
const logger = new Logger()

// Create namespaced loggers
export const createLogger = (namespace) => new Logger(namespace)

// Export default logger
export default logger 