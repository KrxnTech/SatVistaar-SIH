import { Router } from 'express';
import healthRoutes from './health.routes.js';
import uploadRoutes from './upload.routes.js';
import analysisRoutes from './analysis.routes.js';

const router = Router();

// Mount health routes at /health
router.use('/health', healthRoutes);

// Mount upload routes at /uploads
router.use('/uploads', uploadRoutes);

// Mount analysis routes at /analysis
router.use('/analysis', analysisRoutes);

export default router;
