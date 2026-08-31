import config from '../config/index.js';
import resolveStoredFile from '../utils/fileResolver.js';

/**
 * Service calling Python preprocessing microservice for single image metadata extraction
 * 
 * @param {string} fileId - Uploaded file identifier
 * @returns {Promise<object>} Standardized metadata contract object
 */
export const extractImageMetadata = async (fileId) => {
  // 1. Resolve stored file safely
  const resolved = resolveStoredFile(fileId);
  if (!resolved.valid) {
    const err = new Error(resolved.error.message);
    err.code = resolved.error.code;
    err.statusCode = resolved.error.statusCode;
    throw err;
  }

  const targetPath = resolved.absolutePath;

  // 2. Call Python Preprocessing Microservice with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.preprocessingTimeoutMs);

  try {
    const response = await fetch(`${config.preprocessingServiceUrl}/metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filePath: targetPath }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const result = await response.json();

    if (!response.ok || !result.success) {
      const err = new Error(result.error?.message || 'Preprocessing service returned an error');
      err.code = result.error?.code || 'PREPROCESSING_ERROR';
      err.statusCode = response.status >= 400 && response.status < 500 ? response.status : 500;
      throw err;
    }

    // 3. Return normalized metadata response attached with fileId
    return {
      fileId,
      ...result.data
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      const timeoutErr = new Error('Preprocessing service request timed out');
      timeoutErr.code = 'PREPROCESSING_TIMEOUT';
      timeoutErr.statusCode = 504;
      throw timeoutErr;
    }

    if (error.code && error.statusCode) {
      throw error;
    }

    // Network / connection error when calling Python service
    const connErr = new Error('Preprocessing service unavailable');
    connErr.code = 'PREPROCESSING_SERVICE_UNAVAILABLE';
    connErr.statusCode = 503;
    throw connErr;
  }
};

export default {
  extractImageMetadata
};
