import path from 'path';

/**
 * Supported file extensions for remote sensing & web benchmark image inputs
 */
export const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.tif', '.tiff'];

/**
 * Mapping of extension to accepted MIME types
 */
export const EXTENSION_MIME_MAP = {
  '.png': ['image/png'],
  '.jpg': ['image/jpeg', 'image/pjpeg'],
  '.jpeg': ['image/jpeg', 'image/pjpeg'],
  '.tif': ['image/tiff', 'image/geotiff', 'image/x-geotiff', 'image/gtiff', 'application/geotiff', 'application/octet-stream'],
  '.tiff': ['image/tiff', 'image/geotiff', 'image/x-geotiff', 'image/gtiff', 'application/geotiff', 'application/octet-stream']
};

/**
 * Validates extension and MIME consistency of an incoming file
 * 
 * @param {string} originalName - Original filename
 * @param {string} mimeType - Uploaded file MIME type
 * @returns {{ valid: boolean, errorCode?: string, reason?: string, extension?: string }}
 */
export const validateFileFormat = (originalName, mimeType) => {
  if (!originalName) {
    return { valid: false, errorCode: 'INVALID_FILE_NAME', reason: 'Filename is missing' };
  }

  const ext = path.extname(originalName).toLowerCase();
  
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      errorCode: 'UNSUPPORTED_FILE_TYPE',
      reason: `Unsupported file extension '${ext}'. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
      extension: ext
    };
  }

  const allowedMimes = EXTENSION_MIME_MAP[ext] || [];
  const normalizedMime = (mimeType || '').toLowerCase().trim();

  if (!allowedMimes.includes(normalizedMime)) {
    return {
      valid: false,
      errorCode: 'INVALID_MIME_TYPE',
      reason: `MIME type '${mimeType}' conflicts with file extension '${ext}'`,
      extension: ext
    };
  }

  return { valid: true, extension: ext };
};
