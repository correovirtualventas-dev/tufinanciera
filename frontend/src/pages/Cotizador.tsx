import { useState } from 'react';
import { calculateFrenchInstallment, generateFrenchAmortization, formatCurrency } from '../lib/format';

export default function Cotizador() {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(80);
  const [installments, setInstallments] = useState(12);

  const amortTable = generateFrenchAmortization(amount, rate, installments);
  const installmentAmount = calculateFrenchInstallment(amount, rate, installments);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Cotizador de PrÃ©stamos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100 space-y-6">
          <div>
            <label className="block text-sm text-slate-500 mb-2">Monto: {formatCurrency(amount)}</label>
            <input type="range" min={10000} max={1000000} step={5000} value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full accent-primary-500" />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>{formatCurrency(10000)}</span><span>{formatCurrency(1000000)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-2">Tasa Anual: {rate}%</label>
            <input type="range" min={10} max={200} step={1} value={rate}
              onChange={e => setRate(Number(e.target.value))}
              className="w-full accent-primary-500" />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>10%</span><span>200%</span></div>
          </div>

          <div>
            <label className="block text-sm text-slate-500 mb-2">Cuotas: {installments}</label>
            <input type="range" min={1} max={60} step={1} value={installments}
              onChange={e => setInstallments(Number(e.target.value))}
              className="w-full accent-primary-500" />
            <div className="flex justify-between text-xs text-slate-400 mt-1"><span>1</span><span>60</span></div>
          </div>

          <div className="bg-surface-400 rounded-xl p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Valor Cuota</span>
              <span className="text-2xl font-bold text-secondary-500">{formatCurrency(installmentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total a Pagar</span>
              <span className="text-xl font-bold text-slate-900">{formatCurrency(installmentAmount * installments)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Intereses</span>
              <span className="text-slate-900">{formatCurrency(installmentAmount * installments - amount)}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
          <h3 className="text-slate-900 font-semibold mb-4">Tabla de AmortizaciÃ³n</h3>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="text-left py-2">#</th>
                  <th className="text-right py-2">Capital</th>
                  <th className="text-right py-2">InterÃ©s</th>
                  <th className="text-right py-2">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {amortTable.map((row: any) => (
                  <tr key={row.installment} className="border-b border-slate-100">
                    <td className="py-2 text-slate-900">{row.installment}</td>
                    <td className="py-2 text-right text-slate-900">{formatCurrency(row.capital)}</td>
                    <td className="py-2 text-right text-slate-700">{formatCurrency(row.interest)}</td>
                    <td className="py-2 text-right text-slate-900">{formatCurrency(row.balance)}</td>
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
