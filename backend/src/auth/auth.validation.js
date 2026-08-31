/**
 * Authentication Input Validation Utilities
 */

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validate user registration payload
 * @param {object} input
 * @param {string} input.name
 * @param {string} input.email
 * @param {string} input.password
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateRegistrationInput(input = {}) {
  const errors = [];
  const { name, email, password } = input;

  // Name validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  } else if (name.trim().length > 100) {
    errors.push('Name cannot exceed 100 characters');
  }

  // Email validation
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please enter a valid email address');
  } else if (email.trim().length > 254) {
    errors.push('Email address is too long');
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  } else if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate user login payload
 * @param {object} input
 * @param {string} input.email
 * @param {string} input.password
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateLoginInput(input = {}) {
  const errors = [];
  const { email, password } = input;

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please enter a valid email address');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  validateRegistrationInput,
  validateLoginInput
};
