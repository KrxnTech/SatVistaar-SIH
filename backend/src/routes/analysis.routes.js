import { Router } from 'express';
import { createAnalysis } from '../controllers/analysis.controller.js';

const router = Router();

// POST / - Create and classify analysis request
router.post('/', createAnalysis);

export default router;
