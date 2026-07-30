import { Router } from 'express';
import { prospectsController } from '../controllers/prospects.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/', authenticate, prospectsController.list);
router.get('/:id', authenticate, prospectsController.getById);
router.post('/', prospectsController.create);
router.patch('/:id', authenticate, prospectsController.update);
router.delete('/:id', authenticate, prospectsController.delete);
export default router;
