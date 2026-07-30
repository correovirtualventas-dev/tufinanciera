import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { paymentsService } from '../services/payments.service';
import { prisma } from '../utils/prisma';
import { pdfService } from '../services/pdf.service';

export const paymentsController = {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payment = await paymentsService.register(req.body);
      res.status(201).json(payment);
    } catch (err) {
      next(err);
    }
  },

  async getByLoan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const loanId = parseInt(req.params.loanId);
      const payments = await paymentsService.getByLoan(loanId);
      res.json(payments);
    } catch (err) {
      next(err);
    }
  },

  async getRecent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const payments = await paymentsService.getRecent(limit);
      res.json(payments);
    } catch (err) {
      next(err);
    }
  },

  async getReceiptPdf(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const loanId = parseInt(req.params.loanId);
      const installment = parseInt(req.params.installment);
      const payments = await paymentsService.getByLoan(loanId);
      const payment = payments.find((p: any) => p.installment === installment);
      if (!payment) throw new Error('Pago no encontrado');
      const loan = await prisma.findUnique('loan', { where: { id: loanId } });
      const client = await prisma.findUnique('client', { where: { id: loan!.clientId } });
      const doc = pdfService.generatePaymentReceipt(payment, loan, client);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=recibo-${loanId}-${installment}.pdf`);
      doc.pipe(res);
      doc.end();
    } catch (err) {
      next(err);
    }
  },
};
