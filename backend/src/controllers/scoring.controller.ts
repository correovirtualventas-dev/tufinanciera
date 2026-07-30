import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { bcraService } from '../services/bcra.service';
import { prisma } from '../utils/prisma';
import { calculateClientScore, calculateClientScoreFromData, getScoreCategory } from '../utils/scoring';

export const scoringController = {
  async checkBcra(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { dni } = req.query;
      if (!dni) throw new Error('DNI requerido');
      const result = await bcraService.checkBcra(dni as string);
      res.json(result);
    } catch (err) { next(err); }
  },

  async simulate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const factors = req.body;
      const score = calculateClientScore(factors);
      const category = getScoreCategory(score);
      res.json({ score, category });
    } catch (err) { next(err); }
  },

  async recalculate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const clientId = parseInt(req.params.clientId);
      const client = await prisma.findUnique('client', {
        where: { id: clientId },
        include: { loans: true, guarantees: true },
      });
      if (!client) throw new Error('Cliente no encontrado');
      const payments = await prisma.findMany('payment', {});
      const score = calculateClientScoreFromData({ ...client, payments });
      await prisma.update('client', { where: { id: clientId }, data: { score } });
      const category = getScoreCategory(score);
      res.json({ score, category });
    } catch (err) { next(err); }
  },

  async getDetails(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const clientId = parseInt(req.params.clientId);
      const client = await prisma.findUnique('client', { where: { id: clientId } });
      if (!client) throw new Error('Cliente no encontrado');
      const category = getScoreCategory(client.score || 0);
      res.json({ score: client.score || 0, category });
    } catch (err) { next(err); }
  },
};
