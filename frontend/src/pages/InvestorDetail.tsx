import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInvestorSummary, createMovement, deleteMovement, recalculateAccruals, deleteAccrual, createPayout, deletePayout } from '../api/investors';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../lib/format';
import { Plus, Trash2, RefreshCw } from 'lucide-react';

export default function InvestorDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState('movements');
  const [movementForm, setMovementForm] = useState({ movementType: 'DEPOSIT', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' });
  const [payoutForm, setPayoutForm] = useState({ amount: 0, date: new Date().toISOString().split('T')[0], notes: '' });
  const [accrualRange, setAccrualRange] = useState({ startDate: '', endDate: '' });

  const queryClient = useQueryClient();
  const { data: summary, isLoading } = useQuery({
    queryKey: ['investor-summary', id],
    queryFn: () => getInvestorSummary(Number(id)),
  });

  const movementMutation = useMutation({
    mutationFn: (data: any) => createMovement({ ...data, investorId: Number(id) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['investor-summary', id] }); toast.success('Movimiento registrado'); setMovementForm({ movementType: 'DEPOSIT', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' }); },
  });

  const deleteMovementMutation = useMutation({
    mutationFn: (movId: number) => deleteMovement(movId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['investor-summary', id] }); toast.success('Movimiento eliminado'); },
  });

  const recalculateMutation = useMutation({
    mutationFn: () => recalculateAccruals(Number(id), accrualRange.startDate, accrualRange.endDate),
    onSuccess: (data) => { queryClient.invalidateQueries({ queryKey: ['investor-summary', id] }); toast.success(`${data.created} acreditaciones creadas`); },
  });

  const deleteAccrualMutation = useMutation({
    mutationFn: (accId: number) => deleteAccrual(accId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['investor-summary', id] }); toast.success('Acreditación eliminada'); },
  });

  const payoutMutation = useMutation({
    mutationFn: (data: any) => createPayout({ ...data, investorId: Number(id) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['investor-summary', id] }); toast.success('Pago registrado'); setPayoutForm({ amount: 0, date: new Date().toISOString().split('T')[0], notes: '' }); },
  });

  const deletePayoutMutation = useMutation({
    mutationFn: (payId: number) => deletePayout(payId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['investor-summary', id] }); toast.success('Pago eliminado'); },
  });

  if (isLoading) return <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500 mx-auto mt-20" />;
  if (!summary) return <div className="text-white/60 mt-20 text-center">Inversor no encontrado</div>;

  const { investor, capitalBase, totalAccrued, totalPaid, availableBalance, dailyAccrual, movements, accruals, payouts } = summary;

  const tabs = [
    { key: 'movements', label: 'Movimientos' },
    { key: 'accruals', label: 'Acreditaciones' },
    { key: 'payouts', label: 'Pagos' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{investor.name}</h1>
      <p className="text-white/60">TNA: {investor.tna}% | Moneda: {investor.currency}</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-surface-100 rounded-xl p-4 border border-white/5">
          <p className="text-white/60 text-sm">Capital Base</p>
          <p className="text-xl font-bold text-white">{formatCurrency(capitalBase)}</p>
        </div>
        <div className="bg-surface-100 rounded-xl p-4 border border-white/5">
          <p className="text-white/60 text-sm">Acreditado</p>
          <p className="text-xl font-bold text-secondary-500">{formatCurrency(totalAccrued)}</p>
        </div>
        <div className="bg-surface-100 rounded-xl p-4 border border-white/5">
          <p className="text-white/60 text-sm">Pagado</p>
          <p className="text-xl font-bold text-red-500">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-surface-100 rounded-xl p-4 border border-white/5">
          <p className="text-white/60 text-sm">Disponible</p>
          <p className="text-xl font-bold text-tertiary-500">{formatCurrency(availableBalance)}</p>
        </div>
        <div className="bg-surface-100 rounded-xl p-4 border border-white/5">
          <p className="text-white/60 text-sm">Diario</p>
          <p className="text-xl font-bold text-amber">{formatCurrency(dailyAccrual)}</p>
        </div>
      </div>

      <div className="flex gap-1 bg-surface-100 rounded-xl p-1 border border-white/10">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${tab === t.key ? 'bg-primary-500 text-white' : 'text-white/60 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'movements' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-100 rounded-xl p-6 border border-white/5">
            <h3 className="text-white font-semibold mb-4">Nuevo Movimiento</h3>
            <form onSubmit={e => { e.preventDefault(); movementMutation.mutate(movementForm); }} className="space-y-4">
              <div className="flex gap-3">
                <button type="button" onClick={() => setMovementForm({ ...movementForm, movementType: 'DEPOSIT' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold ${movementForm.movementType === 'DEPOSIT' ? 'bg-secondary-500 text-black' : 'bg-surface-400 text-white/60'}`}>Depósito</button>
                <button type="button" onClick={() => setMovementForm({ ...movementForm, movementType: 'CAPITAL_WITHDRAWAL' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold ${movementForm.movementType === 'CAPITAL_WITHDRAWAL' ? 'bg-red-500 text-white' : 'bg-surface-400 text-white/60'}`}>Retiro</button>
              </div>
              <input type="number" step="0.01" value={movementForm.amount} onChange={e => setMovementForm({ ...movementForm, amount: Number(e.target.value) })} placeholder="Monto" required className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              <input type="date" value={movementForm.date} onChange={e => setMovementForm({ ...movementForm, date: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              <input value={movementForm.notes} onChange={e => setMovementForm({ ...movementForm, notes: e.target.value })} placeholder="Notas" className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              <button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg">Registrar Movimiento</button>
            </form>
          </div>
          <div className="bg-surface-100 rounded-xl border border-white/5 overflow-hidden max-h-96">
            <div className="p-4 border-b border-white/10"><h3 className="text-white font-semibold">Historial</h3></div>
            <table className="w-full">
              <thead><tr className="text-white/60 text-sm"><th className="text-left py-2 px-4">Tipo</th><th className="text-right py-2 px-4">Monto</th><th className="text-right py-2 px-4">Fecha</th><th className="text-right py-2 px-4">Acción</th></tr></thead>
              <tbody>
                {(movements || []).map((m: any) => (
                  <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-4"><span className={`px-2 py-1 rounded-full text-xs ${m.movementType === 'DEPOSIT' ? 'bg-secondary-500/10 text-secondary-500' : 'bg-red-500/10 text-red-500'}`}>{m.movementType === 'DEPOSIT' ? 'Depósito' : 'Retiro'}</span></td>
                    <td className="py-2 px-4 text-right text-white">{formatCurrency(m.amount)}</td>
                    <td className="py-2 px-4 text-right text-white/60">{formatDate(m.date)}</td>
                    <td className="py-2 px-4 text-right"><button onClick={() => deleteMovementMutation.mutate(m.id)} className="text-white/60 hover:text-red-500"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'accruals' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-100 rounded-xl p-6 border border-white/5">
            <h3 className="text-white font-semibold mb-4">Recalcular Acreditaciones</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-white/60 mb-1">Desde</label><input type="date" value={accrualRange.startDate} onChange={e => setAccrualRange({ ...accrualRange, startDate: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" /></div>
                <div><label className="block text-sm text-white/60 mb-1">Hasta</label><input type="date" value={accrualRange.endDate} onChange={e => setAccrualRange({ ...accrualRange, endDate: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" /></div>
              </div>
              <button onClick={() => recalculateMutation.mutate()} className="w-full bg-tertiary-500 hover:bg-tertiary-600 text-white py-2 rounded-lg flex items-center justify-center gap-2">
                <RefreshCw size={18} /> Recalcular
              </button>
            </div>
          </div>
          <div className="bg-surface-100 rounded-xl border border-white/5 overflow-hidden max-h-96">
            <div className="p-4 border-b border-white/10"><h3 className="text-white font-semibold">Acreditaciones</h3></div>
            <table className="w-full">
              <thead><tr className="text-white/60 text-sm"><th className="text-left py-2 px-4">Fecha</th><th className="text-right py-2 px-4">Base</th><th className="text-right py-2 px-4">TNA</th><th className="text-right py-2 px-4">Monto</th><th className="text-right py-2 px-4">Acción</th></tr></thead>
              <tbody>
                {(accruals || []).map((a: any) => (
                  <tr key={a.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-4 text-white/80">{a.date}</td>
                    <td className="py-2 px-4 text-right text-white">{formatCurrency(a.capitalBase)}</td>
                    <td className="py-2 px-4 text-right text-white/80">{a.tna}%</td>
                    <td className="py-2 px-4 text-right text-secondary-500">{formatCurrency(a.amount)}</td>
                    <td className="py-2 px-4 text-right"><button onClick={() => deleteAccrualMutation.mutate(a.id)} className="text-white/60 hover:text-red-500"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'payouts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-100 rounded-xl p-6 border border-white/5">
            <h3 className="text-white font-semibold mb-4">Nuevo Pago</h3>
            <p className="text-white/60 text-sm mb-4">Disponible: {formatCurrency(availableBalance)}</p>
            <form onSubmit={e => { e.preventDefault(); payoutMutation.mutate(payoutForm); }} className="space-y-4">
              <input type="number" step="0.01" value={payoutForm.amount} onChange={e => setPayoutForm({ ...payoutForm, amount: Number(e.target.value) })} placeholder="Monto" required max={availableBalance} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              <input type="date" value={payoutForm.date} onChange={e => setPayoutForm({ ...payoutForm, date: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              <input value={payoutForm.notes} onChange={e => setPayoutForm({ ...payoutForm, notes: e.target.value })} placeholder="Notas" className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              <button type="submit" className="w-full bg-secondary-500 hover:bg-secondary-600 text-black py-2 rounded-lg font-semibold">Registrar Pago</button>
            </form>
          </div>
          <div className="bg-surface-100 rounded-xl border border-white/5 overflow-hidden max-h-96">
            <div className="p-4 border-b border-white/10"><h3 className="text-white font-semibold">Pagos Realizados</h3></div>
            <table className="w-full">
              <thead><tr className="text-white/60 text-sm"><th className="text-right py-2 px-4">Monto</th><th className="text-right py-2 px-4">Fecha</th><th className="text-right py-2 px-4">Acción</th></tr></thead>
              <tbody>
                {(payouts || []).map((p: any) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-4 text-right text-white">{formatCurrency(p.amount)}</td>
                    <td className="py-2 px-4 text-right text-white/60">{formatDate(p.date)}</td>
                    <td className="py-2 px-4 text-right"><button onClick={() => deletePayoutMutation.mutate(p.id)} className="text-white/60 hover:text-red-500"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
