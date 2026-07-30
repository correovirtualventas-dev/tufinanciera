import { prisma } from '../utils/prisma';
import { calculateFrenchInstallment, calculateEndDate, generateFrenchAmortization } from '../utils/helpers';

export const loansService = {
  async list(params: { status?: string; clientId?: number; search?: string }) {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.clientId) where.clientId = params.clientId;
    if (params.search) {
      const clients = await prisma.findMany('client', {
        where: { dni: `%${params.search}%` },
      });
      where.clientId = { in: clients.map((c: any) => c.id) };
    }
    const loans = await prisma.findMany('loan', { where, orderBy: { createdAt: 'desc' } });
    for (const loan of loans) {
      const client = await prisma.findUnique('client', { where: { id: loan.clientId } });
      (loan as any).client = client;
    }
    return loans;
  },

  async getById(id: number) {
    const loan = await prisma.findUnique('loan', { where: { id } });
    if (!loan) throw new Error('Préstamo no encontrado');
    const client = await prisma.findUnique('client', { where: { id: loan.clientId } });
    const payments = await prisma.findMany('payment', {
      where: { loanId: id },
      orderBy: { installment: 'asc' },
    });
    return { ...loan, client, payments };
  },

  async create(data: {
    clientId: number;
    amount: number;
    interestRate: number;
    installments: number;
    startDate: string;
    notes?: string;
    status?: string;
  }) {
    const installmentAmount = calculateFrenchInstallment(data.amount, data.interestRate, data.installments);
    const totalAmount = installmentAmount * data.installments;
    const endDate = calculateEndDate(new Date(data.startDate), data.installments);
    return prisma.create('loan', {
      data: {
        clientId: data.clientId,
        amount: data.amount,
        interestRate: data.interestRate,
        totalAmount,
        installments: data.installments,
        installmentAmount,
        startDate: new Date(data.startDate).toISOString(),
        endDate: endDate.toISOString(),
        status: data.status || 'ACTIVE',
        notes: data.notes,
      },
    });
  },

  async updateStatus(id: number, status: string) {
    return prisma.update('loan', { where: { id }, data: { status } });
  },

  async delete(id: number) {
    const payments = await prisma.findMany('payment', { where: { loanId: id } });
    for (const p of payments) {
      await prisma.delete('payment', { where: { id: p.id } });
    }
    return prisma.delete('loan', { where: { id } });
  },

  getAmortization(amount: number, interestRate: number, installments: number) {
    return generateFrenchAmortization(amount, interestRate, installments);
  },
};
