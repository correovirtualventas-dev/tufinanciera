import { Router } from 'express';
import { alertsController } from '../controllers/alerts.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/overdue', authenticate, alertsController.getOverdue);
router.get('/upcoming', authenticate, alertsController.getUpcoming);
router.get('/pending-collection', authenticate, alertsController.getPendingCollection);
export default router;
