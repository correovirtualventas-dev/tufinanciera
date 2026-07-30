export function getCapitalBase(movements: Array<{ movementType: string; amount: number }>): number {
  let total = 0;
  for (const m of movements) {
    if (m.movementType === 'DEPOSIT') total += m.amount;
    else if (m.movementType === 'CAPITAL_WITHDRAWAL') total -= m.amount;
  }
  return Math.max(0, total);
}

export function calculateDailyAccrual(capitalBase: number, tna: number): number {
  return Math.round((capitalBase * (tna / 100) / 365) * 100) / 100;
}

export function processAccruals(
  investorId: number,
  capitalBase: number,
  tna: number,
  startDate: Date,
  endDate: Date,
  existingAccruals: Array<{ date: string; amount: number }>
): Array<{ investorId: number; date: string; capitalBase: number; tna: number; amount: number }> {
  const existingDates = new Set(existingAccruals.map(a => a.date));
  const accruals: Array<{ investorId: number; date: string; capitalBase: number; tna: number; amount: number }> = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    if (!existingDates.has(dateStr)) {
      const dailyAmount = calculateDailyAccrual(capitalBase, tna);
      accruals.push({
        investorId,
        date: dateStr,
        capitalBase,
        tna,
        amount: dailyAmount,
      });
    }
    current.setDate(current.getDate() + 1);
  }
  return accruals;
}
