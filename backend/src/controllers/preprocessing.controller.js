import { extractImageMetadata } from '../services/preprocessing.service.js';
import { validateImagePair } from '../services/pairValidation.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Controller retrieving metadata for a single uploaded image
 */
export const getImageMetadata = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const metadata = await extractImageMetadata(fileId);
    return sendSuccess(res, 200, 'Image metadata extracted successfully', {
      fileId,
      metadata
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller evaluating pair compatibility between two uploaded images
 */
export const validatePair = async (req, res, next) => {
  try {
    const { fileIds } = req.body || {};
    const pairResult = await validateImagePair(fileIds);
    return sendSuccess(res, 200, 'Image pair validation completed', pairResult);
  } catch (error) {
    next(error);
  }
};

export default {
  getImageMetadata,
  validatePair
};
