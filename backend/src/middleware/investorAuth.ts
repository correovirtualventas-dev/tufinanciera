import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export function requireNotInvestor(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role === 'INVESTOR') {
    return res.status(403).json({ error: 'Acción no permitida para inversores' });
  }
  next();
}

export function requireInvestorListBlock(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role === 'INVESTOR') {
    return res.status(403).json({ error: 'Los inversores no pueden ver la lista completa' });
  }
  next();
}

export function requireOwnInvestorAccess(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role === 'INVESTOR') {
    const investorId = parseInt(req.params.id);
    if (req.user.userId !== investorId) {
      return res.status(403).json({ error: 'Solo puedes acceder a tu propio perfil de inversor' });
    }
  }
  next();
}

export function requireOwnClientAccess(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role === 'CLIENT') {
    const clientId = parseInt(req.params.id);
    if (req.user.userId !== clientId) {
      return res.status(403).json({ error: 'Solo puedes acceder a tu propio perfil' });
    }
  }
  next();
}
