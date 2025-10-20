/**
 * Error handling module for the Spotify MCPB server
 * Provides structured error classes and response formatting
 */

import { logger } from './logging.js';

// Error codes following MCPB best practices
export const ErrorCodes = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_ARGUMENT: 'INVALID_ARGUMENT',
  RATE_LIMITED: 'RATE_LIMITED',
  NOT_FOUND: 'NOT_FOUND',
  SPOTIFY_ERROR: 'SPOTIFY_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  TIMEOUT: 'TIMEOUT',
};

/**
 * Base MCP Tool Error class
 */
export class McpToolError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'McpToolError';
    this.code = code;
    this.details = details;
  }

  /**
   * Convert error to MCP response format
   */
  toResponse() {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: {
                code: this.code,
                message: this.message,
                details: this.details,
              },
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Authentication error
 */
export class AuthError extends McpToolError {
  constructor(message = 'Authentication required or failed', details = {}) {
    super(ErrorCodes.AUTH_REQUIRED, message, details);
    this.name = 'AuthError';
  }
}

/**
 * Invalid argument error
 */
export class InvalidArgumentError extends McpToolError {
  constructor(message, details = {}) {
    super(ErrorCodes.INVALID_ARGUMENT, message, details);
    this.name = 'InvalidArgumentError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends McpToolError {
  constructor(message = 'Rate limit exceeded', details = {}) {
    super(ErrorCodes.RATE_LIMITED, message, details);
    this.name = 'RateLimitError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends McpToolError {
  constructor(message, details = {}) {
    super(ErrorCodes.NOT_FOUND, message, details);
    this.name = 'NotFoundError';
  }
}

/**
 * Internal error
 */
export class InternalError extends McpToolError {
  constructor(message = 'Internal server error', details = {}) {
    super(ErrorCodes.INTERNAL_ERROR, message, details);
    this.name = 'InternalError';
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends McpToolError {
  constructor(message = 'Operation timed out', details = {}) {
    super(ErrorCodes.TIMEOUT, message, details);
    this.name = 'TimeoutError';
  }
}

/**
 * Wrap Spotify API errors into structured McpToolError
 */
export function wrapSpotifyError(err) {
  logger.error('spotify_api_error', {
    status: err.statusCode,
    message: err.message,
    body: err.body,
  });

  const statusCode = err.statusCode || err.status;
  const message = err.message || 'Spotify API error';

  // Map HTTP status codes to error types
  if (statusCode === 401 || statusCode === 403) {
    return new AuthError('Spotify authentication failed. Check your credentials.', {
      statusCode,
      originalMessage: message,
    });
  }

  if (statusCode === 404) {
    return new NotFoundError('Spotify resource not found', {
      statusCode,
      originalMessage: message,
    });
  }

  if (statusCode === 429) {
    const retryAfter = err.headers?.['retry-after'] || 'unknown';
    return new RateLimitError('Spotify API rate limit exceeded', {
      statusCode,
      retryAfter,
    });
  }

  if (statusCode === 400) {
    return new InvalidArgumentError('Invalid request to Spotify API', {
      statusCode,
      originalMessage: message,
      body: err.body,
    });
  }

  // Default to internal error
  return new InternalError('Spotify API error', {
    statusCode,
    originalMessage: message,
  });
}

/**
 * Handle generic errors and convert to McpToolError
 */
export function handleError(err, context = '') {
  if (err instanceof McpToolError) {
    return err;
  }

  logger.error('unhandled_error', {
    context,
    error: err.message,
    stack: err.stack,
  });

  return new InternalError(`Error: ${err.message}`, {
    context,
    originalError: err.message,
  });
}
