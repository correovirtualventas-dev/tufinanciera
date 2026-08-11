import { useQuery } from '@tanstack/react-query';
import { getAdminMetrics } from '../api/dashboard';
import StatCard from '../components/StatCard';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { formatCurrency } from '../lib/format';
import {
  Users, Handshake, PiggyBank, Target, TrendingUp, DollarSign,
  AlertTriangle, CheckCircle, Clock, BarChart3, Wallet,
  UserPlus, PlusCircle, ScrollText, Calculator,
} from 'lucide-react';

const quickActions = [
  { to: '/clients', icon: UserPlus, label: 'Nuevo Cliente' },
  { to: '/payments', icon: DollarSign, label: 'Registrar Pago' },
  { to: '/loans', icon: PlusCircle, label: 'Nuevo Préstamo' },
  { to: '/cotizador', icon: Calculator, label: 'Cotizador' },
];

const collectionChartColors = { cobrado: '#10b981', pendiente: '#ef4444' };

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
    { name: 'Activos', value: metrics.activeLoans, fill: '#2563eb' },
    { name: 'Vencidos', value: metrics.overdueLoans, fill: '#ef4444' },
    { name: 'Cancelados', value: metrics.canceledLoans, fill: '#64748b' },
  ] : [];

  const collectionRate = metrics?.totalCapital
    ? Math.round((metrics.totalCollected / metrics.totalCapital) * 100)
    : 0;

  const collectionData = metrics ? [
    { name: 'Cobrado', value: metrics.totalCollected, fill: collectionChartColors.cobrado },
    { name: 'Pendiente', value: metrics.pendingToCollect, fill: collectionChartColors.pendiente },
  ] : [];

  const monthlyChartData = (metrics?.monthlyBreakdown || []).map((m: any) => ({
    mes: m.month,
    Neto: m.net,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Panel de Control</h1>
        <div className="flex gap-2 flex-wrap">
          {quickActions.map(a => (
            <Link key={a.to} to={a.to}
              className="flex items-center gap-2 px-4 py-2 bg-surface-100 border border-slate-200 rounded-lg text-sm text-slate-700 hover:text-primary-500 hover:border-primary-500/40 transition-colors">
              <a.icon size={16} /> {a.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Clientes Activos" value={metrics?.totalClients || 0} icon={Users} color="primary" />
        <StatCard title="Total Préstamos" value={metrics?.totalLoans || 0} icon={Handshake} color="primary" />
        <StatCard title="Prospectos" value={(Object.values(metrics?.prospects || {}) as number[]).reduce((a, b) => a + b, 0)} icon={Target} color="tertiary" />
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
        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
          <h3 className="text-slate-900 font-semibold mb-4">Cambio de Divisas</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>USD Comprados</span>
              <span className="text-slate-900">{metrics?.exchange.totalBoughtUSD.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>USD Vendidos</span>
              <span className="text-slate-900">{metrics?.exchange.totalSoldUSD.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
          <h3 className="text-slate-900 font-semibold mb-4">Resumen de Cobranza</h3>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={collectionData} dataKey="value" innerRadius={32} outerRadius={48} paddingAngle={3} strokeWidth={0}>
                    {collectionData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Cobrado</span>
                <span className="text-secondary-500 font-semibold">{formatCurrency(metrics?.totalCollected || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pendiente</span>
                <span className="text-red-500 font-semibold">{formatCurrency(metrics?.pendingToCollect || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tasa de Cobro</span>
                <span className="text-slate-900 font-semibold">{collectionRate}%</span>
              </div>
              <div className="h-2 bg-surface-400 rounded-full overflow-hidden">
                <div className="h-full bg-secondary-500 rounded-full transition-all" style={{ width: `${collectionRate}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
          <h3 className="text-slate-900 font-semibold mb-4">Inversiones</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Capital ARS</span>
              <span className="text-slate-900">{formatCurrency(metrics?.totalInvestorDeposits || 0)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Capital USD</span>
              <span className="text-slate-900">${(metrics?.totalInvestorDepositsUsd || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
          <h3 className="text-slate-900 font-semibold mb-4">Distribución de Préstamos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                labelStyle={{ color: '#1e293b' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
          <h3 className="text-slate-900 font-semibold mb-4">Intereses</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Interés Cobrado</span>
              <span className="text-secondary-500 font-bold">{formatCurrency(metrics?.totalInterestCollected || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Interés Pendiente</span>
              <span className="text-amber font-bold">{formatCurrency(metrics?.totalInterestPending || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Interés Proyectado</span>
              <span className="text-tertiary-500 font-bold">{formatCurrency(metrics?.projectedProfit || 0)}</span>
            </div>
          </div>

          <h3 className="text-slate-900 font-semibold mt-6 mb-4">Alertas de Crédito</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Morosidad</span>
                <span className="text-slate-900">{metrics?.overdueLoans || 0} vencidos</span>
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
                <span className="text-slate-500">Rendimiento</span>
                <span className="text-slate-900">{collectionRate}%</span>
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
        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
          <h3 className="text-slate-900 font-semibold mb-4">Cobros por Mes</h3>
          {monthlyChartData.length > 0 && (
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="gradNeto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" tickFormatter={(v: any) => `$${v}`} />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    labelStyle={{ color: '#1e293b' }}
                  />
                  <Area type="monotone" dataKey="Neto" stroke="#10b981" strokeWidth={2} fill="url(#gradNeto)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="text-left py-2">Mes</th>
                  <th className="text-right py-2">Bruto</th>
                  <th className="text-right py-2">Neto</th>
                  <th className="text-right py-2">Cobrado</th>
                  <th className="text-right py-2">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {metrics.monthlyBreakdown.map((m: any) => (
                  <tr key={m.month} className="border-b border-slate-100 hover:bg-slate-100">
                    <td className="py-2 text-slate-900">{m.month}</td>
                    <td className="py-2 text-right text-slate-900">{formatCurrency(m.gross)}</td>
                    <td className="py-2 text-right text-slate-900">{formatCurrency(m.net)}</td>
                    <td className="py-2 text-right text-secondary-500">{formatCurrency(m.pending)}</td>
                    <td className="py-2 text-right text-slate-500">{m.count}</td>
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
