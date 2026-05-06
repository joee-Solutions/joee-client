/**
 * Offline Mode Logger
 * Provides detailed logging for offline mode operations
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
}

class OfflineLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private enabled = true;

  log(level: LogLevel, message: string, data?: any) {
    if (!this.enabled) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
    };

    this.logs.push(entry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Only log to console in development or if explicitly enabled
    // In production, logging is disabled to prevent information leakage
    const shouldLogToConsole = 
      process.env.NODE_ENV === 'development' || 
      (typeof window !== 'undefined' && localStorage.getItem('offline_debug') === 'true');
    
    if (shouldLogToConsole) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      const prefix = `[OFFLINE ${level.toUpperCase()}]`;
      
      // Handle data more gracefully - filter out undefined/null values
      let logData: any = '';
      if (data) {
        if (typeof data === 'object' && !Array.isArray(data)) {
          const normalize = (value: unknown): unknown => {
            if (value instanceof Error) return value.message || value.name || String(value);
            if (value && typeof value === 'object' && !Array.isArray(value)) {
              const keys = Object.keys(value as object);
              if (keys.length === 0) return '(empty object)';
            }
            return value;
          };
          // Filter out undefined/null values from object, but keep empty strings and false values
          const filtered = Object.fromEntries(
            Object.entries(data)
              .filter(([_, value]) => value !== undefined && value !== null)
              .map(([k, v]) => [k, normalize(v)])
          );
          // Only use filtered object if it has keys
          logData = Object.keys(filtered).length > 0 ? filtered : '';
        } else {
          logData = data;
        }
      }
      
      // Always log the message, and include data if available
      // For errors, always show data even if it's an empty object (might contain useful info)
      if (level === 'error') {
        if (logData && typeof logData === 'object' && Object.keys(logData).length > 0) {
          console[consoleMethod](prefix, message, logData);
        } else if (logData && logData !== '') {
          console[consoleMethod](prefix, message, logData);
        } else {
          console[consoleMethod](prefix, message);
        }
      } else {
        // For non-errors, only log data if it exists
        if (logData && logData !== '') {
          console[consoleMethod](prefix, message, logData);
        } else {
          console[consoleMethod](prefix, message);
        }
      }
    }

    // Store in localStorage for persistence across page reloads
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('offline_logs', JSON.stringify(this.logs.slice(-50))); // Keep last 50
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('offline_logs');
      } catch (e) {
        // Ignore
      }
    }
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  // Load logs from localStorage on initialization
  loadPersistedLogs() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('offline_logs');
        if (stored) {
          const parsed = JSON.parse(stored);
          this.logs = parsed.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          }));
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }
}

export const offlineLogger = new OfflineLogger();

// Load persisted logs on initialization
if (typeof window !== 'undefined') {
  offlineLogger.loadPersistedLogs();
  offlineLogger.info('Offline logger initialized');
}

