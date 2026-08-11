import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getLoans } from '../api/loans';
import { registerPayment, getRecentPayments } from '../api/payments';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../lib/format';
import { DollarSign, Search, Handshake, AlertTriangle, Receipt } from 'lucide-react';

export default function Cobros() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState({ loanId: '', installment: 1, amount: 0, paidAt: new Date().toISOString().split('T')[0], notes: '' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('loan') ? 'ALL' : 'ACTIVE');
  const queryClient = useQueryClient();

  const { data: loans } = useQuery({ queryKey: ['loans-all'], queryFn: () => getLoans({}) });
  const { data: recentPayments } = useQuery({ queryKey: ['recent-payments'], queryFn: () => getRecentPayments(10) });

  const mutation = useMutation({
    mutationFn: registerPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-payments'] });
      queryClient.invalidateQueries({ queryKey: ['loans-all'] });
      toast.success('Pago registrado');
      setForm({ loanId: '', installment: 1, amount: 0, paidAt: new Date().toISOString().split('T')[0], notes: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Ha ocurrido un error'),
  });

  const activeCount = (loans || []).filter((l: any) => l.status === 'ACTIVE').length;
  const overdueCount = (loans || []).filter((l: any) => l.status === 'OVERDUE').length;
  const recentTotal = (recentPayments || []).reduce((acc: number, p: any) => acc + Number(p.amount), 0);

  const statusLabel: Record<string, string> = {
    ACTIVE: 'Activo',
    OVERDUE: 'Vencido',
    CANCELED: 'Cancelado',
    CANCELLED: 'Cancelado',
    PAID: 'Pagado',
    REJECTED: 'Rechazado',
    PENDING: 'Pendiente',
  };

  const filteredLoans = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (loans || []).filter((l: any) => {
      if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
      if (!q) return true;
      const name = `${l.client?.firstName || ''} ${l.client?.lastName || ''}`.toLowerCase();
      return name.includes(q) || String(l.client?.dni || '').includes(q) || String(l.id).includes(q);
    });
  }, [loans, search, statusFilter]);

  const selectedLoan = (loans || []).find((l: any) => l.id === Number(form.loanId));

  const handleLoanSelect = (loanId: string) => {
    const loan = (loans || []).find((l: any) => l.id === Number(loanId));
    setForm({
      loanId,
      installment: 1,
      amount: loan?.installmentAmount || 0,
      paidAt: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  useEffect(() => {
    const loanId = searchParams.get('loan');
    if (loanId && (loans || []).some((l: any) => l.id === Number(loanId))) {
      handleLoanSelect(loanId);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, loans]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ ...form, loanId: Number(form.loanId) });
  };

  const summaryCards = [
    { label: 'Préstamos Activos', value: activeCount, icon: Handshake, color: 'text-secondary-500' },
    { label: 'Préstamos Vencidos', value: overdueCount, icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Pagos Recientes', value: (recentPayments || []).length, icon: Receipt, color: 'text-primary-500' },
    { label: 'Monto Reciente', value: formatCurrency(recentTotal), icon: DollarSign, color: 'text-tertiary-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Cobros</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(c => (
          <div key={c.label} className="bg-surface-100 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
            <c.icon size={20} className={c.color} />
            <div>
              <p className="text-sm text-slate-500">{c.label}</p>
              <p className="text-xl font-bold text-slate-900">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Registrar Pago</h2>
          <form onSubmit={handleSubmit} className="bg-surface-100 rounded-xl p-6 border border-slate-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por cliente o DNI..."
                  className="w-full bg-surface-400 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900"
                />
              </div>
              <div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900">
                  <option value="ACTIVE">Activos</option>
                  <option value="OVERDUE">Vencidos</option>
                  <option value="ALL">Todos</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-1">Préstamo</label>
              <select value={form.loanId} onChange={e => handleLoanSelect(e.target.value)} required
                className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
                <option value="">Seleccionar préstamo</option>
                {filteredLoans.map((l: any) => (
                  <option key={l.id} value={l.id}>#{l.id} - {l.client?.firstName} {l.client?.lastName} - {formatCurrency(l.installmentAmount)}/mes{l.status === 'OVERDUE' ? ' (VENCIDO)' : ''}</option>
                ))}
              </select>
            </div>
            {selectedLoan && (
              <div className="bg-surface-400 rounded-lg p-3 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500">Cliente: <span className="text-slate-900">{selectedLoan.client?.firstName} {selectedLoan.client?.lastName}</span></p>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${selectedLoan.status === 'OVERDUE' ? 'bg-red-500/10 text-red-500' : 'bg-secondary-500/10 text-secondary-500'}`}>
                    {statusLabel[selectedLoan.status] || selectedLoan.status}
                  </span>
                </div>
                <p className="text-slate-500">Cuota: <span className="text-slate-900">{formatCurrency(selectedLoan.installmentAmount)}</span></p>
                <p className="text-slate-500">Total: <span className="text-slate-900">{formatCurrency(selectedLoan.totalAmount)}</span></p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1">N° Cuota</label>
                <input type="number" min="1" value={form.installment} onChange={e => setForm({ ...form, installment: Number(e.target.value) })} required className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Monto</label>
                <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} required className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-1">Fecha de Pago</label>
              <input type="date" value={form.paidAt} onChange={e => setForm({ ...form, paidAt: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-1">Notas</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
            </div>
            <button type="submit" className="w-full bg-secondary-500 hover:bg-secondary-600 text-black font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
              <DollarSign size={18} /> Registrar Pago
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Pagos Recientes</h2>
          <div className="bg-surface-100 rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-sm">
                  <th className="text-left py-3 px-4">Cliente</th>
                  <th className="text-right py-3 px-4">Cuota</th>
                  <th className="text-right py-3 px-4">Monto</th>
                  <th className="text-right py-3 px-4">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {(recentPayments || []).map((p: any) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-100">
                    <td className="py-3 px-4 text-slate-900">{p.client?.firstName} {p.client?.lastName}</td>
                    <td className="py-3 px-4 text-right text-slate-900">#{p.installment}</td>
                    <td className="py-3 px-4 text-right text-secondary-500">{formatCurrency(p.amount)}</td>
                    <td className="py-3 px-4 text-right text-slate-500">{formatDate(p.paidAt)}</td>
                  </tr>
                ))}
                {!recentPayments?.length && (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-400">Sin pagos registrados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
