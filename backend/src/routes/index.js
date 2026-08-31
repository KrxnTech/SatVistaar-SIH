import { Router } from 'express';
import healthRoutes from './health.routes.js';
import uploadRoutes from './upload.routes.js';
import analysisRoutes from './analysis.routes.js';
import authRoutes from '../auth/auth.routes.js';
import { authenticateUser } from '../auth/auth.middleware.js';

const router = Router();

// Mount public auth routes at /auth (/api/v1/auth/register, /login, /logout, /me)
router.use('/auth', authRoutes);

// Mount public health check routes at /health
router.use('/health', healthRoutes);

// Protected routes (require valid JWT authentication)
router.use('/uploads', authenticateUser, uploadRoutes);
router.use('/analysis', authenticateUser, analysisRoutes);

export default router;

