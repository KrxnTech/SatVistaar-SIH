/**
 * Send a standardized success JSON response
 * 
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human readable status message
 * @param {object|array|null} [data=null] - Response data payload
 */
export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const responseBody = {
    success: true,
    message,
    ...(data !== null && { data }),
    requestId: res.req?.requestId || null
  };

  return res.status(statusCode).json(responseBody);
};

/**
 * Send a standardized error JSON response
 * 
 * @param {import('express').Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error description
 * @param {object|string|null} [error=null] - Detailed error info or error code object
 */
export const sendError = (res, statusCode = 500, message = 'An error occurred', error = null) => {
  const responseBody = {
    success: false,
    message,
    error: typeof error === 'string' ? { code: error } : (error || { code: 'INTERNAL_SERVER_ERROR' }),
    requestId: res.req?.requestId || null
  };

  return res.status(statusCode).json(responseBody);
};
