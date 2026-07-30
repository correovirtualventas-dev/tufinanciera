import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { cashRegisterService } from '../services/cashRegister.service';

export const cashRegisterController = {
  async getCurrent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const register = await cashRegisterService.getCurrent();
      res.json(register);
    } catch (err) { next(err); }
  },

  async open(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await cashRegisterService.open({
        ...req.body,
        userId: req.user!.userId,
      });
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async close(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { closeAmount, notes } = req.body;
      const result = await cashRegisterService.close(id, closeAmount, notes);
      res.json(result);
    } catch (err) { next(err); }
  },

  async addEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const entry = await cashRegisterService.addEntry(req.body);
      res.status(201).json(entry);
    } catch (err) { next(err); }
  },

  async history(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const history = await cashRegisterService.listHistory();
      res.json(history);
    } catch (err) { next(err); }
  },
};
