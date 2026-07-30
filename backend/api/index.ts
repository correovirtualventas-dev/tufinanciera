import express from 'express';

const app = express();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/test-import', async (_req, res) => {
  try {
    const mod = await import('../src/app');
    res.json({ loaded: true, hasDefault: !!mod.default, keys: Object.keys(mod) });
  } catch (e: any) {
    res.json({ loaded: false, error: e?.message });
  }
});

app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

export const config = { maxDuration: 30 };
export default app;
