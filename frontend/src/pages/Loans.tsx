import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLoans, createLoan, updateLoanStatus, deleteLoan, getAmortizationPdf } from '../api/loans';
import { getClients } from '../api/clients';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, FileText, Trash2, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/format';
import { calculateFrenchInstallment, generateFrenchAmortization, calculateEndDate } from '../lib/format';

export default function Loans() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    clientId: '', amount: 0, interestRate: 0, installments: 1, startDate: new Date().toISOString().split('T')[0], notes: '',
  });
  const [amortTable, setAmortTable] = useState<any[]>([]);

  const queryClient = useQueryClient();
  const { data: loans } = useQuery({
    queryKey: ['loans', search, status],
    queryFn: () => getLoans({ search, status: status || undefined }),
  });
  const { data: clients } = useQuery({ queryKey: ['clients-all'], queryFn: () => getClients({}) });

  const createMutation = useMutation({
    mutationFn: createLoan,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['loans'] }); setModalOpen(false); toast.success('Préstamo creado'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Error'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateLoanStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loans'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLoan,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['loans'] }); toast.success('Préstamo eliminado'); },
  });

  const updateAmort = () => {
    if (form.amount > 0 && form.interestRate > 0 && form.installments > 0) {
      setAmortTable(generateFrenchAmortization(form.amount, form.interestRate, form.installments));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, clientId: Number(form.clientId) });
  };

  const handleDownloadPdf = async (loanId: number) => {
    try {
      const blob = await getAmortizationPdf(loanId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `amortizacion-${loanId}.pdf`;
      a.click();
    } catch { toast.error('Error al descargar PDF'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Préstamos</h1>
        <button onClick={() => { setForm({ clientId: '', amount: 0, interestRate: 0, installments: 1, startDate: new Date().toISOString().split('T')[0], notes: '' }); setAmortTable([]); setModalOpen(true); }}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Nuevo Préstamo
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por DNI..." className="w-full bg-surface-100 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="bg-surface-100 border border-white/10 rounded-lg px-4 py-3 text-white">
          <option value="">Todos</option>
          <option value="ACTIVE">Activos</option>
          <option value="OVERDUE">Vencidos</option>
          <option value="CANCELED">Cancelados</option>
          <option value="PENDING">Pendientes</option>
        </select>
      </div>

      <div className="bg-surface-100 rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-white/60 text-sm">
              <th className="text-left py-3 px-4">ID</th>
              <th className="text-left py-3 px-4">Cliente</th>
              <th className="text-right py-3 px-4">Monto</th>
              <th className="text-right py-3 px-4">Cuota</th>
              <th className="text-center py-3 px-4">Cuotas</th>
              <th className="text-center py-3 px-4">Tasa</th>
              <th className="text-center py-3 px-4">Estado</th>
              <th className="text-center py-3 px-4">Inicio</th>
              <th className="text-right py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(loans || []).map((loan: any) => (
              <tr key={loan.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 px-4 text-white">#{loan.id}</td>
                <td className="py-3 px-4">
                  <Link to={`/clients/${loan.clientId}`} className="text-white hover:text-primary-500">
                    {loan.client?.firstName} {loan.client?.lastName}
                  </Link>
                </td>
                <td className="py-3 px-4 text-right text-white">{formatCurrency(loan.amount)}</td>
                <td className="py-3 px-4 text-right text-white">{formatCurrency(loan.installmentAmount)}</td>
                <td className="py-3 px-4 text-center text-white/80">{loan.installments}</td>
                <td className="py-3 px-4 text-center text-white/80">{loan.interestRate}%</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    loan.status === 'ACTIVE' ? 'bg-secondary-500/10 text-secondary-500' :
                    loan.status === 'OVERDUE' ? 'bg-red-500/10 text-red-500' :
                    'bg-tertiary-500/10 text-tertiary-500'
                  }`}>{loan.status}</span>
                </td>
                <td className="py-3 px-4 text-center text-white/60 text-sm">{formatDate(loan.startDate)}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex justify-end gap-1">
                    <Link to={`/loans/${loan.id}`} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-tertiary-500"><FileText size={16} /></Link>
                    <button onClick={() => handleDownloadPdf(loan.id)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-primary-500"><Download size={16} /></button>
                    <select value={loan.status} onChange={e => updateStatusMutation.mutate({ id: loan.id, status: e.target.value })}
                      className="bg-transparent text-white/60 text-xs border border-white/10 rounded px-2 py-1">
                      <option value="ACTIVE">Active</option>
                      <option value="OVERDUE">Overdue</option>
                      <option value="CANCELED">Canceled</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModalOpen(false)}>
          <div className="bg-surface-100 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">Nuevo Préstamo</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-white/60 mb-1">Cliente</label>
                <select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} required
                  className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white">
                  <option value="">Seleccionar cliente</option>
                  {(clients || []).filter((c: any) => c.active).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} - {c.dni}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Monto</label>
                <input type="number" value={form.amount} onChange={e => { setForm({ ...form, amount: Number(e.target.value) }); setTimeout(updateAmort, 50); }} required className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Tasa Anual (%)</label>
                <input type="number" step="0.01" value={form.interestRate} onChange={e => { setForm({ ...form, interestRate: Number(e.target.value) }); setTimeout(updateAmort, 50); }} required className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Cuotas</label>
                <input type="number" min="1" value={form.installments} onChange={e => { setForm({ ...form, installments: Number(e.target.value) }); setTimeout(updateAmort, 50); }} required className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Fecha de Inicio</label>
                <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-white/60 mb-1">Notas</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
              {amortTable.length > 0 && (
                <div className="col-span-2">
                  <p className="text-sm text-white/60 mb-2">Vista previa: Cuota {formatCurrency(calculateFrenchInstallment(form.amount, form.interestRate, form.installments))} - Total {formatCurrency(calculateFrenchInstallment(form.amount, form.interestRate, form.installments) * form.installments)}</p>
                  <div className="max-h-40 overflow-y-auto text-xs">
                    <table className="w-full">
                      <thead><tr className="text-white/60"><th className="text-left">#</th><th className="text-right">Capital</th><th className="text-right">Interés</th><th className="text-right">Saldo</th></tr></thead>
                      <tbody>
                        {amortTable.map((row: any) => (
                          <tr key={row.installment} className="text-white/80">
                            <td>{row.installment}</td><td className="text-right">{formatCurrency(row.capital)}</td>
                            <td className="text-right">{formatCurrency(row.interest)}</td><td className="text-right">{formatCurrency(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-white/60 hover:text-white">Cancelar</button>
                <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg">Crear Préstamo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
