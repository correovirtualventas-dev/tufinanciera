import { Router } from 'express';
import { loansController } from '../controllers/loans.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, loansController.list);
router.get('/:id', authenticate, loansController.getById);
router.get('/:id/amortization-data', authenticate, loansController.getAmortization);
router.get('/:id/amortization', authenticate, loansController.getAmortizationPdf);
router.post('/', authenticate, loansController.create);
router.patch('/:id/status', authenticate, loansController.updateStatus);
router.delete('/:id', authenticate, loansController.delete);
export default router;
