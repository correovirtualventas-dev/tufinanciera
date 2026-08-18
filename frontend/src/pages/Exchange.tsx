import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getExchangeOperations, createExchangeOperation, deleteExchangeOperation, getExchangeSummary, getDolarRates } from '../api/exchange';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../lib/format';
import { Plus, Trash2, TrendingUp, RefreshCw } from 'lucide-react';

export default function Exchange() {
  const [form, setForm] = useState({ type: 'BUY', amountARS: 0, amountUSD: 0, rate: 0, clientName: '', notes: '' });
  const queryClient = useQueryClient();

  const { data: operations } = useQuery({ queryKey: ['exchange'], queryFn: getExchangeOperations });
  const { data: summary } = useQuery({ queryKey: ['exchange-summary'], queryFn: getExchangeSummary });
  const { data: dolarRates, refetch: refetchRates, isFetching: ratesLoading } = useQuery({ queryKey: ['dolar-rates'], queryFn: getDolarRates, refetchInterval: 5 * 60 * 1000 });

  useEffect(() => {
    if (dolarRates && dolarRates.length > 0 && !form.rate) {
      const blue = dolarRates.find((r: any) => r.casa === 'blue');
      setForm((f) => ({ ...f, rate: blue?.venta || dolarRates[0].venta }));
    }
  }, [dolarRates]);

  const createMutation = useMutation({
    mutationFn: createExchangeOperation,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['exchange'] }); queryClient.invalidateQueries({ queryKey: ['exchange-summary'] }); toast.success('Operación creada'); setForm(f => ({ type: 'BUY', amountARS: 0, amountUSD: 0, rate: f.rate, clientName: '', notes: '' })); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExchangeOperation,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['exchange'] }); queryClient.invalidateQueries({ queryKey: ['exchange-summary'] }); toast.success('Operación eliminada'); },
  });

  const updateAmounts = (type: string, field: string, value: number) => {
    if (field === 'amountARS') {
      const rate = form.rate || 1;
      setForm({ ...form, type: type as any, amountARS: value, amountUSD: Math.round(value / rate * 100) / 100 });
    } else {
      const rate = form.rate || 1;
      setForm({ ...form, type: type as any, amountUSD: value, amountARS: Math.round(value * rate * 100) / 100 });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Cambio de Divisas</h1>

      <div className="bg-surface-100 rounded-xl p-4 border border-slate-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-slate-900 font-semibold">Cotización en vivo</h3>
          <button onClick={() => refetchRates()} disabled={ratesLoading}
            className="text-slate-500 hover:text-primary-500 flex items-center gap-1 text-sm">
            <RefreshCw size={14} className={ratesLoading ? 'animate-spin' : ''} /> Actualizar
          </button>
        </div>
        {dolarRates && dolarRates.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dolarRates.map((r: any) => (
              <div key={r.casa} className="bg-surface-400 rounded-lg p-3 cursor-pointer hover:ring-1 hover:ring-primary-500 transition-all"
                onClick={() => setForm({ ...form, rate: r.venta })}>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-slate-500">{r.nombre}</p>
                  {form.rate === r.venta && <span className="text-[10px] bg-primary-500/10 text-primary-500 px-1.5 py-0.5 rounded">usando</span>}
                </div>
                <p className="text-slate-900 font-bold">${r.venta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-slate-500">Compra ${r.compra.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No se pudo obtener la cotización. Verificá la conexión.</p>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-100 rounded-xl p-4 border border-slate-100">
            <p className="text-slate-500 text-sm">Compra ARS</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(summary.totalBoughtARS)}</p>
          </div>
          <div className="bg-surface-100 rounded-xl p-4 border border-slate-100">
            <p className="text-slate-500 text-sm">Compra USD</p>
            <p className="text-xl font-bold text-tertiary-500">${summary.totalBoughtUSD.toFixed(2)}</p>
          </div>
          <div className="bg-surface-100 rounded-xl p-4 border border-slate-100">
            <p className="text-slate-500 text-sm">Venta ARS</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(summary.totalSoldARS)}</p>
          </div>
          <div className="bg-surface-100 rounded-xl p-4 border border-slate-100">
            <p className="text-slate-500 text-sm">Venta USD</p>
            <p className="text-xl font-bold text-secondary-500">${summary.totalSoldUSD.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
          <h3 className="text-slate-900 font-semibold mb-4">Nueva Operación</h3>
          <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
            <div className="flex gap-3">
              <button type="button" onClick={() => setForm({ ...form, type: 'BUY' })}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${form.type === 'BUY' ? 'bg-secondary-500 text-black' : 'bg-surface-400 text-slate-500'}`}>Compra USD</button>
              <button type="button" onClick={() => setForm({ ...form, type: 'SELL' })}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${form.type === 'SELL' ? 'bg-tertiary-500 text-white' : 'bg-surface-400 text-slate-500'}`}>Venta USD</button>
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-1">Tipo de Cambio</label>
              <input type="number" step="0.01" value={form.rate} onChange={e => setForm({ ...form, rate: Number(e.target.value) })}
                className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-1">Monto ARS</label>
              <input type="number" value={form.amountARS} onChange={e => updateAmounts(form.type, 'amountARS', Number(e.target.value))}
                className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-1">Monto USD</label>
              <input type="number" step="0.01" value={form.amountUSD} onChange={e => updateAmounts(form.type, 'amountUSD', Number(e.target.value))}
                className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-1">Cliente</label>
              <input value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })}
                className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-1">Notas</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
            </div>
            <button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg flex items-center justify-center gap-2">
              <TrendingUp size={18} /> Crear Operación
            </button>
          </form>
        </div>

        <div className="bg-surface-100 rounded-xl border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-slate-900 font-semibold">Historial</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="text-slate-500 text-sm">
                  <th className="text-left py-3 px-4">Tipo</th>
                  <th className="text-right py-3 px-4">ARS</th>
                  <th className="text-right py-3 px-4">USD</th>
                  <th className="text-right py-3 px-4">Cambio</th>
                  <th className="text-right py-3 px-4">Acción</th>
                </tr>
              </thead>
              <tbody>
                {(operations || []).map((op: any) => (
                  <tr key={op.id} className="border-b border-slate-100 hover:bg-slate-100">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${op.type === 'BUY' ? 'bg-secondary-500/10 text-secondary-500' : 'bg-tertiary-500/10 text-tertiary-500'}`}>
                        {op.type === 'BUY' ? 'Compra' : 'Venta'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-900">{formatCurrency(op.amountARS)}</td>
                    <td className="py-3 px-4 text-right text-slate-900">${op.amountUSD.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-slate-700">${op.rate.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => deleteMutation.mutate(op.id)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
