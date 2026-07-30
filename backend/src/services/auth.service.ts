import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { supabase } from '../utils/supabase';
import { env } from '../config/env';

export const authService = {
  async login(nameOrEmail: string, password: string) {
    const user = await prisma.findFirst('user', {
      where: { name: nameOrEmail },
    }) || await prisma.findFirst('user', {
      where: { email: nameOrEmail },
    });
    if (!user) throw new Error('Credenciales inválidas');
    const valid = await bcrypt.compare(password, user.password as string);
    if (!valid) throw new Error('Credenciales inválidas');
    if (!user.active) throw new Error('Usuario desactivado');
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as any
    );
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  },

  async investorLogin(dni: string, password: string) {
    const { data: client } = await supabase
      .from('clients')
      .select('id')
      .eq('dni', dni)
      .single();
    if (!client) throw new Error('Cliente no encontrado');
    const { data: investors } = await supabase
      .from('investors')
      .select('*')
      .eq('client_id', client.id);
    if (!investors || investors.length === 0) throw new Error('No hay inversores para este cliente');
    const investor = investors.find((i: any) => i.password);
    if (!investor) throw new Error('Credenciales inválidas');
    const valid = await bcrypt.compare(password, investor.password as string);
    if (!valid) throw new Error('Credenciales inválidas');
    if (!investor.active) throw new Error('Inversor desactivado');
    const token = jwt.sign(
      { userId: investor.id, role: 'INVESTOR' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as any
    );
    return { token, investor: { id: investor.id, name: investor.name, currency: investor.currency } };
  },

  async clientLogin(dni: string, password: string) {
    const client = await prisma.findFirst('client', { where: { dni } });
    if (!client) throw new Error('Cliente no encontrado');
    if (!client.password) throw new Error('Credenciales inválidas');
    const valid = await bcrypt.compare(password, client.password as string);
    if (!valid) throw new Error('Credenciales inválidas');
    if (!client.active) throw new Error('Cliente desactivado');
    const loans = await prisma.findMany('loan', { where: { clientId: client.id, status: 'ACTIVE' } });
    if (loans.length === 0) throw new Error('No tienes préstamos activos');
    const token = jwt.sign(
      { userId: client.id, role: 'CLIENT' },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as any
    );
    return { token, client: { id: client.id, firstName: client.firstName, lastName: client.lastName, dni: client.dni } };
  },

  async seedAdmin() {
    const existing = await prisma.findFirst('user', { where: { name: 'Marcelo' } });
    if (existing) return;
    const hashed = await bcrypt.hash('Milo@7590', 10);
    await prisma.create('user', {
      data: {
        name: 'Marcelo',
        email: 'marcelo@tufinanciera.com',
        password: hashed,
        role: 'ADMIN',
      },
    });
  },

  getProfile(userId: number, role: string) {
    if (role === 'INVESTOR') {
      return supabase.from('investors').select('*').eq('id', userId).single();
    }
    if (role === 'CLIENT') {
      return prisma.findUnique('client', { where: { id: userId } });
    }
    return prisma.findUnique('user', { where: { id: userId } });
  },
};
