import express from 'express';

let app: express.Application;

try {
  const mod = require('../src/app');
  app = mod.default || mod;
  console.log('[API] Express app loaded successfully');
} catch (e: any) {
  console.error('[API] Failed to load Express app:', e?.message, e?.stack);
  app = express();
  app.all('*', (_req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: e?.message,
      stack: e?.stack?.split('\n').slice(0, 3).join('; '),
    });
  });
}

export const config = { maxDuration: 30 };
export default app;
