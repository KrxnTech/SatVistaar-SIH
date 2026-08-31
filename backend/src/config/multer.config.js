import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import config from './index.js';
import { validateFileFormat } from '../utils/fileValidation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadAbsolutePath = path.resolve(__dirname, '../../', config.uploadDir);
if (!fs.existsSync(uploadAbsolutePath)) {
  fs.mkdirSync(uploadAbsolutePath, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadAbsolutePath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueFilename = `${uuidv4()}${ext}`;
    cb(null, uniqueFilename);
  }
});

// File filter function enforcing extension and MIME type validation
const fileFilter = (req, file, cb) => {
  const validation = validateFileFormat(file.originalname, file.mimetype);
  
  if (!validation.valid) {
    const err = new Error(validation.reason);
    err.code = validation.errorCode;
    err.statusCode = 400;
    return cb(err, false);
  }
  
  cb(null, true);
};

// Create Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxUploadSizeMb * 1024 * 1024 // Configurable limit in bytes
  }
});

export default upload;
