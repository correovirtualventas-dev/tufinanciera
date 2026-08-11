import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.post('/login', authController.login);
router.post('/investor-login', authController.investorLogin);
router.post('/client-login', authController.clientLogin);
router.get('/profile', authenticate, authController.getProfile);
router.post('/verify-password', authenticate, authController.verifyPassword);
router.post('/seed', authController.seedAdmin);
export default router;
