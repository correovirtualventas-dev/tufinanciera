import { useQuery } from '@tanstack/react-query';
import { getAdminMetrics } from '../api/dashboard';
import StatCard from '../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../lib/format';
import {
  Users, Handshake, PiggyBank, Target, TrendingUp, DollarSign,
  AlertTriangle, CheckCircle, Clock, BarChart3, Wallet,
} from 'lucide-react';

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getAdminMetrics,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500" />
      </div>
    );
  }

  const chartData = metrics ? [
    { name: 'Activos', value: metrics.activeLoans, fill: '#4de600' },
    { name: 'Vencidos', value: metrics.overdueLoans, fill: '#ff4444' },
    { name: 'Cancelados', value: metrics.canceledLoans, fill: '#26cbff' },
  ] : [];

  const collectionRate = metrics?.totalCapital
    ? Math.round((metrics.totalCollected / metrics.totalCapital) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Clientes Activos" value={metrics?.totalClients || 0} icon={Users} color="primary" />
        <StatCard title="Total Préstamos" value={metrics?.totalLoans || 0} icon={Handshake} color="primary" />
        <StatCard title="Prospectos" value={Object.values(metrics?.prospects || {}).reduce((a: number, b: number) => a + b, 0)} icon={Target} color="tertiary" />
        <StatCard title="Inversores" value={metrics?.totalInvestors || 0} icon={PiggyBank} color="tertiary" />
        <StatCard title="Préstamos Activos" value={metrics?.activeLoans || 0} icon={CheckCircle} color="secondary" />
        <StatCard title="Vencidos" value={metrics?.overdueLoans || 0} icon={AlertTriangle} color="red" />
        <StatCard title="Cancelados" value={metrics?.canceledLoans || 0} icon={Clock} color="tertiary" />
        <StatCard title="Capital Inicial" value={formatCurrency(metrics?.initialCapital || 0)} icon={Wallet} color="amber" />
        <StatCard title="Total Capital" value={formatCurrency(metrics?.totalCapital || 0)} icon={BarChart3} color="primary" />
        <StatCard title="Total Cobrado" value={formatCurrency(metrics?.totalCollected || 0)} icon={DollarSign} color="secondary" />
        <StatCard title="Pendiente de Cobro" value={formatCurrency(metrics?.pendingToCollect || 0)} icon={TrendingUp} color="red" />
        <StatCard title="Ganancia Proyectada" value={formatCurrency(metrics?.projectedProfit || 0)} icon={TrendingUp} color="secondary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface-100 rounded-xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Exchange</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white/60">
              <span>USD Comprados</span>
              <span className="text-white">{metrics?.exchange.totalBoughtUSD.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>USD Vendidos</span>
              <span className="text-white">{metrics?.exchange.totalSoldUSD.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-100 rounded-xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Créditos</h3>
          <div className="text-3xl font-bold text-secondary-500">{formatCurrency(metrics?.totalCapital || 0)}</div>
          <p className="text-white/60 text-sm mt-1">Total prestado</p>
        </div>

        <div className="bg-surface-100 rounded-xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Inversiones</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white/60">
              <span>Capital ARS</span>
              <span className="text-white">{formatCurrency(metrics?.totalInvestorDeposits || 0)}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Capital USD</span>
              <span className="text-white">${(metrics?.totalInvestorDepositsUsd || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-100 rounded-xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Distribución de Préstamos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface-100 rounded-xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Intereses</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/60">Interés Cobrado</span>
              <span className="text-secondary-500 font-bold">{formatCurrency(metrics?.totalInterestCollected || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Interés Pendiente</span>
              <span className="text-amber font-bold">{formatCurrency(metrics?.totalInterestPending || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Interés Proyectado</span>
              <span className="text-tertiary-500 font-bold">{formatCurrency(metrics?.projectedProfit || 0)}</span>
            </div>
          </div>

          <h3 className="text-white font-semibold mt-6 mb-4">Alertas de Crédito</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/60">Morosidad</span>
                <span className="text-white">{metrics?.overdueLoans || 0} vencidos</span>
              </div>
              <div className="h-2 bg-surface-400 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all"
                  style={{ width: `${Math.min((metrics?.overdueLoans || 0) / Math.max(metrics?.activeLoans || 1, 1) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/60">Rendimiento</span>
                <span className="text-white">{collectionRate}%</span>
              </div>
              <div className="h-2 bg-surface-400 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary-500 rounded-full transition-all"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {metrics?.monthlyBreakdown && metrics.monthlyBreakdown.length > 0 && (
        <div className="bg-surface-100 rounded-xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Cobros por Mes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/60 border-b border-white/10">
                  <th className="text-left py-2">Mes</th>
                  <th className="text-right py-2">Bruto</th>
                  <th className="text-right py-2">Neto</th>
                  <th className="text-right py-2">Cobrado</th>
                  <th className="text-right py-2">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {metrics.monthlyBreakdown.map((m: any) => (
                  <tr key={m.month} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 text-white">{m.month}</td>
                    <td className="py-2 text-right text-white">{formatCurrency(m.gross)}</td>
                    <td className="py-2 text-right text-white">{formatCurrency(m.net)}</td>
                    <td className="py-2 text-right text-secondary-500">{formatCurrency(m.pending)}</td>
                    <td className="py-2 text-right text-white/60">{m.count}</td>
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
