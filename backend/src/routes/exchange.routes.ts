import { Router } from 'express';
import { exchangeController } from '../controllers/exchange.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, exchangeController.list);
router.get('/dolar', authenticate, exchangeController.getDolarRates);
router.get('/summary', authenticate, exchangeController.getSummary);
router.post('/', authenticate, exchangeController.create);
router.patch('/:id', authenticate, exchangeController.update);
router.delete('/:id', authenticate, exchangeController.delete);
export default router;
