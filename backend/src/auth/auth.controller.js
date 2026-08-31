import config from '../config/index.js';
import { sendSuccess } from '../utils/response.js';
import { registerUser, loginUser, getCurrentUser } from './auth.service.js';

export const AUTH_COOKIE_NAME = 'satvistaar_token';

/**
 * Helper to get standard cookie configuration
 */
export function getCookieOptions() {
  const isProduction = config.isProduction;
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  };
}

/**
 * Helper to get clear-cookie configuration matching the original creation options
 */
export function getClearCookieOptions() {
  const isProduction = config.isProduction;
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  };
}

/**
 * Handle user registration: POST /api/v1/auth/register
 */
export async function register(req, res, next) {
  try {
    const { user, token } = await registerUser(req.body);

    // Set secure HTTP-only authentication cookie
    res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());

    return sendSuccess(res, 201, 'User registered successfully', {
      user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle user login: POST /api/v1/auth/login
 */
export async function login(req, res, next) {
  try {
    const { user, token } = await loginUser(req.body);

    // Set secure HTTP-only authentication cookie
    res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());

    return sendSuccess(res, 200, 'Logged in successfully', {
      user
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle user logout: POST /api/v1/auth/logout
 */
export async function logout(req, res, next) {
  try {
    // Clear authentication cookie using identical cookie configuration
    res.clearCookie(AUTH_COOKIE_NAME, getClearCookieOptions());

    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Handle current user lookup: GET /api/v1/auth/me
 */
export async function me(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.sub;
    const user = await getCurrentUser(userId);

    return sendSuccess(res, 200, 'Current user profile retrieved', {
      user
    });
  } catch (error) {
    next(error);
  }
}

export default {
  register,
  login,
  logout,
  me,
  AUTH_COOKIE_NAME,
  getCookieOptions,
  getClearCookieOptions
};
