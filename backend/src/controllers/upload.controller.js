import { processUploads } from '../services/upload.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Upload Controller - handles POST /api/v1/uploads request
 */
export const uploadImages = (req, res, next) => {
  try {
    const uploadResult = processUploads(req.files || []);
    return sendSuccess(res, 200, 'Images uploaded successfully', uploadResult);
  } catch (error) {
    next(error);
  }
};

export default {
  uploadImages
};
