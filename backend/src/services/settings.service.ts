import { prisma } from '../utils/prisma';

export const settingsService = {
  async getAll() {
    const settings = await prisma.findMany('settings', {});
    const result: any = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  },

  async get(key: string) {
    const s = await prisma.findFirst('settings', { where: { key } });
    return s?.value || null;
  },

  async set(key: string, value: string) {
    return prisma.upsert('settings', {
      where: { key },
      create: { key, value },
      update: { value },
    });
  },
};
