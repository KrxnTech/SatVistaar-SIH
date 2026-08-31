import { Router } from 'express';
import { register, login, logout, me } from './auth.controller.js';
import { authenticateUser } from './auth.middleware.js';

const router = Router();

// Public Authentication Endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Authenticated Session Endpoint
router.get('/me', authenticateUser, me);

export default router;
