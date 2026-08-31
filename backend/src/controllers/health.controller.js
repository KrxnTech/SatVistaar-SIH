import { getHealthStatus } from '../services/health.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Health Controller - handles health check API requests
 */
export const getHealth = (req, res, next) => {
  try {
    const healthData = getHealthStatus();
    return sendSuccess(res, 200, 'SatQuery AI backend is healthy', healthData);
  } catch (error) {
    next(error);
  }
};

export default {
  getHealth
};
