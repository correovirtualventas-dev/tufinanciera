import { prisma } from '../utils/prisma';

const CASA_LABELS: Record<string, string> = {
  oficial: 'Oficial',
  blue: 'Blue',
  bolsa: 'Bolsa',
  contadoconliqui: 'Contado con Liqui',
  mayorista: 'Mayorista',
  cripto: 'Cripto',
  tarjeta: 'Tarjeta',
};

export const exchangeService = {
  async getDolarRates() {
    try {
      const response = await fetch('https://dolarapi.com/v1/dolares', {
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error(`DolarAPI status ${response.status}`);
      const data: any = await response.json();
      if (!Array.isArray(data)) throw new Error('Respuesta inválida');
      return data.map((d: any) => ({
        casa: d.casa,
        nombre: CASA_LABELS[d.casa] || d.nombre || d.casa,
        compra: d.compra,
        venta: d.venta,
        fechaActualizacion: d.fechaActualizacion,
      }));
    } catch {
      return [];
    }
  },

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
