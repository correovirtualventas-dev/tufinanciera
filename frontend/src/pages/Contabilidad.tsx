import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAccountingSummary, getAccountingMovements, createExpense, getExpenseCategories, createExpenseCategory, deleteExpenseCategory } from '../api/contabilidad';
import { formatCurrency, formatDate } from '../lib/format';
import toast from 'react-hot-toast';
import { Plus, Trash2, Wallet, DollarSign, TrendingUp, Receipt } from 'lucide-react';

export default function Contabilidad() {
  const [tab, setTab] = useState('resumen');
  const [expenseForm, setExpenseForm] = useState({ categoryId: '', description: '', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' });
  const [categoryName, setCategoryName] = useState('');

  const queryClient = useQueryClient();
  const { data: summary } = useQuery({ queryKey: ['accounting-summary'], queryFn: getAccountingSummary });
  const { data: movements } = useQuery({ queryKey: ['accounting-movements'], queryFn: () => getAccountingMovements({}) });
  const { data: categories } = useQuery({ queryKey: ['expense-categories'], queryFn: getExpenseCategories });

  const expenseMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['accounting-summary'] }); toast.success('Gasto registrado'); setExpenseForm({ categoryId: '', description: '', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' }); },
  });

  const categoryMutation = useMutation({
    mutationFn: (name: string) => createExpenseCategory(name),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['expense-categories'] }); setCategoryName(''); toast.success('CategorÃ­a creada'); },
  });

  const deleteCatMutation = useMutation({
    mutationFn: deleteExpenseCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expense-categories'] }),
  });

  const tabs = [
    { key: 'resumen', label: 'Resumen' },
    { key: 'movimientos', label: 'Movimientos' },
    { key: 'gastos', label: 'Gastos' },
    { key: 'categorias', label: 'CategorÃ­as' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Contabilidad</h1>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-100 rounded-xl p-4 border border-slate-100">
            <p className="text-slate-500 text-sm">Capital Inicial</p>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(summary.initialCapital)}</p>
          </div>
          <div className="bg-surface-100 rounded-xl p-4 border border-slate-100">
            <p className="text-slate-500 text-sm">Total Prestado</p>
            <p className="text-xl font-bold text-tertiary-500">{formatCurrency(summary.totalCapital)}</p>
          </div>
          <div className="bg-surface-100 rounded-xl p-4 border border-slate-100">
            <p className="text-slate-500 text-sm">Total Cobrado</p>
            <p className="text-xl font-bold text-secondary-500">{formatCurrency(summary.totalCollected)}</p>
          </div>
          <div className="bg-surface-100 rounded-xl p-4 border border-slate-100">
            <p className="text-slate-500 text-sm">Pendiente</p>
            <p className="text-xl font-bold text-red-500">{formatCurrency(summary.pendingToCollect)}</p>
          </div>
          <div className="bg-surface-100 rounded-xl p-4 border border-slate-100">
            <p className="text-slate-500 text-sm">Gastos</p>
            <p className="text-xl font-bold text-red-500">{formatCurrency(summary.totalExpenses)}</p>
          </div>
          <div className="bg-surface-100 rounded-xl p-4 border border-slate-100">
            <p className="text-slate-500 text-sm">Balance</p>
            <p className="text-xl font-bold text-secondary-500">{formatCurrency(summary.balance)}</p>
          </div>
        </div>
      )}

      <div className="flex gap-1 bg-surface-100 rounded-xl p-1 border border-slate-200">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${tab === t.key ? 'bg-primary-500 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'movimientos' && (
        <div className="bg-surface-100 rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-sm">
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Tipo</th>
                <th className="text-left py-3 px-4">DescripciÃ³n</th>
                <th className="text-right py-3 px-4">Monto</th>
              </tr>
            </thead>
            <tbody>
              {(movements || []).slice(0, 50).map((m: any, i: number) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-100">
                  <td className="py-3 px-4 text-slate-700 text-sm">{formatDate(m.date)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${m.type === 'PAYMENT' ? 'bg-secondary-500/10 text-secondary-500' : 'bg-red-500/10 text-red-500'}`}>
                      {m.type === 'PAYMENT' ? 'Cobro' : 'Gasto'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-900">{m.description}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${m.amount >= 0 ? 'text-secondary-500' : 'text-red-500'}`}>
                    {m.amount >= 0 ? formatCurrency(m.amount) : `-${formatCurrency(Math.abs(m.amount))}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'gastos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
            <h3 className="text-slate-900 font-semibold mb-4">Registrar Gasto</h3>
            <form onSubmit={e => { e.preventDefault(); expenseMutation.mutate({ ...expenseForm, categoryId: Number(expenseForm.categoryId) }); }} className="space-y-4">
              <select value={expenseForm.categoryId} onChange={e => setExpenseForm({ ...expenseForm, categoryId: e.target.value })} required
                className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
                <option value="">CategorÃ­a</option>
                {(categories || []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="text" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} placeholder="DescripciÃ³n" required
                className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              <input type="number" step="0.01" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })} placeholder="Monto" required
                className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              <button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg">Registrar Gasto</button>
            </form>
          </div>
        </div>
      )}

      {tab === 'categorias' && (
        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
          <div className="flex gap-3 mb-4">
            <input type="text" value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="Nueva categorÃ­a..."
              className="flex-1 bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
            <button onClick={() => categoryName && categoryMutation.mutate(categoryName)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus size={18} /> Crear
            </button>
          </div>
          <div className="space-y-2">
            {(categories || []).map((c: any) => (
              <div key={c.id} className="flex justify-between items-center bg-surface-400 rounded-lg p-3">
                <span className="text-slate-900">{c.name}</span>
                <button onClick={() => deleteCatMutation.mutate(c.id)} className="text-slate-500 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'resumen' && summary && (
        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
          <h3 className="text-slate-900 font-semibold mb-4">ConfiguraciÃ³n de Capital</h3>
          <p className="text-slate-500">Capital inicial registrado: <span className="text-slate-900 font-bold">{formatCurrency(summary.initialCapital)}</span></p>
          <p className="text-slate-500 mt-2">Puedes modificar el capital inicial desde <strong>ConfiguraciÃ³n</strong>.</p>
        </div>
      )}
    </div>
  );
}
