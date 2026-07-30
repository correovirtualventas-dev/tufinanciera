import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

export const prospectsController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, temperature, qualification } = req.query;
      const where: any = {};
      if (status) where.status = status;
      if (temperature) where.temperature = temperature;
      if (qualification) where.qualification = qualification;
      const prospects = await prisma.findMany('prospect', { where, orderBy: { createdAt: 'desc' } });
      res.json(prospects);
    } catch (err) { next(err); }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const prospect = await prisma.findUnique('prospect', { where: { id } });
      if (!prospect) throw new Error('Prospecto no encontrado');
      res.json(prospect);
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const prospect = await prisma.create('prospect', { data: req.body });
      res.status(201).json(prospect);
    } catch (err) { next(err); }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const prospect = await prisma.update('prospect', { where: { id }, data: req.body });
      res.json(prospect);
    } catch (err) { next(err); }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await prisma.delete('prospect', { where: { id } });
      res.json({ message: 'Prospecto eliminado' });
    } catch (err) { next(err); }
  },
};
