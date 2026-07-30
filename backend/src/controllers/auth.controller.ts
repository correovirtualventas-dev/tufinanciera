import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services/auth.service';

export const authController = {
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { nameOrEmail, password } = req.body;
      if (!nameOrEmail || !password) {
        return res.status(400).json({ error: 'Faltan credenciales', body: req.body });
      }
      const result = await authService.login(nameOrEmail, password);
      res.json(result);
    } catch (err: any) {
      console.error('[LOGIN ERROR]', err?.message, err?.stack?.slice(0, 300));
      return res.status(400).json({ error: err?.message || 'Error login' });
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

  async seedAdmin(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.seedAdmin();
      res.json({ message: 'Admin seeded' });
    } catch (err) {
      next(err);
    }
  },
};
