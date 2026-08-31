import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import userRepository from './auth.repository.js';
import { validateRegistrationInput, validateLoginInput } from './auth.validation.js';

const BCRYPT_SALT_ROUNDS = 10;

/**
 * Sanitizes user object by stripping internal secrets (passwordHash)
 * @param {object} user 
 * @returns {object}
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

/**
 * Generates a signed JSON Web Token
 * @param {object} user 
 * @returns {string}
 */
export function generateToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'USER'
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn || '7d'
  });
}

/**
 * Verifies and decodes a JWT token
 * @param {string} token 
 * @returns {object} Decoded JWT payload
 */
export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

/**
 * Register a new user
 * @param {object} input
 * @param {string} input.name
 * @param {string} input.email
 * @param {string} input.password
 * @param {string} [input.role]
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function registerUser(input) {
  const validation = validateRegistrationInput(input);
  if (!validation.isValid) {
    const error = new Error(validation.errors.join('. '));
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.errors = validation.errors;
    throw error;
  }

  const normalizedEmail = input.email.trim().toLowerCase();

  // Check duplicate email
  const existingUser = await userRepository.findByEmail(normalizedEmail);
  if (existingUser) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

  // If this is the very first user created, optionally assign ADMIN role or default USER
  const userCount = await userRepository.count();
  const role = input.role && ['USER', 'ADMIN'].includes(input.role)
    ? input.role
    : (userCount === 0 ? 'USER' : 'USER');

  // Create user
  const newUser = await userRepository.create({
    name: input.name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
    isActive: true
  });

  const token = generateToken(newUser);
  return {
    user: sanitizeUser(newUser),
    token
  };
}

/**
 * Authenticate existing user with credentials
 * @param {object} input
 * @param {string} input.email
 * @param {string} input.password
 * @returns {Promise<{ user: object, token: string }>}
 */
export async function loginUser(input) {
  const validation = validateLoginInput(input);
  if (!validation.isValid) {
    const error = new Error(validation.errors.join('. '));
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.errors = validation.errors;
    throw error;
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  if (user.isActive === false) {
    const error = new Error('This account has been deactivated');
    error.statusCode = 403;
    error.code = 'ACCOUNT_INACTIVE';
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  // Update lastLoginAt
  const updatedUser = await userRepository.update(user.id, {
    lastLoginAt: new Date().toISOString()
  });

  const token = generateToken(updatedUser || user);
  return {
    user: sanitizeUser(updatedUser || user),
    token
  };
}

/**
 * Retrieve user by ID
 * @param {string} userId 
 * @returns {Promise<object>}
 */
export async function getCurrentUser(userId) {
  if (!userId) {
    const error = new Error('Authentication required');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  const user = await userRepository.findById(userId);
  if (!user || user.isActive === false) {
    const error = new Error('User not found or account is deactivated');
    error.statusCode = 401;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  return sanitizeUser(user);
}

export default {
  sanitizeUser,
  generateToken,
  verifyToken,
  registerUser,
  loginUser,
  getCurrentUser
};
