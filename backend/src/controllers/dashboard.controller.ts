import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dashboardService } from '../services/dashboard.service';

export const dashboardController = {
  async getAdminMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await dashboardService.getAdminMetrics();
      res.json(metrics);
    } catch (err) {
      next(err);
    }
  },

  async getOverdueLoans(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const loans = await dashboardService.getOverdueLoans();
      res.json(loans);
    } catch (err) {
      next(err);
    }
  },
};
