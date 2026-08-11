import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-tau-lake-99.vercel.app';

function formatCurrency(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('es-AR');
}

export default function InvestorModal({ onClose }) {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState(null);
  const [investor, setInvestor] = useState(null);
  const [summary, setSummary] = useState(null);
  const [tab, setTab] = useState('movements');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/investor-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error inesperado. Intenta de nuevo.');
      setToken(data.token);
      setInvestor(data.investor);
      loadSummary(data.token, data.investor.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadSummary = async (t, id) => {
    try {
      const res = await fetch(`${API_URL}/api/investors/${id}/summary`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      setSummary(data);
    } catch {}
  };

  if (!token) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md animate-fade-in shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Inversor</h2>
            <button onClick={onClose} className="text-tertiary-500 hover:text-slate-900"><span className="material-symbols-outlined">close</span></button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-tertiary-500">DNI</label>
              <input value={dni} onChange={e => setDni(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-primary-500" />
            </div>
            <div className="relative">
              <label className="text-sm text-tertiary-500">Contraseña</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-12 text-slate-900 focus:outline-none focus:border-primary-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary-500 hover:text-slate-900">
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-secondary-500 hover:bg-secondary-600 text-black font-bold py-3 rounded-full">Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'movements', label: 'Movimientos' },
    { key: 'accruals', label: 'Acreditaciones' },
    { key: 'payouts', label: 'Pagos' },
    { key: 'withdraw', label: 'Rescatar' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-900">{investor?.name}</h2>
          <div className="flex gap-2">
            <button onClick={() => { setToken(null); setInvestor(null); setSummary(null); }} className="text-tertiary-500 hover:text-slate-900 text-sm">Cerrar sesión</button>
            <button onClick={onClose} className="text-tertiary-500 hover:text-slate-900"><span className="material-symbols-outlined">close</span></button>
          </div>
        </div>

        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6 text-sm">
            <div className="bg-slate-50 rounded-xl p-3"><p className="text-tertiary-500 text-xs">Base</p><p className="font-bold text-slate-900">{formatCurrency(summary.capitalBase)}</p></div>
            <div className="bg-slate-50 rounded-xl p-3"><p className="text-tertiary-500 text-xs">Acreditado</p><p className="font-bold text-secondary-600">{formatCurrency(summary.totalAccrued)}</p></div>
            <div className="bg-slate-50 rounded-xl p-3"><p className="text-tertiary-500 text-xs">Pagado</p><p className="font-bold text-red-500">{formatCurrency(summary.totalPaid)}</p></div>
            <div className="bg-slate-50 rounded-xl p-3"><p className="text-tertiary-500 text-xs">Disponible</p><p className="font-bold text-tertiary-500">{formatCurrency(summary.availableBalance)}</p></div>
            <div className="bg-slate-50 rounded-xl p-3"><p className="text-tertiary-500 text-xs">Diario</p><p className="font-bold text-amber">{formatCurrency(summary.dailyAccrual)}</p></div>
          </div>
        )}

        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-4">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-2 rounded-lg text-sm transition-colors ${tab === t.key ? 'bg-primary-500 text-white' : 'text-tertiary-500 hover:text-slate-900'}`}>{t.label}</button>
          ))}
        </div>

        {tab === 'movements' && (
          <table className="w-full text-sm">
            <thead><tr className="text-tertiary-500 border-b border-slate-200"><th className="text-left py-2">Tipo</th><th className="text-right py-2">Monto</th><th className="text-right py-2">Fecha</th></tr></thead>
            <tbody>
              {(summary?.movements || []).map(m => (
                <tr key={m.id} className="border-b border-slate-100">
                  <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-xs ${m.movementType === 'DEPOSIT' ? 'bg-secondary-500/10 text-secondary-600' : 'bg-red-500/10 text-red-500'}`}>{m.movementType === 'DEPOSIT' ? 'Depósito' : 'Retiro'}</span></td>
                  <td className="text-right text-slate-900">{formatCurrency(m.amount)}</td>
                  <td className="text-right text-tertiary-500">{formatDate(m.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'accruals' && (
          <table className="w-full text-sm">
            <thead><tr className="text-tertiary-500 border-b border-slate-200"><th className="text-left py-2">Fecha</th><th className="text-right py-2">Base</th><th className="text-right py-2">Monto</th></tr></thead>
            <tbody>
              {(summary?.accruals || []).map(a => (
                <tr key={a.id} className="border-b border-slate-100">
                  <td className="py-2 text-slate-900">{a.date}</td>
                  <td className="text-right text-slate-900">{formatCurrency(a.capitalBase)}</td>
                  <td className="text-right text-secondary-600">{formatCurrency(a.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'payouts' && (
          <table className="w-full text-sm">
            <thead><tr className="text-tertiary-500 border-b border-slate-200"><th className="text-right py-2">Monto</th><th className="text-right py-2">Fecha</th></tr></thead>
            <tbody>
              {(summary?.payouts || []).map(p => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="text-right py-2 text-slate-900">{formatCurrency(p.amount)}</td>
                  <td className="text-right py-2 text-tertiary-500">{formatDate(p.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'withdraw' && (
          <div className="text-center py-8">
            <p className="text-tertiary-500 mb-4">Disponible: {summary ? formatCurrency(summary.availableBalance) : '$0'}</p>
            <p className="text-sm text-tertiary-400">Contactanos para realizar un rescate</p>
          </div>
        )}
      </div>
    </div>
  );
}