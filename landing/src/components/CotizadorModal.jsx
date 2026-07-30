import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-tau-lake-99.vercel.app';

function formatCurrency(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 }).format(n);
}

function calcQuota(amount, annualRate, months) {
  const mr = annualRate / 12 / 100;
  if (mr === 0) return amount / months;
  const f = Math.pow(1 + mr, months);
  return amount * (mr * f) / (f - 1);
}

export default function CotizadorModal({ onClose }) {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(80);
  const [months, setMonths] = useState(12);
  const [dolar, setDolar] = useState(1400);

  useEffect(() => {
    fetch(`${API_URL}/api/dolar`).then(r => r.json()).then(d => {
      if (d?.blue?.value_sell) setDolar(d.blue.value_sell);
    }).catch(() => {});
  }, []);

  const quota = calcQuota(amount, rate, months);
  const total = quota * months;

  const amortTable = [];
  let balance = amount;
  const mr = rate / 12 / 100;
  for (let i = 1; i <= months; i++) {
    const interest = balance * mr;
    const capital = quota - interest;
    balance -= capital;
    amortTable.push({ i, capital: Math.round(capital * 100) / 100, interest: Math.round(interest * 100) / 100, balance: Math.max(0, Math.round(balance * 100) / 100) });
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface-light rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Cotizador</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><span className="material-symbols-outlined">close</span></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div><label className="text-sm text-white/60">Monto: {formatCurrency(amount)}</label><input type="range" min={10000} max={1000000} step={5000} value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full accent-primary" /></div>
            <div><label className="text-sm text-white/60">Tasa: {rate}%</label><input type="range" min={10} max={200} step={1} value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full accent-primary" /></div>
            <div><label className="text-sm text-white/60">Cuotas: {months}</label><input type="range" min={1} max={60} step={1} value={months} onChange={e => setMonths(Number(e.target.value))} className="w-full accent-primary" /></div>
            <div className="bg-surface rounded-xl p-4 space-y-2">
              <div className="flex justify-between"><span className="text-white/60">Cuota</span><span className="text-xl font-bold text-secondary">{formatCurrency(quota)}</span></div>
              <div className="flex justify-between"><span className="text-white/60">Total</span><span className="font-bold text-white">{formatCurrency(total)}</span></div>
              <div className="flex justify-between"><span className="text-white/60">Dólar blue</span><span className="text-tertiary">${dolar.toFixed(2)}</span></div>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <h3 className="font-semibold mb-3">Amortización</h3>
            <table className="w-full text-sm">
              <thead><tr className="text-white/60 border-b border-white/10"><th className="text-left py-1">#</th><th className="text-right py-1">Capital</th><th className="text-right py-1">Interés</th><th className="text-right py-1">Saldo</th></tr></thead>
              <tbody>
                {amortTable.map(r => (
                  <tr key={r.i} className="border-b border-white/5"><td className="py-1">{r.i}</td><td className="text-right">{formatCurrency(r.capital)}</td><td className="text-right">{formatCurrency(r.interest)}</td><td className="text-right">{formatCurrency(r.balance)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
