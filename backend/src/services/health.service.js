import config from '../config/index.js';

/**
 * Health Service - contains logic for retrieving backend health metrics
 */
export const getHealthStatus = () => {
  return {
    service: 'satquery-backend',
    status: 'ok',
    environment: config.nodeEnv
  };
};

export default {
  getHealthStatus
};
