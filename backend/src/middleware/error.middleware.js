import config from '../config/index.js';
import { sendError } from '../utils/response.js';

/**
 * Centralized Error Handling Middleware
 */
export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  // Log error details with requestId for debugging
  console.error(`[ERROR] [${req.requestId || 'N/A'}] ${statusCode} - ${message}`);
  if (config.isDevelopment && err.stack) {
    console.error(err.stack);
  }

  const errorDetails = {
    code: errorCode,
    ...(config.isDevelopment && { stack: err.stack })
  };

  return sendError(res, statusCode, message, errorDetails);
};

export default errorMiddleware;
