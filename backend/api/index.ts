import express from 'express';

const app = express();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

app.get('/api/env-test', (_req, res) => {
  res.json({
    supabaseUrl: !!(process.env.SUPABASE_URL),
    supabaseKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY),
    supabaseAnon: !!(process.env.SUPABASE_ANON_KEY),
    supabaseUrlLen: (process.env.SUPABASE_URL || '').length,
    supabaseKeyLen: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').length,
    nodeEnv: process.env.NODE_ENV,
    allKeys: Object.keys(process.env).sort().filter(k => !k.includes('SECRET') && !k.includes('TOKEN') && !k.includes('KEY') && !k.includes('PASSWORD')).slice(0, 20),
  });
});

app.get('/api/test-import', async (_req, res) => {
  try {
    const mod = await import('../src/app');
    res.json({ loaded: true, hasDefault: !!mod.default, keys: Object.keys(mod) });
  } catch (e: any) {
    res.json({ loaded: false, error: e?.message, stack: String(e?.stack).slice(0, 500) });
  }
});

app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

export const config = { maxDuration: 30 };
export default app;
