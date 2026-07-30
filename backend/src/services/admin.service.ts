import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { supabase } from '../utils/supabase';

export const adminService = {
  async listUsers() {
    return prisma.findMany('user', { orderBy: { createdAt: 'desc' } });
  },

  async createUser(data: { name: string; email: string; password: string; role: string }) {
    const hashed = await bcrypt.hash(data.password, 10);
    return prisma.create('user', {
      data: { name: data.name, email: data.email, password: hashed, role: data.role || 'ADMIN' },
    });
  },

  async updateUser(id: number, data: any) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    if (data.active !== undefined) updateData.active = data.active;
    return prisma.update('user', { where: { id }, data: updateData });
  },

  async deleteUser(id: number) {
    return prisma.delete('user', { where: { id } });
  },

  async getSettings() {
    const settings = await prisma.findMany('settings', {});
    const result: any = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  },

  async updateSetting(key: string, value: string) {
    return prisma.upsert('settings', {
      where: { key },
      create: { key, value },
      update: { value },
    });
  },

  async backupData() {
    const [clients, loans, payments, users, settings] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('loans').select('*'),
      supabase.from('payments').select('*'),
      supabase.from('users').select('*'),
      supabase.from('settings').select('*'),
    ]);
    return { clients: clients.data, loans: loans.data, payments: payments.data, users: users.data, settings: settings.data };
  },

  async restoreData(data: any) {
    if (data.clients) {
      for (const client of data.clients) {
        await supabase.from('clients').upsert(client);
      }
    }
    if (data.loans) {
      for (const loan of data.loans) {
        await supabase.from('loans').upsert(loan);
      }
    }
    return { message: 'Datos restaurados exitosamente' };
  },
};
