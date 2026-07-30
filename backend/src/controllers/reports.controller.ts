import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { supabase } from '../utils/supabase';
import { pdfService } from '../services/pdf.service';
import { investorsService } from '../services/investors.service';

export const reportsController = {
  async clients(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const clients = await prisma.findMany('client', { orderBy: { createdAt: 'desc' } });
      const doc = pdfService.generateClientReport(clients);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=clientes.pdf');
      doc.pipe(res);
      doc.end();
    } catch (err) { next(err); }
  },

  async activeLoans(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const loans = await prisma.findMany('loan', { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } });
      const doc = pdfService.generateLoanReport(loans);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=prestamos-activos.pdf');
      doc.pipe(res);
      doc.end();
    } catch (err) { next(err); }
  },

  async overdueLoans(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const loans = await prisma.findMany('loan', { where: { status: 'OVERDUE' }, orderBy: { createdAt: 'desc' } });
      const doc = pdfService.generateLoanReport(loans);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=prestamos-vencidos.pdf');
      doc.pipe(res);
      doc.end();
    } catch (err) { next(err); }
  },

  async payments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payments = await prisma.findMany('payment', { orderBy: { paidAt: 'desc' }, take: 100 });
      const doc = pdfService.generatePaymentReport(payments);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=pagos.pdf');
      doc.pipe(res);
      doc.end();
    } catch (err) { next(err); }
  },

  async dashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Placeholder
      const doc = pdfService.generateDashboardReport({});
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=dashboard.pdf');
      doc.pipe(res);
      doc.end();
    } catch (err) { next(err); }
  },

  async exchange(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const operations = await prisma.findMany('exchangeOperation', { orderBy: { createdAt: 'desc' } });
      const doc = pdfService.generateExchangeReport(operations);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=exchange.pdf');
      doc.pipe(res);
      doc.end();
    } catch (err) { next(err); }
  },

  async investors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const investors = await investorsService.list();
      const doc = pdfService.generateInvestorReport(investors);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=inversores.pdf');
      doc.pipe(res);
      doc.end();
    } catch (err) { next(err); }
  },

  async investorDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const investor = await investorsService.getById(id);
      const summary = await investorsService.getSummary(id);
      const doc = pdfService.generateInvestorDetailReport(investor, summary);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=inversor-${id}.pdf`);
      doc.pipe(res);
      doc.end();
    } catch (err) { next(err); }
  },

  async investorBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const investors = await investorsService.list();
      const summaries = await Promise.all(investors.map((i: any) => investorsService.getSummary(i.id).catch(() => null)));
      const doc = pdfService.generateInvestorBalanceReport(investors, summaries);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=balance-inversores.pdf');
      doc.pipe(res);
      doc.end();
    } catch (err) { next(err); }
  },

  async cashRegister(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const registers = await prisma.findMany('cashRegister', { orderBy: { createdAt: 'desc' }, take: 1 });
      const doc = pdfService.generateCashRegisterReport(registers[0] || {});
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=caja.pdf');
      doc.pipe(res);
      doc.end();
    } catch (err) { next(err); }
  },
};
