import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { exchangeService } from '../services/exchange.service';

export const exchangeController = {
  async getDolarRates(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await exchangeService.getDolarRates()); }
    catch (err) { next(err); }
  },

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await exchangeService.list()); }
    catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await exchangeService.create(req.body)); }
    catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await exchangeService.update(parseInt(req.params.id), req.body)); }
    catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await exchangeService.delete(parseInt(req.params.id))); }
    catch (err) { next(err); }
  },

  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await exchangeService.getSummary()); }
    catch (err) { next(err); }
  },
};
