export const config = { maxDuration: 30 };

function createHandler() {
  try {
    const mod = require('../src/app');
    return mod.default || mod;
  } catch (e: any) {
    console.error('[API] Init error:', e?.message);
    return (req: any, res: any) => {
      res.status(500).json({
        error: 'Server init failed',
        message: e?.message,
        stack: e?.stack?.split('\n').slice(0, 3).join(' | '),
      });
    };
  }
}

export default createHandler();
