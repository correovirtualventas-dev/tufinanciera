import { Router } from 'express';
import { paymentsController } from '../controllers/payments.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/recent', authenticate, paymentsController.getRecent);
router.get('/loan/:loanId', authenticate, paymentsController.getByLoan);
router.get('/loan/:loanId/receipt/:installment', authenticate, paymentsController.getReceiptPdf);
router.post('/', authenticate, paymentsController.register);
export default router;
