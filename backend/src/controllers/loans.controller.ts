import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { loansService } from '../services/loans.service';
import { prisma } from '../utils/prisma';
import { pdfService } from '../services/pdf.service';

export const loansController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, clientId, search } = req.query;
      const loans = await loansService.list({
        status: status as string,
        clientId: clientId ? parseInt(clientId as string) : undefined,
        search: search as string,
      });
      res.json(loans);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const loan = await loansService.getById(id);
      res.json(loan);
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const loan = await loansService.create(req.body);
      res.status(201).json(loan);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const loan = await loansService.updateStatus(id, status);
      res.json(loan);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await loansService.delete(id);
      res.json({ message: 'Préstamo eliminado' });
    } catch (err) {
      next(err);
    }
  },

  async getAmortization(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const loan = await loansService.getById(id);
      const amortization = loansService.getAmortization(loan.amount, loan.interestRate, loan.installments);
      res.json(amortization);
    } catch (err) {
      next(err);
    }
  },

  async getAmortizationPdf(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const loan = await loansService.getById(id);
      const amortization = loansService.getAmortization(loan.amount, loan.interestRate, loan.installments);
      const doc = pdfService.generateAmortizationTable(loan, amortization, loan.client);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=amortizacion-${id}.pdf`);
      doc.pipe(res);
      doc.end();
    } catch (err) {
      next(err);
    }
  },
};
