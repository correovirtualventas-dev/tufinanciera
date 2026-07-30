import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { supabase } from '../utils/supabase';

export const clientsService = {
  async list(params: { search?: string; active?: boolean }) {
    let query = supabase.from('clients').select('*');
    if (params.active !== undefined) {
      query = query.eq('active', params.active);
    }
    if (params.search) {
      query = query.or(`first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,dni.ilike.%${params.search}%`);
    }
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: r.id,
      firstName: r.first_name,
      lastName: r.last_name,
      dni: r.dni,
      cuit: r.cuit,
      phone: r.phone,
      email: r.email,
      address: r.address,
      localidad: r.localidad,
      activity: r.activity,
      income: r.income,
      score: r.score,
      notes: r.notes,
      avalName: r.aval_name,
      referidoPor: r.referido_por,
      active: r.active,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async getById(id: number) {
    const client = await prisma.findUnique('client', {
      where: { id },
      include: { loans: true, documents: true, guarantees: true, relationships: true },
    });
    if (!client) throw new Error('Cliente no encontrado');
    return client;
  },

  async getLoans(clientId: number) {
    return prisma.findMany('loan', {
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async setPassword(id: number, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    return prisma.update('client', { where: { id }, data: { password: hashed } });
  },

  async create(data: any) {
    return prisma.create('client', { data });
  },

  async update(id: number, data: any) {
    return prisma.update('client', { where: { id }, data });
  },

  async toggleActive(id: number) {
    const client = await prisma.findUnique('client', { where: { id } });
    if (!client) throw new Error('Cliente no encontrado');
    return prisma.update('client', { where: { id }, data: { active: !client.active } });
  },

  async delete(id: number) {
    return prisma.delete('client', { where: { id } });
  },

  async addDocument(clientId: number, data: any) {
    return prisma.create('document', { data: { ...data, clientId } });
  },

  async deleteDocument(id: number) {
    return prisma.delete('document', { where: { id } });
  },

  async addGuarantee(clientId: number, data: any) {
    return prisma.create('guarantee', { data: { ...data, clientId } });
  },

  async deleteGuarantee(id: number) {
    return prisma.delete('guarantee', { where: { id } });
  },

  async addRelationship(clientId: number, data: any) {
    return prisma.create('relationship', { data: { ...data, clientId } });
  },

  async deleteRelationship(id: number) {
    return prisma.delete('relationship', { where: { id } });
  },
};
