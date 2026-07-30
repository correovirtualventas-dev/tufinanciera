import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('[SUPABASE] Missing credentials', {
    url: !!supabaseUrl,
    key: !!supabaseKey,
    keys: Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('DATABASE')),
  });
}

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : (null as any);
