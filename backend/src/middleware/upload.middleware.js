import multer from 'multer';
import fs from 'fs';
import upload from '../config/multer.config.js';

/**
 * Utility helper to safely delete files created during a failed upload request
 * 
 * @param {Array<Express.Multer.File>} files - Array of files to unlink
 */
export const cleanupFiles = (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) return;

  for (const file of files) {
    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error(`Failed to cleanup orphaned file ${file.path}:`, err);
      }
    }
  }
};

/**
 * Middleware handling multipart upload for 1-2 remote sensing images under field 'images'
 */
export const handleImageUpload = (req, res, next) => {
  // Use upload.any() to flexibly accept field names like 'images', 'image', 'file', etc.
  const multerAnyUpload = upload.any();

  multerAnyUpload(req, res, (err) => {
    if (err) {
      // Cleanup any files written to disk before error occurred
      cleanupFiles(req.files);

      if (err instanceof multer.MulterError) {
        let code = 'UPLOAD_ERROR';
        let statusCode = 400;
        let message = err.message;

        if (err.code === 'LIMIT_FILE_SIZE') {
          code = 'FILE_TOO_LARGE';
          message = 'File size exceeds maximum allowed upload limit';
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          code = 'TOO_MANY_FILES';
          message = 'Maximum of 2 images allowed per upload request';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          code = 'UNEXPECTED_FIELD';
          message = `Unexpected upload field name '${err.field || 'unknown'}'. Please use field name 'images' or 'image'`;
        }

        const customErr = new Error(message);
        customErr.code = code;
        customErr.statusCode = statusCode;
        return next(customErr);
      }

      return next(err);
    }

    // Filter out zero-byte placeholder files if sent by API clients
    const validFiles = (req.files || []).filter((f) => f.size > 0);

    // Clean up any zero-byte files created on disk
    const invalidFiles = (req.files || []).filter((f) => f.size === 0);
    cleanupFiles(invalidFiles);

    req.files = validFiles;

    if (validFiles.length === 0) {
      const err = new Error('No files uploaded. Expected 1 or 2 images.');
      err.code = 'NO_FILES_UPLOADED';
      err.statusCode = 400;
      return next(err);
    }

    if (validFiles.length > 2) {
      cleanupFiles(validFiles);
      const err = new Error('Maximum of 2 images allowed per upload request.');
      err.code = 'TOO_MANY_FILES';
      err.statusCode = 400;
      return next(err);
    }

    next();
  });
};

export default handleImageUpload;
