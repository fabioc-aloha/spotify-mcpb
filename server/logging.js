/**
 * Structured logging module for the Spotify MCPB server
 * Provides consistent, JSON-formatted logging with levels
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  constructor() {
    const levelStr = (process.env.LOG_LEVEL || 'info').toLowerCase();
    this.level = LOG_LEVELS[levelStr] ?? LOG_LEVELS.info;
  }

  _shouldLog(level) {
    return LOG_LEVELS[level] >= this.level;
  }

  _log(level, event, meta = {}) {
    if (!this._shouldLog(level)) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      ...meta,
    };

    // Output to stderr to avoid interfering with stdio transport
    console.error(JSON.stringify(entry));
  }

  debug(event, meta) {
    this._log('debug', event, meta);
  }

  info(event, meta) {
    this._log('info', event, meta);
  }

  warn(event, meta) {
    this._log('warn', event, meta);
  }

  error(event, meta) {
    this._log('error', event, meta);
  }
}

// Singleton instance
export const logger = new Logger();

/**
 * Helper to sanitize sensitive data from logs
 */
export function sanitizeForLog(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = Array.isArray(obj) ? [] : {};
  const sensitiveKeys = ['token', 'secret', 'password', 'authorization', 'client_secret', 'refresh_token'];

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(k => lowerKey.includes(k));

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeForLog(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
