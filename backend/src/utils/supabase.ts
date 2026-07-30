import { createClient } from '@supabase/supabase-js';

function getEnv(key: string): string {
  return process.env[key] || process.env[`VITE_${key}`] || '';
}

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseKey);
