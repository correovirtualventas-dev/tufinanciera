import { Router } from 'express';
import { cashRegisterController } from '../controllers/cashRegister.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/current', authenticate, cashRegisterController.getCurrent);
router.post('/open', authenticate, cashRegisterController.open);
router.post('/:id/close', authenticate, cashRegisterController.close);
router.post('/entries', authenticate, cashRegisterController.addEntry);
router.get('/history', authenticate, cashRegisterController.history);
export default router;
