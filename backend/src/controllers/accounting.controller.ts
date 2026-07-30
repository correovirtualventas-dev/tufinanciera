import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { accountingService } from '../services/accounting.service';

export const accountingController = {
  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await accountingService.getSummary()); }
    catch (err) { next(err); }
  },

  async getMovements(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, type } = req.query;
      res.json(await accountingService.getMovements({
        startDate: startDate as string,
        endDate: endDate as string,
        type: type as string,
      }));
    } catch (err) { next(err); }
  },

  async createExpense(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await accountingService.createExpense(req.body)); }
    catch (err) { next(err); }
  },

  async getCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await accountingService.getCategories()); }
    catch (err) { next(err); }
  },

  async createCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await accountingService.createCategory(req.body.name)); }
    catch (err) { next(err); }
  },

  async deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await accountingService.deleteCategory(parseInt(req.params.id))); }
    catch (err) { next(err); }
  },
};
