import { Router } from 'express';
import { accountingController } from '../controllers/accounting.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/summary', authenticate, accountingController.getSummary);
router.get('/movements', authenticate, accountingController.getMovements);
router.post('/expenses', authenticate, accountingController.createExpense);
router.get('/categories', authenticate, accountingController.getCategories);
router.post('/categories', authenticate, requireAdmin, accountingController.createCategory);
router.delete('/categories/:id', authenticate, requireAdmin, accountingController.deleteCategory);
export default router;
