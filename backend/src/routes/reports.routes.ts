import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/clients', authenticate, reportsController.clients);
router.get('/loans/active', authenticate, reportsController.activeLoans);
router.get('/loans/overdue', authenticate, reportsController.overdueLoans);
router.get('/payments', authenticate, reportsController.payments);
router.get('/dashboard', authenticate, reportsController.dashboard);
router.get('/exchange', authenticate, reportsController.exchange);
router.get('/investors', authenticate, reportsController.investors);
router.get('/investors/:id', authenticate, reportsController.investorDetail);
router.get('/investors/:id/balance', authenticate, reportsController.investorBalance);
router.get('/cash-register', authenticate, reportsController.cashRegister);
export default router;
