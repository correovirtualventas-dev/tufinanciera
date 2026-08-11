import { useState } from 'react';
import { calculateFrenchInstallment, generateFrenchAmortization, formatCurrency } from '../lib/format';

const AMOUNT_PRESETS = [50000, 100000, 250000, 500000];
const AMOUNT_MIN = 10000;
const AMOUNT_MAX = 1000000;
const RATE_MIN = 10;
const RATE_MAX = 200;
const INST_MIN = 1;
const INST_MAX = 60;

export default function Cotizador() {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(80);
  const [installments, setInstallments] = useState(12);

  const setAmountSafe = (v: number) => setAmount(Math.min(Math.max(v, AMOUNT_MIN), AMOUNT_MAX));
  const setRateSafe = (v: number) => setRate(Math.min(Math.max(v, RATE_MIN), RATE_MAX));
  const setInstSafe = (v: number) => setInstallments(Math.min(Math.max(v, INST_MIN), INST_MAX));

  const amortTable = generateFrenchAmortization(amount, rate, installments);
  const installmentAmount = calculateFrenchInstallment(amount, rate, installments);
  const totalToPay = installmentAmount * installments;
  const totalInterest = totalToPay - amount;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Cotizador de Préstamos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100 space-y-6">
          <div>
            <label className="block text-sm text-slate-500 mb-2">Monto</label>
            <div className="flex items-center gap-3 mb-2">
              <input type="number" value={amount} onChange={e => setAmountSafe(Number(e.target.value))}
                className="w-40 bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              <div className="flex gap-1.5 flex-wrap">
                {AMOUNT_PRESETS.map(p => (
                  <button key={p} type="button" onClick={() => setAmount(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      amount === p ? 'bg-primary-500 text-white' : 'bg-surface-400 text-slate-600 hover:text-primary-500'
                    }`}>
                    {formatCurrency(p)}
                  </button>
                ))}
              </div>
            </div>
            <input type="range" min={AMOUNT_MIN} max={AMOUNT_MAX} step={5000} value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full accent-primary-500" />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>{formatCurrency(AMOUNT_MIN)}</span><span>{formatCurrency(AMOUNT_MAX)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-2">Tasa Anual</label>
            <div className="flex items-center gap-3 mb-2">
              <input type="number" value={rate} onChange={e => setRateSafe(Number(e.target.value))}
                className="w-40 bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              <span className="text-slate-500 text-sm">% TNA</span>
            </div>
            <input type="range" min={RATE_MIN} max={RATE_MAX} step={1} value={rate}
              onChange={e => setRate(Number(e.target.value))}
              className="w-full accent-primary-500" />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>{RATE_MIN}%</span><span>{RATE_MAX}%</span></div>
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-2">Cuotas</label>
            <div className="flex items-center gap-3 mb-2">
              <input type="number" value={installments} onChange={e => setInstSafe(Number(e.target.value))}
                className="w-40 bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
            </div>
            <input type="range" min={INST_MIN} max={INST_MAX} step={1} value={installments}
              onChange={e => setInstallments(Number(e.target.value))}
              className="w-full accent-primary-500" />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>{INST_MIN}</span><span>{INST_MAX}</span></div>
          </div>

          <div className="bg-surface-400 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Valor Cuota</span>
              <span className="text-2xl font-bold text-secondary-500">{formatCurrency(installmentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total a Pagar</span>
              <span className="text-xl font-bold text-slate-900">{formatCurrency(totalToPay)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Intereses</span>
              <span className="text-slate-900">{formatCurrency(totalInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Costo Total</span>
              <span className="text-amber">{amount ? ((totalInterest / amount) * 100).toFixed(1) : 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
          <h3 className="text-slate-900 font-semibold mb-4">Tabla de Amortización</h3>
          <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-400">
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="text-left py-2 px-3">#</th>
                  <th className="text-right py-2 px-3">Capital</th>
                  <th className="text-right py-2 px-3">Interés</th>
                  <th className="text-right py-2 px-3">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {amortTable.map((row: any) => (
                  <tr key={row.installment} className={`border-b border-slate-100 ${row.installment % 2 === 0 ? 'bg-surface-100' : ''}`}>
                    <td className="py-2 px-3 text-slate-900">{row.installment}</td>
                    <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(row.capital)}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{formatCurrency(row.interest)}</td>
                    <td className="py-2 px-3 text-right text-slate-900">{formatCurrency(row.balance)}</td>
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
