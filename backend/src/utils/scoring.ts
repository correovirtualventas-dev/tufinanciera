interface ScoreFactors {
  income: number;
  loanAmount: number;
  existingLoans: number;
  latePayments: number;
  timeAsClient: number;
  hasGuarantees: boolean;
  employmentStability: string;
}

export function calculateClientScore(factors: ScoreFactors): number {
  let score = 500;
  score += Math.min(factors.income / 1000 * 50, 150);
  if (factors.loanAmount > 0 && factors.income > 0) {
    const ratio = factors.loanAmount / factors.income;
    score -= ratio > 3 ? 100 : ratio > 2 ? 50 : ratio > 1 ? 20 : 0;
  }
  score -= factors.existingLoans * 20;
  score -= factors.latePayments * 50;
  score += Math.min(factors.timeAsClient * 5, 100);
  if (factors.hasGuarantees) score += 50;
  const stabilityMap: Record<string, number> = { high: 100, medium: 50, low: -50 };
  score += stabilityMap[factors.employmentStability] || 0;
  return Math.max(0, Math.min(1000, score));
}

export function calculateClientScoreFromData(clientData: {
  income?: number | null;
  notes?: string | null;
  activity?: string | null;
  loans?: Array<{ status: string }>;
  payments?: Array<any>;
  guarantees?: Array<any>;
}): number {
  const activeLoans = (clientData.loans || []).filter(l => l.status === 'ACTIVE').length;
  const latePayments = (clientData.payments || []).filter((p: any) => {
    if (!p.paidAt) return false;
    return new Date(p.paidAt) > new Date();
  }).length;
  return calculateClientScore({
    income: clientData.income || 0,
    loanAmount: 0,
    existingLoans: activeLoans,
    latePayments,
    timeAsClient: 0,
    hasGuarantees: (clientData.guarantees || []).length > 0,
    employmentStability: clientData.activity ? 'medium' : 'low',
  });
}

export function getScoreCategory(score: number): { label: string; color: string } {
  if (score >= 800) return { label: 'Excelente', color: 'green' };
  if (score >= 600) return { label: 'Bueno', color: 'blue' };
  if (score >= 400) return { label: 'Regular', color: 'yellow' };
  return { label: 'Riesgoso', color: 'red' };
}
