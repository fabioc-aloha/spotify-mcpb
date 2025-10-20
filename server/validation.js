/**
 * Input validation module for the Spotify MCPB server
 * Provides validation functions and sanitization
 */

import { InvalidArgumentError } from './error.js';

/**
 * Validate required fields are present
 */
export function validateRequired(args, requiredFields) {
  const missing = [];

  for (const field of requiredFields) {
    if (args[field] === undefined || args[field] === null || args[field] === '') {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new InvalidArgumentError(
      `Missing required fields: ${missing.join(', ')}`,
      { missingFields: missing }
    );
  }
}

/**
 * Validate string field
 */
export function validateString(value, fieldName, options = {}) {
  const { minLength = 0, maxLength = 1000, required = false } = options;

  if (required && !value) {
    throw new InvalidArgumentError(`${fieldName} is required`);
  }

  if (value === undefined || value === null) {
    if (required) {
      throw new InvalidArgumentError(`${fieldName} is required`);
    }
    return;
  }

  if (typeof value !== 'string') {
    throw new InvalidArgumentError(`${fieldName} must be a string`, {
      provided: typeof value,
    });
  }

  if (value.length < minLength) {
    throw new InvalidArgumentError(
      `${fieldName} must be at least ${minLength} characters`,
      { length: value.length, minLength }
    );
  }

  if (value.length > maxLength) {
    throw new InvalidArgumentError(
      `${fieldName} must be at most ${maxLength} characters`,
      { length: value.length, maxLength }
    );
  }
}

/**
 * Validate number field
 */
export function validateNumber(value, fieldName, options = {}) {
  const { min = -Infinity, max = Infinity, integer = false, required = false } = options;

  if (required && value === undefined) {
    throw new InvalidArgumentError(`${fieldName} is required`);
  }

  if (value === undefined || value === null) return;

  if (typeof value !== 'number' || isNaN(value)) {
    throw new InvalidArgumentError(`${fieldName} must be a number`, {
      provided: typeof value,
    });
  }

  if (integer && !Number.isInteger(value)) {
    throw new InvalidArgumentError(`${fieldName} must be an integer`);
  }

  if (value < min) {
    throw new InvalidArgumentError(
      `${fieldName} must be at least ${min}`,
      { value, min }
    );
  }

  if (value > max) {
    throw new InvalidArgumentError(
      `${fieldName} must be at most ${max}`,
      { value, max }
    );
  }
}

/**
 * Validate array field
 */
export function validateArray(value, fieldName, options = {}) {
  const { minLength = 0, maxLength = 1000, required = false } = options;

  if (required && !value) {
    throw new InvalidArgumentError(`${fieldName} is required`);
  }

  if (value === undefined || value === null) {
    if (required) {
      throw new InvalidArgumentError(`${fieldName} is required`);
    }
    return;
  }

  if (!Array.isArray(value)) {
    throw new InvalidArgumentError(`${fieldName} must be an array`, {
      provided: typeof value,
    });
  }

  if (value.length < minLength) {
    throw new InvalidArgumentError(
      `${fieldName} must have at least ${minLength} items`,
      { length: value.length, minLength }
    );
  }

  if (value.length > maxLength) {
    throw new InvalidArgumentError(
      `${fieldName} must have at most ${maxLength} items`,
      { length: value.length, maxLength }
    );
  }
}

/**
 * Validate boolean field
 */
export function validateBoolean(value, fieldName, options = {}) {
  const { required = false } = options;

  if (required && value === undefined) {
    throw new InvalidArgumentError(`${fieldName} is required`);
  }

  if (value === undefined || value === null) return;

  if (typeof value !== 'boolean') {
    throw new InvalidArgumentError(`${fieldName} must be a boolean`, {
      provided: typeof value,
    });
  }
}

/**
 * Sanitize playlist name - remove/replace invalid characters
 */
export function sanitizePlaylistName(name) {
  if (!name || typeof name !== 'string') return '';

  // Remove control characters and trim
  return name
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, 100); // Spotify limit
}

/**
 * Sanitize description
 */
export function sanitizeDescription(description) {
  if (!description || typeof description !== 'string') return '';

  return description
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, 300);
}

/**
 * Validate Spotify URI format
 */
export function validateSpotifyUri(uri, fieldName = 'uri') {
  if (!uri || typeof uri !== 'string') {
    throw new InvalidArgumentError(`${fieldName} must be a valid Spotify URI`);
  }

  // Spotify URIs are in format: spotify:track:xxxx or spotify:playlist:xxxx, etc.
  const uriPattern = /^spotify:[a-z]+:[a-zA-Z0-9]+$/;

  if (!uriPattern.test(uri)) {
    throw new InvalidArgumentError(
      `${fieldName} must be a valid Spotify URI (e.g., spotify:track:xxxx)`,
      { provided: uri }
    );
  }
}

/**
 * Clamp audio feature values to valid ranges
 */
export function clampAudioFeature(value, min = 0, max = 1) {
  if (typeof value !== 'number' || isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}
