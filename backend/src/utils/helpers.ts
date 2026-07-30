export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateFrenchInstallment(amount: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return roundTo2(amount / months);
  const factor = Math.pow(1 + monthlyRate, months);
  const installment = amount * (monthlyRate * factor) / (factor - 1);
  return roundTo2(installment);
}

export function generateFrenchAmortization(amount: number, annualRate: number, months: number): Array<{
  installment: number;
  capital: number;
  interest: number;
  balance: number;
}> {
  const monthlyRate = annualRate / 12 / 100;
  const installment = calculateFrenchInstallment(amount, annualRate, months);
  const table: Array<{ installment: number; capital: number; interest: number; balance: number }> = [];
  let balance = amount;
  for (let i = 1; i <= months; i++) {
    const interest = roundTo2(balance * monthlyRate);
    const capital = roundTo2(installment - interest);
    balance = roundTo2(balance - capital);
    table.push({ installment: i, capital, interest, balance: Math.max(0, balance) });
  }
  return table;
}

export function calculateEndDate(startDate: Date, months: number): Date {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + months);
  return date;
}

export function roundTo2(num: number): number {
  return Math.round(num * 100) / 100;
}
