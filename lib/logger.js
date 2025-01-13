// Store original console methods
const originalConsole = {
  log: console.log.bind(console),
  error: console.error.bind(console),
  warn: console.warn.bind(console),
  info: console.info.bind(console),
  debug: console.debug.bind(console)
}

// Terminal and browser console logger
const terminalLog = (...args) => {
  // Use original console method to prevent recursion
  originalConsole.log('[TERMINAL]', ...args)
}

const terminalError = (...args) => {
  // Use original console method to prevent recursion
  originalConsole.error('[TERMINAL ERROR]', ...args)
}

const terminalWarn = (...args) => {
  // Use original console method to prevent recursion
  originalConsole.warn('[TERMINAL WARN]', ...args)
}

const terminalInfo = (...args) => {
  // Use original console method to prevent recursion
  originalConsole.info('[TERMINAL INFO]', ...args)
}

const terminalDebug = (...args) => {
  // Use original console method to prevent recursion
  originalConsole.debug('[TERMINAL DEBUG]', ...args)
}

// Override console methods to use our terminal logger
if (typeof window !== 'undefined') {
  // Override console methods
  console.log = (...args) => {
    originalConsole.log(...args) // Browser console
    terminalLog(...args)         // Terminal
  }

  console.error = (...args) => {
    originalConsole.error(...args) // Browser console
    terminalError(...args)         // Terminal
  }

  console.warn = (...args) => {
    originalConsole.warn(...args) // Browser console
    terminalWarn(...args)         // Terminal
  }

  console.info = (...args) => {
    originalConsole.info(...args) // Browser console
    terminalInfo(...args)         // Terminal
  }

  console.debug = (...args) => {
    originalConsole.debug(...args) // Browser console
    terminalDebug(...args)         // Terminal
  }
}

export const logger = {
  log: terminalLog,
  error: terminalError,
  warn: terminalWarn,
  info: terminalInfo,
  debug: terminalDebug,
  
  // Create prefixed logger
  withPrefix: (prefix) => ({
    log: (...args) => terminalLog(`[${prefix}]`, ...args),
    error: (...args) => terminalError(`[${prefix}]`, ...args),
    warn: (...args) => terminalWarn(`[${prefix}]`, ...args),
    info: (...args) => terminalInfo(`[${prefix}]`, ...args),
    debug: (...args) => terminalDebug(`[${prefix}]`, ...args)
  })
}

// Log initialization using original console to prevent recursion
originalConsole.log('[LOGGER] Logger initialized - All console output will now appear in terminal') 