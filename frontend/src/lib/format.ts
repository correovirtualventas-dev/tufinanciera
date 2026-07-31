export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-AR', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('es-AR');
}

export function loanStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'Activo',
    OVERDUE: 'Vencido',
    CANCELED: 'Cancelado',
    CANCELLED: 'Cancelado',
    PENDING: 'Pendiente',
    PAID: 'Pagado',
  };
  return map[status] || status;
}

export function prospectStatusLabel(status: string): string {
  const map: Record<string, string> = {
    NEW: 'Nuevo',
    CONTACTED: 'Contactado',
    QUALIFIED: 'Calificado',
    CONVERTED: 'Convertido',
    LOST: 'Perdido',
  };
  return map[status] || status;
}

export function prospectTemperatureLabel(temp: string): string {
  const map: Record<string, string> = {
    HOT: 'Caliente',
    WARM: 'Tibio',
    COLD: 'Frío',
  };
  return map[temp] || temp;
}

export function calculateFrenchInstallment(amount: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return Math.round((amount / months) * 100) / 100;
  const factor = Math.pow(1 + monthlyRate, months);
  const installment = amount * (monthlyRate * factor) / (factor - 1);
  return Math.round(installment * 100) / 100;
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
    const interest = Math.round(balance * monthlyRate * 100) / 100;
    const capital = Math.round((installment - interest) * 100) / 100;
    balance = Math.round((balance - capital) * 100) / 100;
    table.push({ installment: i, capital, interest, balance: Math.max(0, balance) });
  }
  return table;
}
