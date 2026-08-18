export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  cuit?: string;
  phone?: string;
  email?: string;
  address?: string;
  localidad?: string;
  activity?: string;
  income?: number;
  score?: number;
  notes?: string;
  avalName?: string;
  referidoPor?: string;
  password?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  loans?: Loan[];
  documents?: ClientDocument[];
  guarantees?: ClientGuarantee[];
  relationships?: ClientRelationship[];
}

export interface ClientDocument {
  id: number;
  clientId: number;
  type: string;
  name: string;
  url: string;
}

export interface ClientGuarantee {
  id: number;
  clientId: number;
  type: string;
  detail?: string;
  value?: number;
}

export interface ClientRelationship {
  id: number;
  clientId: number;
  name: string;
  relation: string;
  phone?: string;
}

export interface Loan {
  id: number;
  clientId: number;
  amount: number;
  interestRate: number;
  totalAmount: number;
  installments: number;
  installmentAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  payments?: Payment[];
}

export interface Payment {
  id: number;
  loanId: number;
  installment: number;
  amount: number;
  paidAt: string;
  notes?: string;
  client?: Client;
  loan?: Loan;
}

export interface DashboardMetrics {
  totalClients: number;
  totalLoans: number;
  activeLoans: number;
  canceledLoans: number;
  overdueLoans: number;
  totalCapital: number;
  totalCollected: number;
  projectedProfit: number;
  pendingToCollect: number;
  initialCapital: number;
  totalInvestors: number;
  totalInvestorDeposits: number;
  totalInvestorDepositsUsd: number;
  totalInterestCollected: number;
  totalInterestPending: number;
  exchange: { totalBoughtARS: number; totalBoughtUSD: number; totalSoldARS: number; totalSoldUSD: number };
  prospects: Record<string, number>;
  monthlyBreakdown: Array<{ month: string; gross: number; net: number; pending: number; count: number }>;
}

export interface OverdueLoan extends Loan {
  client: Client;
}

export interface AlertasResponse {
  overdue: any[];
  upcoming: any[];
  pendingCollection: any[];
}

export interface SettingsData {
  [key: string]: string;
}

export interface CreateClientInput {
  firstName: string;
  lastName: string;
  dni: string;
  cuit?: string;
  phone?: string;
  email?: string;
  address?: string;
  localidad?: string;
  activity?: string;
  income?: number;
  notes?: string;
  avalName?: string;
  referidoPor?: string;
}

export interface CreateLoanInput {
  clientId: number;
  amount: number;
  interestRate: number;
  installments: number;
  startDate: string;
  notes?: string;
}

export interface RegisterPaymentInput {
  loanId: number;
  installment: number;
  amount: number;
  paidAt?: string;
  notes?: string;
}

export interface Investor {
  id: number;
  clientId?: number;
  name: string;
  tna: number;
  currency: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvestorSummary {
  investor: Investor;
  capitalBase: number;
  totalAccrued: number;
  totalPaid: number;
  availableBalance: number;
  dailyAccrual: number;
  movements: InvestorMovement[];
  accruals: InvestorAccrual[];
  payouts: InvestorPayout[];
}

export interface InvestorMovement {
  id: number;
  investorId: number;
  movementType: string;
  amount: number;
  date: string;
  notes?: string;
}

export interface InvestorAccrual {
  id: number;
  investorId: number;
  date: string;
  capitalBase: number;
  tna: number;
  amount: number;
}

export interface InvestorPayout {
  id: number;
  investorId: number;
  amount: number;
  date: string;
  notes?: string;
}

export interface ScoringResult {
  score: number;
  category: { label: string; color: string };
}

export interface BcraEntidad {
  entidad: string;
  situacion: string;
  monto: number;
  diasAtraso: number;
  refinanciaciones: boolean;
}

export interface BcraResult {
  dni: string;
  cuit: string;
  denominacion: string;
  situacion: string;
  riesgo: string;
  score: number;
  totalDeuda: number;
  entidades: BcraEntidad[];
  recomendacion: string;
  source: string;
}

export interface Prospect {
  id: number;
  firstName: string;
  lastName: string;
  dni?: string;
  phone?: string;
  email?: string;
  address?: string;
  localidad?: string;
  activity?: string;
  income?: number;
  amount?: number;
  installments?: number;
  notes?: string;
  temperature?: string;
  qualification?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeOperation {
  id: number;
  type: string;
  amountARS: number;
  amountUSD: number;
  rate: number;
  clientName?: string;
  notes?: string;
  createdAt: string;
}
