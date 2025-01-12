import { supabase } from './Store';

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
    this.isLogging = false;
    this.writeTimeout = null;
    this.writeDelay = 5000; // Only write every 5 seconds at most
    
    if (typeof window !== 'undefined') {
      this.setupConsoleOverrides();
      
      try {
        const savedLogs = localStorage.getItem('talk2d2_logs');
        if (savedLogs) {
          this.logs = JSON.parse(savedLogs);
        }
      } catch (error) {
        // Silently fail - don't trigger more logs
      }

      window.addEventListener('beforeunload', () => {
        if (this.writeTimeout) {
          clearTimeout(this.writeTimeout);
          this.writeLogsToFile();
        }
      });
    }
  }

  setupConsoleOverrides() {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    console.log = (...args) => {
      this.captureLog('log', ...args);
      originalConsole.log(...args);
    };

    console.error = (...args) => {
      this.captureLog('error', ...args);
      originalConsole.error(...args);
    };

    console.warn = (...args) => {
      this.captureLog('warn', ...args);
      originalConsole.warn(...args);
    };

    console.info = (...args) => {
      this.captureLog('info', ...args);
      originalConsole.info(...args);
    };
  }

  async writeLogsToFile() {
    if (this.isLogging) return;
    
    try {
      this.isLogging = true;
      const logText = this.logs.map(log => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        const userInfo = log.user ? `@${log.user.username}` : 'system';
        return `[${timestamp}] [${log.type.toUpperCase()}] [${userInfo}] ${log.message}`;
      }).join('\n');

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
      await fetch(`${baseUrl}/api/writeLogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logText }),
      });
    } catch (error) {
      // Silently fail - don't trigger more logs
    } finally {
      this.isLogging = false;
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user ? {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || user.email?.split('@')[0]
      } : null;
    } catch (error) {
      return null;
    }
  }

  async captureLog(type, ...args) {
    if (this.isLogging) return;
    
    try {
      this.isLogging = true;
      const user = await this.getCurrentUser();
      const timestamp = new Date().toISOString();
      
      const logEntry = {
        type,
        timestamp,
        user: user ? {
          id: user.id,
          username: user.username
        } : null,
        message: args.map(arg => {
          if (arg instanceof Error) {
            return {
              name: arg.name,
              message: arg.message,
              stack: arg.stack
            };
          }
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch (error) {
              return '[Circular Object]';
            }
          }
          return String(arg);
        }).join(' ')
      };

      this.logs.push(logEntry);
      
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs);
      }

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('talk2d2_logs', JSON.stringify(this.logs));
        } catch (error) {
          // Silently fail - don't trigger more logs
        }
      }

      if (this.writeTimeout) {
        clearTimeout(this.writeTimeout);
      }
      this.writeTimeout = setTimeout(() => this.writeLogsToFile(), this.writeDelay);
    } finally {
      this.isLogging = false;
    }
  }

  getLogs(type = null) {
    if (type) {
      return this.logs.filter(log => log.type === type);
    }
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('talk2d2_logs');
      } catch (error) {
        // Silently fail - don't trigger more logs
      }
    }
    this.writeLogsToFile();
  }

  downloadLogs() {
    const logData = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talk2d2_logs_${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const logger = new Logger(); 