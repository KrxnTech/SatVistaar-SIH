import { sendError } from '../utils/response.js';

/**
 * 404 Not Found Handler for unknown routes
 */
export const notFoundMiddleware = (req, res) => {
  return sendError(
    res,
    404,
    `Route ${req.originalUrl} not found`,
    { code: 'ROUTE_NOT_FOUND' }
  );
};

export default notFoundMiddleware;
