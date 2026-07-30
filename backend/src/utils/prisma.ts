import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const TABLE_MAP: Record<string, string> = {
  user: 'users',
  client: 'clients',
  loan: 'loans',
  payment: 'payments',
  document: 'client_documents',
  guarantee: 'client_guarantees',
  relationship: 'client_relationships',
  cashRegister: 'cash_registers',
  cashEntry: 'cash_entries',
  expense: 'expenses',
  expenseCategory: 'expense_categories',
  notification: 'notifications',
  settings: 'settings',
  exchangeOperation: 'exchange_operations',
  prospect: 'prospects',
};

function toSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function convertKeysToSnake(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    result[toSnake(key)] = obj[key];
  }
  return result;
}

function convertKeysToCamel(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}

function resolveTable(model: string): string {
  return TABLE_MAP[model] || `${model}s`;
}

function buildSelect(fields?: string[]): string {
  return fields ? fields.join(', ') : '*';
}

function buildOrderBy(orderBy?: Record<string, 'asc' | 'desc'>): string | undefined {
  if (!orderBy) return undefined;
  const entries = Object.entries(orderBy);
  if (entries.length === 0) return undefined;
  const [key, dir] = entries[0];
  return `${toSnake(key)}.${dir}`;
}

const TABLES_WITHOUT_TIMESTAMPS = new Set([
  'payments', 'cash_entries', 'expenses', 'notifications', 'expense_categories', 'settings'
]);

function addTimestamps(data: Record<string, any>, model: string): Record<string, any> {
  const table = resolveTable(model);
  if (TABLES_WITHOUT_TIMESTAMPS.has(table)) return data;
  const now = new Date().toISOString();
  return { ...data, created_at: now, updated_at: now };
}

function addUpdateTimestamp(data: Record<string, any>, model: string): Record<string, any> {
  const table = resolveTable(model);
  if (TABLES_WITHOUT_TIMESTAMPS.has(table)) return data;
  return { ...data, updated_at: new Date().toISOString() };
}

interface FindManyParams {
  where?: Record<string, unknown>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  take?: number;
  skip?: number;
  select?: string[];
}

interface IncludeParams {
  [key: string]: boolean | { select?: Record<string, boolean> };
}

async function resolveIncludes(model: string, rows: any[], include?: IncludeParams): Promise<any[]> {
  if (!include || rows.length === 0) return rows;
  for (const [rel, config] of Object.entries(include)) {
    if (!config) continue;
    const relTable = resolveTable(rel);
    const fkMap: Record<string, string> = {
      client: 'client_id',
      loan: 'loan_id',
      user: 'user_id',
      category: 'category_id',
      entries: 'cash_register_id',
      payments: 'loan_id',
      documents: 'client_id',
      guarantees: 'client_id',
      relationships: 'client_id',
      loans: 'client_id',
    };
    const fk = fkMap[rel] || `${rel}_id`;
    const ids = rows.map(r => r.id).filter(Boolean);
    if (ids.length === 0) continue;
    const { data: relRows } = await supabase
      .from(relTable)
      .select('*')
      .in(fk, ids);
    if (relRows) {
      const relMap: Record<number, any[]> = {};
      for (const rr of relRows) {
        const parentId = rr[fk];
        if (!relMap[parentId]) relMap[parentId] = [];
        relMap[parentId].push(convertKeysToCamel(rr));
      }
      for (const row of rows) {
        (row as any)[rel] = relMap[row.id] || (Array.isArray(rows) ? [] : null);
      }
    }
  }
  return rows;
}

