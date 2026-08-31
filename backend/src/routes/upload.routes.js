import { Router } from 'express';
import handleImageUpload from '../middleware/upload.middleware.js';
import { uploadImages } from '../controllers/upload.controller.js';
import { getImageMetadata, validatePair } from '../controllers/preprocessing.controller.js';

const router = Router();

// POST / - Upload 1-2 remote sensing images
router.post('/', handleImageUpload, uploadImages);

// POST /pair-validation - Validate compatibility of 2 uploaded images
router.post('/pair-validation', validatePair);

// GET /:fileId/metadata - Retrieve extracted metadata for single image
router.get('/:fileId/metadata', getImageMetadata);

export default router;
