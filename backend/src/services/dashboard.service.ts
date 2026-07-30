import { prisma } from '../utils/prisma';
import { supabase } from '../utils/supabase';
import { generateFrenchAmortization, roundTo2 } from '../utils/helpers';

export const dashboardService = {
  async getAdminMetrics() {
    const [totalClients, allLoans, activeLoans, canceledLoans, overdueLoans, prospects, settingsArr] = await Promise.all([
      prisma.count('client', { where: { active: true } }),
      prisma.findMany('loan', {}),
      prisma.findMany('loan', { where: { status: 'ACTIVE' } }),
      prisma.findMany('loan', { where: { status: 'CANCELED' } }),
      prisma.findMany('loan', { where: { status: 'OVERDUE' } }),
      prisma.findMany('prospect', {}),
      prisma.findMany('settings', {}),
    ]);

    const allPayments = await prisma.findMany('payment', {});

    const totalCapital = allLoans.reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
    const totalCollected = allPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    let pendingToCollect = 0;
    for (const loan of activeLoans) {
      const paid = allPayments
        .filter((p: any) => p.loanId === loan.id)
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      pendingToCollect += Math.max(0, loan.totalAmount - paid);
    }

    const projectedProfit = allLoans.reduce((sum: number, l: any) => sum + (l.totalAmount - l.amount || 0), 0);

    const settings: any = {};
    for (const s of settingsArr) {
      settings[s.key] = s.value;
    }

    const { data: investorsData } = await supabase.from('investors').select('*');
    const investorGroups = new Set();
    let standaloneInvestors = 0;
    for (const inv of investorsData || []) {
      if (inv.client_id) investorGroups.add(inv.client_id);
      else standaloneInvestors++;
    }
    const totalInvestors = investorGroups.size + standaloneInvestors;

    const { data: exchangeData } = await supabase.from('exchange_operations').select('*');
    const exchangeTotals = {
      totalBoughtARS: 0,
      totalSoldARS: 0,
      totalBoughtUSD: 0,
      totalSoldUSD: 0,
    };
    for (const op of exchangeData || []) {
      if (op.type === 'BUY') {
        exchangeTotals.totalBoughtARS += Number(op.amount_ars) || 0;
        exchangeTotals.totalBoughtUSD += Number(op.amount_usd) || 0;
      } else {
        exchangeTotals.totalSoldARS += Number(op.amount_ars) || 0;
        exchangeTotals.totalSoldUSD += Number(op.amount_usd) || 0;
      }
    }

    const monthlyBreakdown = getMonthlyBreakdown(allLoans, allPayments);

    const { data: accrualsData } = await supabase.from('investor_accruals').select('amount');
    const totalInterestCollected = allPayments.reduce((sum: number, p: any) => {
      const loan = allLoans.find((l: any) => l.id === p.loanId);
      if (!loan) return sum;
      const amortTable = generateFrenchAmortization(loan.amount, loan.interestRate, loan.installments);
      const row = amortTable.find((a: any) => a.installment === p.installment);
      return sum + (row?.interest || 0);
    }, 0);

    let totalInterestPending = 0;
    for (const loan of activeLoans) {
      const paidInstallments = allPayments
        .filter((p: any) => p.loanId === loan.id)
        .map((p: any) => p.installment);
      const amortTable = generateFrenchAmortization(loan.amount, loan.interestRate, loan.installments);
      for (const row of amortTable) {
        if (!paidInstallments.includes(row.installment)) {
          totalInterestPending += row.interest;
        }
      }
    }

    const prospectCounts: any = {};
    for (const p of prospects) {
      prospectCounts[p.status] = (prospectCounts[p.status] || 0) + 1;
    }

    return {
      totalClients,
      totalLoans: allLoans.length,
      activeLoans: activeLoans.length,
      canceledLoans: canceledLoans.length,
      overdueLoans: overdueLoans.length,
      totalCapital,
      totalCollected,
      projectedProfit,
      pendingToCollect,
      initialCapital: parseFloat(settings.initialCapital || '0'),
      totalInvestors,
      totalInvestorDeposits: 0,
      totalInvestorDepositsUsd: 0,
      totalInterestCollected: roundTo2(totalInterestCollected),
      totalInterestPending: roundTo2(totalInterestPending),
      exchange: exchangeTotals,
      prospects: prospectCounts,
      monthlyBreakdown,
    };
  },

  async getOverdueLoans() {
    const overdue = await prisma.findMany('loan', { where: { status: 'OVERDUE' } });
    for (const loan of overdue) {
      const client = await prisma.findUnique('client', { where: { id: loan.clientId } });
      (loan as any).client = client;
    }
    return overdue;
  },
};

function getMonthlyBreakdown(loans: any[], payments: any[]) {
  const months: Record<string, { gross: number; net: number; pending: number; count: number }> = {};
  for (const loan of loans) {
    const date = new Date(loan.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = { gross: 0, net: 0, pending: 0, count: 0 };
    months[key].gross += loan.totalAmount || 0;
    months[key].net += loan.amount || 0;
    months[key].count++;
  }
  for (const payment of payments) {
    const date = new Date(payment.paidAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = { gross: 0, net: 0, pending: 0, count: 0 };
    months[key].pending += payment.amount || 0;
  }
  return Object.entries(months).map(([month, data]) => ({ month, ...data }));
}
