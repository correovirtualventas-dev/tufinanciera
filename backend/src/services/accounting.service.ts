import { prisma } from '../utils/prisma';

export const accountingService = {
  async getSummary() {
    const [allLoans, allPayments, expenses, settings] = await Promise.all([
      prisma.findMany('loan', {}),
      prisma.findMany('payment', {}),
      prisma.findMany('expense', {}),
      prisma.findMany('settings', {}),
    ]);

    const totalCapital = allLoans.reduce((s: number, l: any) => s + (l.amount || 0), 0);
    const totalCollected = allPayments.reduce((s: number, p: any) => s + (p.amount || 0), 0);
    const totalExpenses = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);

    let pendingToCollect = 0;
    const activeLoans = allLoans.filter((l: any) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
    for (const loan of activeLoans) {
      const paid = allPayments
        .filter((p: any) => p.loanId === loan.id)
        .reduce((s: number, p: any) => s + (p.amount || 0), 0);
      pendingToCollect += Math.max(0, loan.totalAmount - paid);
    }

    const settingsMap: any = {};
    for (const s of settings) settingsMap[s.key] = s.value;

    return {
      initialCapital: parseFloat(settingsMap.initialCapital || '0'),
      totalCapital,
      totalCollected,
      pendingToCollect,
      totalExpenses,
      balance: totalCollected - totalExpenses,
    };
  },

  async getMovements(params: { startDate?: string; endDate?: string; type?: string }) {
    const movements: any[] = [];
    const payments = await prisma.findMany('payment', {
      orderBy: { paidAt: 'desc' },
    });
    for (const p of payments) {
      const loan = await prisma.findUnique('loan', { where: { id: p.loanId } });
      movements.push({
        date: p.paidAt,
        type: 'PAYMENT',
        description: `Pago cuota ${p.installment} - Préstamo #${p.loanId}`,
        amount: p.amount,
        clientName: loan ? `Cliente #${loan.clientId}` : '',
      });
    }
    const expenses = await prisma.findMany('expense', { orderBy: { date: 'desc' } });
    for (const e of expenses) {
      movements.push({
        date: e.date,
        type: 'EXPENSE',
        description: e.description,
        amount: -e.amount,
        clientName: '',
      });
    }
    movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return movements;
  },

  async createExpense(data: { categoryId: number; description: string; amount: number; date: string; notes?: string }) {
    return prisma.create('expense', {
      data: {
        categoryId: data.categoryId,
        description: data.description,
        amount: data.amount,
        date: new Date(data.date).toISOString(),
        notes: data.notes,
      },
    });
  },

  async getCategories() {
    return prisma.findMany('expenseCategory', { orderBy: { name: 'asc' } });
  },

  async createCategory(name: string) {
    return prisma.create('expenseCategory', { data: { name } });
  },

  async deleteCategory(id: number) {
    return prisma.delete('expenseCategory', { where: { id } });
  },
};
