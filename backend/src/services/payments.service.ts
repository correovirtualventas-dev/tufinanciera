import { prisma } from '../utils/prisma';

export const paymentsService = {
  async register(data: { loanId: number; installment: number; amount: number; paidAt?: string; notes?: string }) {
    return prisma.create('payment', {
      data: {
        loanId: data.loanId,
        installment: data.installment,
        amount: data.amount,
        paidAt: data.paidAt ? new Date(data.paidAt).toISOString() : new Date().toISOString(),
        notes: data.notes,
      },
    });
  },

  async getByLoan(loanId: number) {
    return prisma.findMany('payment', {
      where: { loanId },
      orderBy: { installment: 'asc' },
    });
  },

  async getRecent(limit: number = 10) {
    const payments = await prisma.findMany('payment', {
      orderBy: { paidAt: 'desc' },
      take: limit,
    });
    for (const payment of payments) {
      const loan = await prisma.findUnique('loan', { where: { id: payment.loanId } });
      if (loan) {
        const client = await prisma.findUnique('client', { where: { id: loan.clientId } });
        (payment as any).client = client;
        (payment as any).loan = loan;
      }
    }
    return payments;
  },
};
