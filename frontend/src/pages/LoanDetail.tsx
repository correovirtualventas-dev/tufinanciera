import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getLoan } from '../api/loans';
import { getPaymentsByLoan } from '../api/payments';
import { formatCurrency, formatDate } from '../lib/format';
import { generateFrenchAmortization } from '../lib/format';

export default function LoanDetail() {
  const { id } = useParams();
  const { data: loan, isLoading } = useQuery({
    queryKey: ['loan', id],
    queryFn: () => getLoan(Number(id)),
  });

  if (isLoading) return <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500 mx-auto mt-20" />;
  if (!loan) return <div className="text-white/60 mt-20 text-center">Préstamo no encontrado</div>;

  const amortTable = generateFrenchAmortization(loan.amount, loan.interestRate, loan.installments);
  const paidInstallments = new Set((loan.payments || []).map((p: any) => p.installment));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Préstamo #{loan.id}</h1>
        <p className="text-white/60">{loan.client?.firstName} {loan.client?.lastName} - DNI: {loan.client?.dni}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-100 rounded-xl p-4 border border-white/5">
          <p className="text-white/60 text-sm">Monto</p>
          <p className="text-xl font-bold text-white">{formatCurrency(loan.amount)}</p>
        </div>
        <div className="bg-surface-100 rounded-xl p-4 border border-white/5">
          <p className="text-white/60 text-sm">Total a Pagar</p>
          <p className="text-xl font-bold text-white">{formatCurrency(loan.totalAmount)}</p>
        </div>
        <div className="bg-surface-100 rounded-xl p-4 border border-white/5">
          <p className="text-white/60 text-sm">Cuota</p>
          <p className="text-xl font-bold text-secondary-500">{formatCurrency(loan.installmentAmount)}</p>
        </div>
        <div className="bg-surface-100 rounded-xl p-4 border border-white/5">
          <p className="text-white/60 text-sm">Estado</p>
          <span className={`px-3 py-1 rounded-full text-sm ${
            loan.status === 'ACTIVE' ? 'bg-secondary-500/10 text-secondary-500' :
            loan.status === 'OVERDUE' ? 'bg-red-500/10 text-red-500' : 'bg-tertiary-500/10 text-tertiary-500'
          }`}>{loan.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-100 rounded-xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Tabla de Amortización</h3>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/60 border-b border-white/10">
                  <th className="text-left py-2">#</th>
                  <th className="text-right py-2">Capital</th>
                  <th className="text-right py-2">Interés</th>
                  <th className="text-right py-2">Saldo</th>
                  <th className="text-center py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {amortTable.map((row: any) => (
                  <tr key={row.installment} className={`border-b border-white/5 ${paidInstallments.has(row.installment) ? 'opacity-50' : ''}`}>
                    <td className="py-2 text-white">{row.installment}</td>
                    <td className="py-2 text-right text-white">{formatCurrency(row.capital)}</td>
                    <td className="py-2 text-right text-white">{formatCurrency(row.interest)}</td>
                    <td className="py-2 text-right text-white">{formatCurrency(row.balance)}</td>
                    <td className="py-2 text-center">
                      {paidInstallments.has(row.installment) ? (
                        <span className="text-secondary-500 text-xs">Pagado</span>
                      ) : (
                        <span className="text-white/40 text-xs">Pendiente</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface-100 rounded-xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-4">Pagos Realizados</h3>
          {(!loan.payments || loan.payments.length === 0) ? (
            <p className="text-white/40">Sin pagos registrados</p>
          ) : (
            <div className="space-y-2">
              {loan.payments.map((payment: any) => (
                <div key={payment.id} className="flex justify-between items-center bg-surface-400 rounded-lg p-3">
                  <div>
                    <span className="text-white">Cuota #{payment.installment}</span>
                    <p className="text-white/60 text-xs">{formatDate(payment.paidAt)}</p>
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
