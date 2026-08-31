import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_ABSOLUTE_DIR = path.resolve(__dirname, '../../', config.uploadDir);

/**
 * Safely resolves a client fileId to an internal trusted file path in uploads/
 * Guarantees path traversal prevention (rejecting ../ or absolute path injections)
 * 
 * @param {string} fileId - The client supplied file identifier or filename
 * @returns {{ valid: boolean, absolutePath?: string, error?: { statusCode: number, code: string, message: string } }}
 */
export const resolveStoredFile = (fileId) => {
  if (!fileId || typeof fileId !== 'string') {
    return {
      valid: false,
      error: { statusCode: 400, code: 'INVALID_FILE_ID', message: 'File ID is missing or invalid' }
    };
  }

  const trimmedId = fileId.trim();

  // Prevent path traversal sequences or unexpected characters
  if (trimmedId.includes('..') || trimmedId.includes('/') || trimmedId.includes('\\')) {
    return {
      valid: false,
      error: { statusCode: 400, code: 'PATH_TRAVERSAL_DETECTED', message: 'Invalid file ID format' }
    };
  }

  // Look for exact file or matching file with extension in uploads/
  let targetPath = path.join(UPLOADS_ABSOLUTE_DIR, trimmedId);
  
  // If targetPath doesn't exist directly, scan uploads directory for matching basename
  if (!fs.existsSync(targetPath)) {
    if (!fs.existsSync(UPLOADS_ABSOLUTE_DIR)) {
      return {
        valid: false,
        error: { statusCode: 404, code: 'FILE_NOT_FOUND', message: `Uploaded file '${fileId}' not found` }
      };
    }

    const files = fs.readdirSync(UPLOADS_ABSOLUTE_DIR);
    const matchingFile = files.find((f) => path.parse(f).name === trimmedId || f === trimmedId);
    
    if (matchingFile) {
      targetPath = path.join(UPLOADS_ABSOLUTE_DIR, matchingFile);
    } else {
      return {
        valid: false,
        error: { statusCode: 404, code: 'FILE_NOT_FOUND', message: `Uploaded file '${fileId}' not found` }
      };
    }
  }

  // Security Check: Verify resolved path is strictly contained inside UPLOADS_ABSOLUTE_DIR
  const normalizedTarget = path.normalize(targetPath);
  const normalizedBase = path.normalize(UPLOADS_ABSOLUTE_DIR);

  if (!normalizedTarget.startsWith(normalizedBase)) {
    return {
      valid: false,
      error: { statusCode: 400, code: 'PATH_TRAVERSAL_DETECTED', message: 'Access denied' }
    };
  }

  return {
    valid: true,
    absolutePath: normalizedTarget
  };
};

export default resolveStoredFile;
