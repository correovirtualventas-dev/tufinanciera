import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

export const alertsController = {
  async getOverdue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const overdueLoans = await prisma.findMany('loan', { where: { status: 'OVERDUE' } });
      const result = [];
      for (const loan of overdueLoans) {
        const client = await prisma.findUnique('client', { where: { id: loan.clientId } });
        const payments = await prisma.findMany('payment', { where: { loanId: loan.id } });
        result.push({ ...loan, client, payments });
      }
      res.json(result);
    } catch (err) { next(err); }
  },

  async getUpcoming(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const activeLoans = await prisma.findMany('loan', { where: { status: 'ACTIVE' } });
      const now = new Date();
      const result = [];
      for (const loan of activeLoans) {
        const client = await prisma.findUnique('client', { where: { id: loan.clientId } });
        const payments = await prisma.findMany('payment', { where: { loanId: loan.id } });
        const paidInstallments = new Set(payments.map((p: any) => p.installment));
        for (let i = 1; i <= loan.installments; i++) {
          if (!paidInstallments.has(i)) {
            const dueDate = new Date(loan.startDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 7) {
              result.push({ loanId: loan.id, client, installment: i, amount: loan.installmentAmount, dueDate, diffDays });
            }
          }
        }
      }
      res.json(result);
    } catch (err) { next(err); }
  },

  async getPendingCollection(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const activeLoans = await prisma.findMany('loan', { where: { status: { in: ['ACTIVE', 'OVERDUE'] } } });
      const result = [];
      for (const loan of activeLoans) {
        const client = await prisma.findUnique('client', { where: { id: loan.clientId } });
        const payments = await prisma.findMany('payment', { where: { loanId: loan.id } });
        const paidAmount = payments.reduce((s: number, p: any) => s + p.amount, 0);
        const pending = Math.max(0, loan.totalAmount - paidAmount);
        if (pending > 0) {
          result.push({ ...loan, client, paidAmount, pending });
        }
      }
      res.json(result);
    } catch (err) { next(err); }
  },
};
