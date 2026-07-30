import { prisma } from '../utils/prisma';

export const exchangeService = {
  async list() {
    return prisma.findMany('exchangeOperation', {
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: { type: string; amountARS: number; amountUSD: number; rate: number; clientName?: string; notes?: string }) {
    return prisma.create('exchangeOperation', { data });
  },

  async update(id: number, data: any) {
    return prisma.update('exchangeOperation', { where: { id }, data });
  },

  async delete(id: number) {
    return prisma.delete('exchangeOperation', { where: { id } });
  },

  async getSummary() {
    const operations = await prisma.findMany('exchangeOperation', {});
    let totalBoughtARS = 0, totalBoughtUSD = 0, totalSoldARS = 0, totalSoldUSD = 0;
    for (const op of operations) {
      if (op.type === 'BUY') {
        totalBoughtARS += op.amountARS;
        totalBoughtUSD += op.amountUSD;
      } else {
        totalSoldARS += op.amountARS;
        totalSoldUSD += op.amountUSD;
      }
    }
    return { totalBoughtARS, totalBoughtUSD, totalSoldARS, totalSoldUSD };
  },
};
