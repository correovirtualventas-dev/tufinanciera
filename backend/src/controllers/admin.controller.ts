import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { adminService } from '../services/admin.service';

export const adminController = {
  async listUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await adminService.listUsers()); }
    catch (err) { next(err); }
  },

  async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.status(201).json(await adminService.createUser(req.body)); }
    catch (err) { next(err); }
  },

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await adminService.updateUser(parseInt(req.params.id), req.body)); }
    catch (err) { next(err); }
  },

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await adminService.deleteUser(parseInt(req.params.id))); }
    catch (err) { next(err); }
  },

  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await adminService.getSettings()); }
    catch (err) { next(err); }
  },

  async updateSetting(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await adminService.updateSetting(req.params.key, req.body.value)); }
    catch (err) { next(err); }
  },

  async backup(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await adminService.backupData()); }
    catch (err) { next(err); }
  },

  async restore(req: AuthRequest, res: Response, next: NextFunction) {
    try { res.json(await adminService.restoreData(req.body)); }
    catch (err) { next(err); }
  },
};
