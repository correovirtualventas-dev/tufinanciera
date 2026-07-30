import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { clientsService } from '../services/clients.service';

export const clientsController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, active } = req.query;
      const clients = await clientsService.list({
        search: search as string,
        active: active !== undefined ? active === 'true' : undefined,
      });
      res.json(clients);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const client = await clientsService.getById(id);
      res.json(client);
    } catch (err) {
      next(err);
    }
  },

  async getLoans(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const loans = await clientsService.getLoans(id);
      res.json(loans);
    } catch (err) {
      next(err);
    }
  },

  async setPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { password } = req.body;
      const result = await clientsService.setPassword(id, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const client = await clientsService.create(req.body);
      res.status(201).json(client);
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const client = await clientsService.update(id, req.body);
      res.json(client);
    } catch (err) {
      next(err);
    }
  },

  async toggleActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const client = await clientsService.toggleActive(id);
      res.json(client);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await clientsService.delete(id);
      res.json({ message: 'Cliente eliminado' });
    } catch (err) {
      next(err);
    }
  },

  async addDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const clientId = parseInt(req.params.id);
      const doc = await clientsService.addDocument(clientId, req.body);
      res.status(201).json(doc);
    } catch (err) {
      next(err);
    }
  },

  async deleteDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.docId);
      await clientsService.deleteDocument(id);
      res.json({ message: 'Documento eliminado' });
    } catch (err) {
      next(err);
    }
  },

  async addGuarantee(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const clientId = parseInt(req.params.id);
      const guarantee = await clientsService.addGuarantee(clientId, req.body);
      res.status(201).json(guarantee);
    } catch (err) {
      next(err);
    }
  },

  async deleteGuarantee(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.guaranteeId);
      await clientsService.deleteGuarantee(id);
      res.json({ message: 'Garantía eliminada' });
    } catch (err) {
      next(err);
    }
  },

  async addRelationship(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const clientId = parseInt(req.params.id);
      const rel = await clientsService.addRelationship(clientId, req.body);
      res.status(201).json(rel);
    } catch (err) {
      next(err);
    }
  },

  async deleteRelationship(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.relId);
      await clientsService.deleteRelationship(id);
      res.json({ message: 'Relación eliminada' });
    } catch (err) {
      next(err);
    }
  },
};
