import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services/auth.service';

export const authController = {
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { nameOrEmail, password } = req.body;
      const result = await authService.login(nameOrEmail, password);
      res.json(result);
    } catch (err: any) {
      next(err);
    }
  },

  async investorLogin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { dni, password } = req.body;
      const result = await authService.investorLogin(dni, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async clientLogin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { dni, password } = req.body;
      const result = await authService.clientLogin(dni, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await authService.getProfile(req.user!.userId, req.user!.role);
      res.json(profile);
    } catch (err) {
      next(err);
    }
  },

    async verifyPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { password } = req.body;
      const result = await authService.verifyPassword(req.user!.userId, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async seedAdmin(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.seedAdmin();
      res.json({ message: 'Admin seeded' });
    } catch (err) {
      next(err);
    }
  },
};
