import { prisma } from '../utils/prisma';

export const cashRegisterService = {
  async getCurrent() {
    const open = await prisma.findFirst('cashRegister', {
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
    });
    if (!open) return null;
    const entries = await prisma.findMany('cashEntry', {
      where: { cashRegisterId: open.id },
      orderBy: { createdAt: 'desc' },
    });
    return { ...open, entries };
  },

  async open(data: { date: string; openAmount: number; notes?: string; userId: number }) {
    return prisma.create('cashRegister', {
      data: {
        date: new Date(data.date).toISOString(),
        openAmount: data.openAmount,
        userId: data.userId,
        notes: data.notes,
        status: 'OPEN',
        totalIn: 0,
        totalOut: 0,
        balance: data.openAmount,
      },
    });
  },

  async close(id: number, closeAmount: number, notes?: string) {
    const register = await prisma.findUnique('cashRegister', { where: { id } });
    if (!register) throw new Error('Caja no encontrada');
    if (register.status === 'CLOSED') throw new Error('Caja ya cerrada');
    return prisma.update('cashRegister', {
      where: { id },
      data: { closeAmount, status: 'CLOSED', notes },
    });
  },

  async addEntry(data: { cashRegisterId: number; type: string; category: string; description: string; amount: number; referenceId?: number; referenceType?: string }) {
    const entry = await prisma.create('cashEntry', { data });
    const register = await prisma.findUnique('cashRegister', { where: { id: data.cashRegisterId } });
    if (register) {
      const totalIn = register.totalIn + (data.type === 'INCOME' ? data.amount : 0);
      const totalOut = register.totalOut + (data.type === 'EXPENSE' ? data.amount : 0);
      const balance = register.openAmount + totalIn - totalOut;
      await prisma.update('cashRegister', {
        where: { id: data.cashRegisterId },
        data: { totalIn, totalOut, balance },
      });
    }
    return entry;
  },

  async listHistory() {
    return prisma.findMany('cashRegister', {
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },
};
