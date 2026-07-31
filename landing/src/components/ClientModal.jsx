import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-tau-lake-99.vercel.app';

function formatCurrency(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n);
}

function loanStatusLabel(status) {
  const map = {
    ACTIVE: 'Activo',
    OVERDUE: 'Vencido',
    CANCELED: 'Cancelado',
    CANCELLED: 'Cancelado',
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    REJECTED: 'Rechazado',
  };
  return map[status] || status;
}

export default function ClientModal({ onClose }) {
  const [dni, setDni] = useState(sessionStorage.getItem('clientDni') || '');
  const [password, setPassword] = useState(sessionStorage.getItem('clientPassword') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState(sessionStorage.getItem('clientToken'));
  const [client, setClient] = useState(JSON.parse(sessionStorage.getItem('clientData') || 'null'));
  const [tab, setTab] = useState('resumen');
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/client-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error inesperado. Intenta de nuevo.');
      setToken(data.token);
      setClient(data.client);
      sessionStorage.setItem('clientToken', data.token);
      sessionStorage.setItem('clientData', JSON.stringify(data.client));
      sessionStorage.setItem('clientDni', dni);
      sessionStorage.setItem('clientPassword', password);
      loadData(data.token, data.client.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadData = async (t, clientId) => {
    try {
      const [loansRes, paymentsRes] = await Promise.all([
        fetch(`${API_URL}/api/clients/${clientId}/loans`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API_URL}/api/payments/recent?limit=20`, { headers: { Authorization: `Bearer ${t}` } }),
      ]);
      setLoans(await loansRes.json());
      setPayments(await paymentsRes.json());
    } catch {}
  };

  const handleLogout = () => {
    setToken(null);
    setClient(null);
    setLoans([]);
    setPayments([]);
    sessionStorage.removeItem('clientToken');
    sessionStorage.removeItem('clientData');
    sessionStorage.removeItem('clientDni');
    sessionStorage.removeItem('clientPassword');
  };

  if (!token) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-surface-light rounded-2xl p-6 sm:p-8 w-full max-w-md animate-fade-in" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Cliente</h2>
            <button onClick={onClose} className="text-white/60 hover:text-white"><span className="material-symbols-outlined">close</span></button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-white/60">DNI</label>
              <input value={dni} onChange={e => setDni(e.target.value)} required className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
            </div>
            <div className="relative">
              <label className="text-sm text-white/60">Contraseña</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-primary" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-amber text-surface font-bold py-3 rounded-full">Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'resumen', label: 'Resumen' },
    { key: 'pagos', label: 'Pagos' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface-light rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{client?.firstName} {client?.lastName}</h2>
          <div className="flex gap-2">
            <button onClick={handleLogout} className="text-white/60 hover:text-white text-sm">Cerrar sesión</button>
            <button onClick={onClose} className="text-white/60 hover:text-white"><span className="material-symbols-outlined">close</span></button>
          </div>
        </div>

        <div className="flex gap-1 bg-surface rounded-xl p-1 mb-4">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-2 rounded-lg text-sm transition-colors ${tab === t.key ? 'bg-amber text-surface' : 'text-white/60 hover:text-white'}`}>{t.label}</button>
          ))}
        </div>

        {tab === 'resumen' && (
          <div className="space-y-4">
            {loans.map(loan => (
              <div key={loan.id} className="bg-surface rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Préstamo #{loan.id}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${loan.status === 'ACTIVE' ? 'bg-secondary/10 text-secondary' : 'bg-red-400/10 text-red-400'}`}>{loanStatusLabel(loan.status)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div><span className="text-white/60">Monto</span><p className="font-bold">{formatCurrency(loan.amount)}</p></div>
                  <div><span className="text-white/60">Cuota</span><p className="font-bold">{formatCurrency(loan.installmentAmount)}</p></div>
                  <div><span className="text-white/60">Total</span><p className="font-bold">{formatCurrency(loan.totalAmount)}</p></div>
                </div>
              </div>
            ))}
            {loans.length === 0 && <p className="text-white/40 text-center">Sin préstamos activos</p>}
          </div>
        )}

        {tab === 'pagos' && (
          <table className="w-full text-sm">
            <thead><tr className="text-white/60 border-b border-white/10"><th className="text-left py-2">Préstamo</th><th className="text-left py-2">Cuota</th><th className="text-right py-2">Monto</th><th className="text-right py-2">Fecha</th></tr></thead>
            <tbody>
              {payments.filter(p => p.client?.id === client?.id).map(p => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="py-2">#{p.loanId}</td>
                  <td className="py-2">{p.installment}</td>
                  <td className="text-right">{formatCurrency(p.amount)}</td>
                  <td className="text-right text-white/60">{new Date(p.paidAt).toLocaleDateString('es-AR')}</td>
                </tr>
              ))}
              {payments.filter(p => p.client?.id === client?.id).length === 0 && <tr><td colSpan={4} className="py-4 text-center text-white/40">Sin pagos</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
