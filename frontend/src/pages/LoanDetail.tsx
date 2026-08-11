import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLoan } from '../api/loans';
import { getPaymentsByLoan } from '../api/payments';
import { formatCurrency, formatDate, loanStatusLabel, calculateFrenchInstallment } from '../lib/format';
import { generateFrenchAmortization } from '../lib/format';
import { Handshake } from 'lucide-react';

export default function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: loan, isLoading } = useQuery({
    queryKey: ['loan', id],
    queryFn: () => getLoan(Number(id)),
  });

  if (isLoading) return <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500 mx-auto mt-20" />;
  if (!loan) return <div className="text-slate-500 mt-20 text-center">Préstamo no encontrado</div>;

  const amortTable = generateFrenchAmortization(loan.amount, loan.interestRate, loan.installments);
  const paidInstallments = new Set((loan.payments || []).map((p: any) => p.installment));
  const installment = loan.installmentAmount || calculateFrenchInstallment(loan.amount, loan.interestRate, loan.installments);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Préstamo #{loan.id}</h1>
          <p className="text-slate-500">{loan.client?.firstName} {loan.client?.lastName} - DNI: {loan.client?.dni}</p>
        </div>
        <button
          onClick={() => navigate(`/payments?loan=${loan.id}`)}
          className="bg-secondary-500 hover:bg-secondary-600 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Handshake size={18} /> Pagar Cuota
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-100 rounded-xl p-4 border border-slate-100">
          <p className="text-slate-500 text-sm">Monto</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(loan.amount)}</p>
        </div>
        <div className="bg-surface-100 rounded-xl p-4 border border-slate-100">
          <p className="text-slate-500 text-sm">Total a Pagar</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(loan.totalAmount)}</p>
        </div>
        <div className="bg-surface-100 rounded-xl p-4 border border-slate-100">
          <p className="text-slate-500 text-sm">Cuota</p>
          <p className="text-xl font-bold text-secondary-500">{formatCurrency(loan.installmentAmount)}</p>
        </div>
        <div className="bg-surface-100 rounded-xl p-4 border border-slate-100">
          <p className="text-slate-500 text-sm">Estado</p>
          <span className={`px-3 py-1 rounded-full text-sm ${
            loan.status === 'ACTIVE' ? 'bg-secondary-500/10 text-secondary-500' :
            loan.status === 'OVERDUE' ? 'bg-red-500/10 text-red-500' : 'bg-tertiary-500/10 text-tertiary-500'
          }`}>{loanStatusLabel(loan.status)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100 lg:col-span-2">
          <h3 className="text-slate-900 font-semibold mb-4">Tabla de Amortización</h3>
          <div className="max-h-[520px] overflow-y-auto pr-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-100">
                <tr className="text-slate-500 border-b border-slate-200">
                  <th className="text-left py-3">#</th>
                  <th className="text-right py-3">Cuota mensual</th>
                  <th className="text-right py-3">Capital</th>
                  <th className="text-right py-3">Interés</th>
                  <th className="text-right py-3">Saldo deudor</th>
                  <th className="text-center py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {amortTable.map((row: any) => (
                  <tr key={row.installment} className={`border-b border-slate-100 ${paidInstallments.has(row.installment) ? 'opacity-50' : ''}`}>
                    <td className="py-2.5 text-slate-500">#{row.installment}</td>
                    <td className="py-2.5 text-right text-slate-900 font-medium">{formatCurrency(installment)}</td>
                    <td className="py-2.5 text-right text-slate-900">{formatCurrency(row.capital)}</td>
                    <td className="py-2.5 text-right text-slate-900">{formatCurrency(row.interest)}</td>
                    <td className="py-2.5 text-right text-slate-900 font-medium">{formatCurrency(row.balance)}</td>
                    <td className="py-2.5 text-center">
                      {paidInstallments.has(row.installment) ? (
                        <span className="text-secondary-500 text-xs">Pagado</span>
                      ) : (
                        <span className="text-slate-400 text-xs">Pendiente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
          <h3 className="text-slate-900 font-semibold mb-4">Pagos Realizados</h3>
          {(!loan.payments || loan.payments.length === 0) ? (
            <p className="text-slate-400">Sin pagos registrados</p>
          ) : (
            <div className="space-y-2">
              {loan.payments.map((payment: any) => (
                <div key={payment.id} className="flex justify-between items-center bg-surface-400 rounded-lg px-3 py-2.5">
                  <div>
                    <span className="text-slate-900">Cuota #{payment.installment}</span>
                    <p className="text-slate-500 text-xs">{formatDate(payment.paidAt)}</p>
                  </div>
                  <span className="text-secondary-500 font-semibold">{formatCurrency(payment.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
