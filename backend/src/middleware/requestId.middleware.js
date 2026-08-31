import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to attach a unique X-Request-ID header and req.requestId property
 */
export const requestIdMiddleware = (req, res, next) => {
  // Use incoming request ID if provided by client/proxy, otherwise generate a new UUID
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  next();
};

export default requestIdMiddleware;
