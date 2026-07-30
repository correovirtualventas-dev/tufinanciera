import bcrypt from 'bcryptjs';
import { supabase } from '../utils/supabase';
import { getCapitalBase, calculateDailyAccrual, processAccruals } from '../utils/investorsCalc';

function convertKeys(row: any): any {
  if (!row) return row;
  const result: any = {};
  for (const key of Object.keys(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = row[key];
  }
  return result;
}

export const investorsService = {
  async list() {
    const { data, error } = await supabase.from('investors').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(convertKeys);
  },

  async getById(id: number) {
    const { data, error } = await supabase.from('investors').select('*').eq('id', id).single();
    if (error) throw error;
    return convertKeys(data);
  },

  async create(data: { clientId?: number; name: string; tna: number; currency: string; active?: boolean }) {
    const { data: result, error } = await supabase
      .from('investors')
      .insert({
        client_id: data.clientId || null,
        name: data.name,
        tna: data.tna,
        currency: data.currency || 'ARS',
        active: data.active !== undefined ? data.active : true,
      })
      .select()
      .single();
    if (error) throw error;
    return convertKeys(result);
  },

  async update(id: number, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.tna !== undefined) updateData.tna = data.tna;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.clientId !== undefined) updateData.client_id = data.clientId;
    const { data: result, error } = await supabase
      .from('investors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return convertKeys(result);
  },

  async delete(id: number) {
    await supabase.from('investor_movements').delete().eq('investor_id', id);
    await supabase.from('investor_accruals').delete().eq('investor_id', id);
    await supabase.from('investor_payouts').delete().eq('investor_id', id);
    const { error } = await supabase.from('investors').delete().eq('id', id);
    if (error) throw error;
    return { message: 'Inversor eliminado' };
  },

  async getSummary(id: number) {
    const investor = await this.getById(id);
    const { data: movements } = await supabase
      .from('investor_movements')
      .select('*')
      .eq('investor_id', id)
      .order('date', { ascending: false });
    const { data: accruals } = await supabase
      .from('investor_accruals')
      .select('*')
      .eq('investor_id', id)
      .order('date', { ascending: false });
    const { data: payouts } = await supabase
      .from('investor_payouts')
      .select('*')
      .eq('investor_id', id)
      .order('date', { ascending: false });

    const capitalBase = getCapitalBase((movements || []).map(convertKeys));
    const totalAccrued = (accruals || []).reduce((s: number, a: any) => s + Number(a.amount), 0);
    const totalPaid = (payouts || []).reduce((s: number, p: any) => s + Number(p.amount), 0);
    const dailyAccrual = calculateDailyAccrual(capitalBase, investor.tna);

    return {
      investor,
      capitalBase,
      totalAccrued: Math.round(totalAccrued * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      availableBalance: Math.round((totalAccrued - totalPaid) * 100) / 100,
      dailyAccrual,
      movements: (movements || []).map(convertKeys),
      accruals: (accruals || []).map(convertKeys),
      payouts: (payouts || []).map(convertKeys),
    };
  },

  async createMovement(data: { investorId: number; movementType: string; amount: number; date?: string; notes?: string }) {
    const { data: result, error } = await supabase
      .from('investor_movements')
      .insert({
        investor_id: data.investorId,
        movement_type: data.movementType,
        amount: data.amount,
        date: data.date || new Date().toISOString().split('T')[0],
        notes: data.notes || null,
      })
      .select()
      .single();
    if (error) throw error;
    return convertKeys(result);
  },

  async deleteMovement(id: number) {
    const { error } = await supabase.from('investor_movements').delete().eq('id', id);
    if (error) throw error;
    return { message: 'Movimiento eliminado' };
  },

  async listAccruals(investorId: number) {
    const { data, error } = await supabase
      .from('investor_accruals')
      .select('*')
      .eq('investor_id', investorId)
      .order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(convertKeys);
  },

  async recalculateAccruals(investorId: number, startDate: string, endDate: string) {
    const investor = await this.getById(investorId);
    const { data: movements } = await supabase
      .from('investor_movements')
      .select('*')
      .eq('investor_id', investorId);
    const capitalBase = getCapitalBase((movements || []).map(convertKeys));
    const { data: existing } = await supabase
      .from('investor_accruals')
      .select('date, amount')
      .eq('investor_id', investorId);
    const newAccruals = processAccruals(
      investorId,
      capitalBase,
      investor.tna,
      new Date(startDate),
      new Date(endDate),
      (existing || []).map((e: any) => ({ date: e.date, amount: Number(e.amount) }))
    );
    if (newAccruals.length > 0) {
      const { error } = await supabase.from('investor_accruals').insert(newAccruals);
      if (error) throw error;
    }
    return { created: newAccruals.length };
  },

  async deleteAccrual(id: number) {
    const { error } = await supabase.from('investor_accruals').delete().eq('id', id);
    if (error) throw error;
    return { message: 'Acreditación eliminada' };
  },

  async createPayout(data: { investorId: number; amount: number; date?: string; notes?: string }) {
    const summary = await this.getSummary(data.investorId);
    if (data.amount > summary.availableBalance) {
      throw new Error('El monto del pago excede el saldo disponible');
    }
    const { data: result, error } = await supabase
      .from('investor_payouts')
      .insert({
        investor_id: data.investorId,
        amount: data.amount,
        date: data.date || new Date().toISOString().split('T')[0],
        notes: data.notes || null,
      })
      .select()
      .single();
    if (error) throw error;
    return convertKeys(result);
  },

  async deletePayout(id: number) {
    const { error } = await supabase.from('investor_payouts').delete().eq('id', id);
    if (error) throw error;
    return { message: 'Pago eliminado' };
  },

  async setPassword(id: number, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    const { error } = await supabase
      .from('investors')
      .update({ password: hashed })
      .eq('id', id);
    if (error) throw error;
    return { message: 'Contraseña actualizada' };
  },

  async processDailyAccruals() {
    const { data: investors } = await supabase.from('investors').select('*').eq('active', true);
    let processed = 0;
    for (const inv of investors || []) {
      const { data: movements } = await supabase
        .from('investor_movements')
        .select('*')
        .eq('investor_id', inv.id);
      const capitalBase = getCapitalBase((movements || []).map(convertKeys));
      if (capitalBase <= 0) continue;
      const dateStr = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('investor_accruals')
        .select('id')
        .eq('investor_id', inv.id)
        .eq('date', dateStr);
      if (existing && existing.length > 0) continue;
      const dailyAmount = calculateDailyAccrual(capitalBase, inv.tna);
      const { error } = await supabase.from('investor_accruals').insert({
        investor_id: inv.id,
        date: dateStr,
        capital_base: capitalBase,
        tna: inv.tna,
        amount: dailyAmount,
      });
      if (!error) processed++;
    }
    return { processed };
  },
};
