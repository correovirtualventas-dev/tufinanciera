import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLoans } from '../api/loans';
import { registerPayment, getRecentPayments } from '../api/payments';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../lib/format';
import { DollarSign } from 'lucide-react';

export default function Cobros() {
  const [form, setForm] = useState({ loanId: '', installment: 1, amount: 0, paidAt: new Date().toISOString().split('T')[0], notes: '' });
  const queryClient = useQueryClient();

  const { data: loans } = useQuery({ queryKey: ['loans-active'], queryFn: () => getLoans({ status: 'ACTIVE' }) });
  const { data: recentPayments } = useQuery({ queryKey: ['recent-payments'], queryFn: () => getRecentPayments(10) });

  const mutation = useMutation({
    mutationFn: registerPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-payments'] });
      queryClient.invalidateQueries({ queryKey: ['loans-active'] });
      toast.success('Pago registrado');
      setForm({ loanId: '', installment: 1, amount: 0, paidAt: new Date().toISOString().split('T')[0], notes: '' });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Error'),
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ ...form, loanId: Number(form.loanId) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Registrar Pago</h1>
        <form onSubmit={handleSubmit} className="bg-surface-100 rounded-xl p-6 border border-white/5 space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Préstamo</label>
            <select value={form.loanId} onChange={e => handleLoanSelect(e.target.value)} required
              className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white">
              <option value="">Seleccionar préstamo</option>
              {(loans || []).map((l: any) => (
                <option key={l.id} value={l.id}>#{l.id} - {l.client?.firstName} {l.client?.lastName} - {formatCurrency(l.installmentAmount)}/mes</option>
              ))}
            </select>
          </div>
          {selectedLoan && (
            <div className="bg-surface-400 rounded-lg p-3 text-sm">
              <p className="text-white/60">Cliente: <span className="text-white">{selectedLoan.client?.firstName} {selectedLoan.client?.lastName}</span></p>
              <p className="text-white/60">Cuota: <span className="text-white">{formatCurrency(selectedLoan.installmentAmount)}</span></p>
              <p className="text-white/60">Total: <span className="text-white">{formatCurrency(selectedLoan.totalAmount)}</span></p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">N° Cuota</label>
              <input type="number" min="1" value={form.installment} onChange={e => setForm({ ...form, installment: Number(e.target.value) })} required className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Monto</label>
              <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} required className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Fecha de Pago</label>
            <input type="date" value={form.paidAt} onChange={e => setForm({ ...form, paidAt: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Notas</label>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
          </div>
          <button type="submit" className="w-full bg-secondary-500 hover:bg-secondary-600 text-black font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
            <DollarSign size={18} /> Registrar Pago
          </button>
        </form>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Pagos Recientes</h1>
        <div className="bg-surface-100 rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-white/60 text-sm">
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-right py-3 px-4">Cuota</th>
                <th className="text-right py-3 px-4">Monto</th>
                <th className="text-right py-3 px-4">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {(recentPayments || []).map((p: any) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">{p.client?.firstName} {p.client?.lastName}</td>
                  <td className="py-3 px-4 text-right text-white">#{p.installment}</td>
                  <td className="py-3 px-4 text-right text-secondary-500">{formatCurrency(p.amount)}</td>
                  <td className="py-3 px-4 text-right text-white/60">{formatDate(p.paidAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
