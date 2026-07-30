import { Router } from 'express';
import { scoringController } from '../controllers/scoring.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.get('/bcra', authenticate, scoringController.checkBcra);
router.post('/simulate', authenticate, scoringController.simulate);
router.post('/recalculate/:clientId', authenticate, scoringController.recalculate);
router.get('/details/:clientId', authenticate, scoringController.getDetails);
export default router;