export const prisma = {
  async findMany(model: string, params: FindManyParams = {}) {
    const table = resolveTable(model);
    let query = supabase.from(table).select(buildSelect(params.select));
    if (params.where) {
      const snakeWhere = convertKeysToSnake(params.where);
      for (const [key, value] of Object.entries(snakeWhere)) {
        if (typeof value === 'string' && value.includes('%')) {
          query = query.ilike(key, value);
        } else if (value !== undefined) {
          query = query.eq(key, value);
        }
      }
    }
    const order = buildOrderBy(params.orderBy);
    if (order) query = query.order(order.split('.')[0], { ascending: order.split('.')[1] === 'asc' });
    if (params.take) query = query.limit(params.take);
    if (params.skip) query = query.range(params.skip, params.skip + (params.take || 10) - 1);
    const { data, error } = await query;
    if (error) throw error;
    const camelData = (data || []).map((r: any) => convertKeysToCamel(r));
    return camelData;
  },

  async findUnique(model: string, params: { where: Record<string, unknown>; include?: IncludeParams }) {
    const table = resolveTable(model);
    const snakeWhere = convertKeysToSnake(params.where);
    let query = supabase.from(table).select('*');
    for (const [key, value] of Object.entries(snakeWhere)) {
      if (value !== undefined) query = query.eq(key, value);
    }
    const { data, error } = await query.single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    const result = data ? convertKeysToCamel(data) : null;
    if (result && params.include) {
      const resolved = await resolveIncludes(model, [result], params.include);
      return resolved[0] || null;
    }
    return result;
  },

  async findFirst(model: string, params: { where: Record<string, unknown>; orderBy?: Record<string, 'asc' | 'desc'> }) {
    const table = resolveTable(model);
    let query = supabase.from(table).select('*');
    const snakeWhere = convertKeysToSnake(params.where);
    for (const [key, value] of Object.entries(snakeWhere)) {
      if (value !== undefined) query = query.eq(key, value);
    }
    const order = buildOrderBy(params.orderBy);
    if (order) query = query.order(order.split('.')[0], { ascending: order.split('.')[1] === 'asc' });
    query = query.limit(1);
    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return null;
    return convertKeysToCamel(data[0]);
  },

  async create(model: string, params: { data: Record<string, unknown>; select?: string[] }) {
    const table = resolveTable(model);
    const snakeData = convertKeysToSnake(params.data);
    const dataWithTimestamps = addTimestamps(snakeData, model);
    const { data, error } = await supabase.from(table).insert(dataWithTimestamps).select(buildSelect(params.select)).single();
    if (error) throw error;
    return data ? convertKeysToCamel(data) : null;
  },

  async update(model: string, params: { where: Record<string, unknown>; data: Record<string, unknown> }) {
    const table = resolveTable(model);
    const snakeWhere = convertKeysToSnake(params.where);
    const snakeData = convertKeysToSnake(params.data);
    const dataWithTimestamp = addUpdateTimestamp(snakeData, model);
    let query: any = supabase.from(table).update(dataWithTimestamp);
    for (const [key, value] of Object.entries(snakeWhere)) {
      if (value !== undefined) query = query.eq(key, value);
    }
    query = query.select().single();
    const { data, error } = await query;
    if (error) throw error;
    return data ? convertKeysToCamel(data) : null;
  },

  async delete(model: string, params: { where: Record<string, unknown> }) {
    const table = resolveTable(model);
    const snakeWhere = convertKeysToSnake(params.where);
    let query: any = supabase.from(table).delete();
    for (const [key, value] of Object.entries(snakeWhere)) {
      if (value !== undefined) query = query.eq(key, value);
    }
    query = query.select().single();
    const { data, error } = await query;
    if (error) throw error;
    return data ? convertKeysToCamel(data) : null;
  },

  async deleteMany(model: string, params: { where: Record<string, unknown> }) {
    const table = resolveTable(model);
    const snakeWhere = convertKeysToSnake(params.where);
    let query = supabase.from(table).delete();
    for (const [key, value] of Object.entries(snakeWhere)) {
      if (value !== undefined) query = query.eq(key, value);
    }
    const { error } = await query;
    if (error) throw error;
    return { count: 0 };
  },

  async count(model: string, params: { where?: Record<string, unknown> } = {}) {
    const table = resolveTable(model);
    let query = supabase.from(table).select('*', { count: 'exact', head: true });
    if (params.where) {
      const snakeWhere = convertKeysToSnake(params.where);
      for (const [key, value] of Object.entries(snakeWhere)) {
        if (value !== undefined) query = query.eq(key, value);
      }
    }
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },

  async aggregate(model: string, params: { where?: Record<string, unknown>; _sum?: string[] }) {
    const table = resolveTable(model);
    let query = supabase.from(table).select('*');
    if (params.where) {
      const snakeWhere = convertKeysToSnake(params.where);
      for (const [key, value] of Object.entries(snakeWhere)) {
        if (value !== undefined) query = query.eq(key, value);
      }
    }
    const { data, error } = await query;
    if (error) throw error;
    const result: Record<string, number> = {};
    if (params._sum) {
      for (const field of params._sum) {
        const snakeField = toSnake(field);
        result[field] = (data || []).reduce((sum: number, row: any) => sum + (Number(row[snakeField]) || 0), 0);
      }
    }
    return result;
  },

  async groupBy(model: string, params: { by: string[]; _sum?: string[]; where?: Record<string, unknown> }) {
    const table = resolveTable(model);
    let query = supabase.from(table).select('*');
    if (params.where) {
      const snakeWhere = convertKeysToSnake(params.where);
      for (const [key, value] of Object.entries(snakeWhere)) {
        if (value !== undefined) query = query.eq(key, value);
      }
    }
    const { data, error } = await query;
    if (error) throw error;
    const grouped: Record<string, any> = {};
    for (const row of data || []) {
      const key = params.by.map(b => row[toSnake(b)]).join('|');
      if (!grouped[key]) {
        grouped[key] = { _group: {} };
        for (const b of params.by) {
          grouped[key]._group[b] = row[toSnake(b)];
        }
        if (params._sum) {
          for (const s of params._sum) {
            grouped[key][s] = 0;
          }
        }
      }
      if (params._sum) {
        for (const s of params._sum) {
          grouped[key][s] += Number(row[toSnake(s)]) || 0;
        }
      }
    }
    return Object.values(grouped);
  },

  async upsert(model: string, params: { where: Record<string, unknown>; create: Record<string, unknown>; update: Record<string, unknown> }) {
    const existing = await prisma.findFirst(model, { where: params.where });
    if (existing) {
      return prisma.update(model, { where: params.where, data: params.update });
    }
    return prisma.create(model, { data: { ...params.create, ...params.where } });
  },

  async findManyRaw(model: string, options: { select?: string; where?: string; order?: string; limit?: number; offset?: number } = {}) {
    const table = resolveTable(model);
    let query = supabase.from(table).select(options.select || '*');
    if (options.where) {
      const parsed = JSON.parse(options.where);
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === 'string' && value.includes('%')) {
          query = query.ilike(key, value);
        } else if (value !== undefined) {
          query = query.eq(key, value);
        }
      }
    }
    if (options.order) query = query.order(options.order, { ascending: true });
    if (options.limit) query = query.limit(options.limit);
    if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((r: any) => convertKeysToCamel(r));
  },
};
