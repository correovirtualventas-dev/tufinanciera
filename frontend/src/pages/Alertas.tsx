import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { formatCurrency, formatDate } from '../lib/format';
import { AlertTriangle, Clock, DollarSign } from 'lucide-react';

export default function Alertas() {
  const [tab, setTab] = useState('overdue');

  const { data: overdue } = useQuery({
    queryKey: ['alerts-overdue'],
    queryFn: () => apiClient.get('/alerts/overdue').then(r => r.data),
  });

  const { data: upcoming } = useQuery({
    queryKey: ['alerts-upcoming'],
    queryFn: () => apiClient.get('/alerts/upcoming').then(r => r.data),
  });

  const { data: pendingCollection } = useQuery({
    queryKey: ['alerts-pending'],
    queryFn: () => apiClient.get('/alerts/pending-collection').then(r => r.data),
  });

  const tabs = [
    { key: 'overdue', label: 'Vencidos', icon: AlertTriangle },
    { key: 'upcoming', label: 'Próximos', icon: Clock },
    { key: 'pending', label: 'Cobranza Pendiente', icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Alertas</h1>

      <div className="flex gap-1 bg-surface-100 rounded-xl p-1 border border-slate-200">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${tab === t.key ? 'bg-primary-500 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overdue' && (
        <div className="bg-surface-100 rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-sm">
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-right py-3 px-4">Monto</th>
                <th className="text-right py-3 px-4">Cuota</th>
                <th className="text-right py-3 px-4">Total</th>
                <th className="text-center py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(overdue || []).map((loan: any) => (
                <tr key={loan.id} className="border-b border-slate-100 hover:bg-slate-100">
                  <td className="py-3 px-4 text-slate-900">{loan.client?.firstName} {loan.client?.lastName}</td>
                  <td className="py-3 px-4 text-right text-slate-900">{formatCurrency(loan.amount)}</td>
                  <td className="py-3 px-4 text-right text-slate-900">{formatCurrency(loan.installmentAmount)}</td>
                  <td className="py-3 px-4 text-right text-slate-900">{formatCurrency(loan.totalAmount)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-500">Vencido</span>
                  </td>
                </tr>
              ))}
              {(!overdue || overdue.length === 0) && (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">Sin préstamos vencidos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'upcoming' && (
        <div className="bg-surface-100 rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-sm">
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-center py-3 px-4">Cuota</th>
                <th className="text-right py-3 px-4">Monto</th>
                <th className="text-right py-3 px-4">Vence</th>
                <th className="text-center py-3 px-4">Días</th>
              </tr>
            </thead>
            <tbody>
              {(upcoming || []).map((item: any, i: number) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-100">
                  <td className="py-3 px-4 text-slate-900">{item.client?.firstName} {item.client?.lastName}</td>
                  <td className="py-3 px-4 text-center text-slate-900">#{item.installment}</td>
                  <td className="py-3 px-4 text-right text-slate-900">{formatCurrency(item.amount)}</td>
                  <td className="py-3 px-4 text-right text-slate-700">{formatDate(item.dueDate)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.diffDays <= 2 ? 'bg-red-500/10 text-red-500' : 'bg-amber/10 text-amber'}`}>
                      {item.diffDays}d
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'pending' && (
        <div className="bg-surface-100 rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-sm">
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-right py-3 px-4">Total</th>
                <th className="text-right py-3 px-4">Pagado</th>
                <th className="text-right py-3 px-4">Pendiente</th>
                <th className="text-center py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(pendingCollection || []).map((item: any) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-100">
                  <td className="py-3 px-4 text-slate-900">{item.client?.firstName} {item.client?.lastName}</td>
                  <td className="py-3 px-4 text-right text-slate-900">{formatCurrency(item.totalAmount)}</td>
                  <td className="py-3 px-4 text-right text-secondary-500">{formatCurrency(item.paidAmount)}</td>
                  <td className="py-3 px-4 text-right text-red-500">{formatCurrency(item.pending)}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.status === 'OVERDUE' ? 'bg-red-500/10 text-red-500' : 'bg-amber/10 text-amber'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
