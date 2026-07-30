import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/admin', authenticate, dashboardController.getAdminMetrics);
router.get('/overdue-loans', authenticate, dashboardController.getOverdueLoans);
export default router;
