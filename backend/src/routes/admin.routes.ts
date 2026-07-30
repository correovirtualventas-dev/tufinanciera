import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/users', authenticate, requireAdmin, adminController.listUsers);
router.post('/users', authenticate, requireAdmin, adminController.createUser);
router.patch('/users/:id', authenticate, requireAdmin, adminController.updateUser);
router.delete('/users/:id', authenticate, requireAdmin, adminController.deleteUser);
router.get('/settings', authenticate, requireAdmin, adminController.getSettings);
router.post('/settings/:key', authenticate, requireAdmin, adminController.updateSetting);
router.get('/backup', authenticate, requireAdmin, adminController.backup);
router.post('/restore', authenticate, requireAdmin, adminController.restore);
export default router;
