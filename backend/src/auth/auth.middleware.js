import { verifyToken } from './auth.service.js';
import { AUTH_COOKIE_NAME } from './auth.controller.js';
import { sendError } from '../utils/response.js';

/**
 * Extract token from request cookie or Authorization header
 * @param {import('express').Request} req 
 * @returns {string|null}
 */
function extractToken(req) {
  // 1. Check HTTP-only cookie first
  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
    return req.cookies[AUTH_COOKIE_NAME];
  }

  // 2. Fallback to Authorization header Bearer token (for API testing / CLI clients)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Authentication Middleware
 * 
 * Verifies that the incoming request has a valid JWT session.
 * Attaches req.user upon success or returns 401 Unauthorized.
 */
export const authenticateUser = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return sendError(res, 401, 'Authentication required', {
        code: 'UNAUTHORIZED'
      });
    }

    try {
      const decoded = verifyToken(token);

      req.user = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role || 'USER'
      };

      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Session has expired. Please log in again.', {
          code: 'TOKEN_EXPIRED'
        });
      }
      return sendError(res, 401, 'Invalid authentication token', {
        code: 'INVALID_TOKEN'
      });
    }
  } catch (err) {
    console.error('[authenticateUser Error]:', err);
    return sendError(res, 401, 'Authentication error', {
      code: 'UNAUTHORIZED'
    });
  }
};

/**
 * Authorization Middleware Factory
 * 
 * Restricts route access to specified roles (e.g. 'ADMIN').
 * @param  {...string} allowedRoles 
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required', {
        code: 'UNAUTHORIZED'
      });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, 'Access forbidden: insufficient permissions', {
        code: 'FORBIDDEN'
      });
    }

    return next();
  };
};

/**
 * Optional Authentication Middleware
 * 
 * Attaches req.user if a valid token exists, but does not block unauthenticated requests.
 */
export const optionalAuthenticateUser = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyToken(token);
    req.user = {
      id: decoded.sub || decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || 'USER'
    };
    return next();
  } catch (err) {
    req.user = null;
    return next();
  }
};

export default {
  authenticateUser,
  authorizeRoles,
  optionalAuthenticateUser
};
