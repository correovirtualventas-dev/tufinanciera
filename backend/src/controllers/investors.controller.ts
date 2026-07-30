import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { investorsService } from '../services/investors.service';

export const investorsController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investorsService.list()); }
    catch (err) { next(err); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investorsService.getById(parseInt(req.params.id))); }
    catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await investorsService.create(req.body)); }
    catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investorsService.update(parseInt(req.params.id), req.body)); }
    catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investorsService.delete(parseInt(req.params.id))); }
    catch (err) { next(err); }
  },

  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investorsService.getSummary(parseInt(req.params.id))); }
    catch (err) { next(err); }
  },

  async createMovement(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await investorsService.createMovement(req.body)); }
    catch (err) { next(err); }
  },

  async deleteMovement(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investorsService.deleteMovement(parseInt(req.params.id))); }
    catch (err) { next(err); }
  },

  async listAccruals(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investorsService.listAccruals(parseInt(req.params.id))); }
    catch (err) { next(err); }
  },

  async recalculateAccruals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.body;
      res.json(await investorsService.recalculateAccruals(parseInt(req.params.id), startDate, endDate));
    } catch (err) { next(err); }
  },

  async deleteAccrual(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investorsService.deleteAccrual(parseInt(req.params.id))); }
    catch (err) { next(err); }
  },

  async createPayout(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await investorsService.createPayout(req.body)); }
    catch (err) { next(err); }
  },

  async deletePayout(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investorsService.deletePayout(parseInt(req.params.id))); }
    catch (err) { next(err); }
  },

  async setPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investorsService.setPassword(parseInt(req.params.id), req.body.password)); }
    catch (err) { next(err); }
  },

  async processDailyAccruals(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await investorsService.processDailyAccruals()); }
    catch (err) { next(err); }
  },
};
