import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[ERROR]', err?.message || err, err?.stack?.slice(0, 200));
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  const msg = typeof err === 'string' ? err : (err?.message || 'Error interno del servidor');
  return res.status(500).json({ error: msg });
}
