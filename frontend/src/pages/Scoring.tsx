import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { checkBcra, simulateScore, recalculateScore, getScoreDetails } from '../api/scoring';
import { getClients } from '../api/clients';
import { formatCurrency } from '../lib/format';
import toast from 'react-hot-toast';
import { ShieldCheck, Search, RefreshCw } from 'lucide-react';

export default function Scoring() {
  const [dni, setDni] = useState('');
  const [bcraResult, setBcraResult] = useState<any>(null);
  const [clientId, setClientId] = useState('');
  const [simFactors, setSimFactors] = useState({
    income: 100000, loanAmount: 50000, existingLoans: 0, latePayments: 0,
    timeAsClient: 12, hasGuarantees: true, employmentStability: 'medium',
  });

  const { data: clients } = useQuery({ queryKey: ['clients-all'], queryFn: () => getClients({}) });

  const bcraMutation = useMutation({
    mutationFn: (dni: string) => checkBcra(dni),
    onSuccess: setBcraResult,
    onError: () => toast.error('Error al consultar BCRA'),
  });

  const simMutation = useMutation({
    mutationFn: () => simulateScore(simFactors),
    onSuccess: (data) => toast.success(`Puntaje simulado: ${data.score} - ${data.category.label}`),
  });

  const recalcMutation = useMutation({
    mutationFn: (id: number) => recalculateScore(id),
    onSuccess: (data) => toast.success(`Puntaje recalculado: ${data.score} - ${data.category.label}`),
  });

  const { data: scoreDetails } = useQuery({
    queryKey: ['score-details', clientId],
    queryFn: () => getScoreDetails(Number(clientId)),
    enabled: !!clientId,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Puntaje y BCRA</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
          <h3 className="text-slate-900 font-semibold mb-4">Consulta BCRA</h3>
          <div className="flex gap-3">
            <input type="text" value={dni} onChange={e => setDni(e.target.value)}
              placeholder="Ingresar DNI..." className="flex-1 bg-surface-400 border border-slate-200 rounded-lg px-4 py-3 text-slate-900" />
            <button onClick={() => bcraMutation.mutate(dni)} disabled={!dni}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-lg flex items-center gap-2">
              <Search size={18} /> Consultar
            </button>
          </div>
          {bcraResult && (
            <div className="mt-4 bg-surface-400 rounded-lg p-4 space-y-3">
              <p className="text-slate-900">CUIT: {bcraResult.cuit}</p>
              {bcraResult.denominacion && <p className="text-slate-700">Titular: {bcraResult.denominacion}</p>}
              <p className="text-slate-700">Situación: {bcraResult.situacion}</p>
              <p className="text-slate-700">Riesgo: {bcraResult.riesgo}</p>
              <p className="text-slate-900">Puntaje BCRA: {bcraResult.score}</p>
              <p className="text-slate-900">Deuda total: {formatCurrency(bcraResult.totalDeuda)}</p>
              {bcraResult.entidades.length > 0 ? (
                <div>
                  <p className="text-slate-500 text-sm font-semibold mb-2">Entidades a las que se debe:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {bcraResult.entidades.map((e: any, idx: number) => (
                      <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-surface-100">
                        <p className="text-slate-900 font-medium">{e.entidad}</p>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>{e.situacion}</span>
                          <span className="text-slate-900 font-semibold">{formatCurrency(e.monto)}</span>
                        </div>
                        {(e.diasAtraso > 0 || e.refinanciaciones) && (
                          <p className="text-xs text-red-500 mt-1">
                            {e.diasAtraso > 0 ? `${e.diasAtraso} días de atraso` : ''}
                            {e.diasAtraso > 0 && e.refinanciaciones ? ' · ' : ''}
                            {e.refinanciaciones ? 'Con refinanciaciones' : ''}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-secondary-500">Sin entidades con deudas informadas</p>
              )}
              <p className="text-secondary-500">{bcraResult.recomendacion}</p>
            </div>
          )}
        </div>

        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
          <h3 className="text-slate-900 font-semibold mb-4">Recálculo de Puntaje</h3>
          <div className="flex gap-3">
            <select value={clientId} onChange={e => setClientId(e.target.value)}
              className="flex-1 bg-surface-400 border border-slate-200 rounded-lg px-3 py-3 text-slate-900">
              <option value="">Seleccionar cliente</option>
              {(clients || []).map((c: any) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName} - {c.dni}</option>
              ))}
            </select>
            <button onClick={() => clientId && recalcMutation.mutate(Number(clientId))} disabled={!clientId}
              className="bg-secondary-500 hover:bg-secondary-600 text-black px-4 py-3 rounded-lg flex items-center gap-2">
              <RefreshCw size={18} /> Recalcular
            </button>
          </div>
          {scoreDetails && (
            <div className="mt-4 bg-surface-400 rounded-lg p-4">
              <p className="text-slate-900">Puntaje: {scoreDetails.score}</p>
              <p className={`text-${scoreDetails.category.color}-500`}>{scoreDetails.category.label}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
        <h3 className="text-slate-900 font-semibold mb-4">Simulador de Puntaje</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-slate-500 mb-1">Ingresos</label>
            <input type="number" value={simFactors.income} onChange={e => setSimFactors({ ...simFactors, income: Number(e.target.value) })}
              className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Monto Préstamo</label>
            <input type="number" value={simFactors.loanAmount} onChange={e => setSimFactors({ ...simFactors, loanAmount: Number(e.target.value) })}
              className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Préstamos activos</label>
            <input type="number" value={simFactors.existingLoans} onChange={e => setSimFactors({ ...simFactors, existingLoans: Number(e.target.value) })}
              className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Pagos atrasados</label>
            <input type="number" value={simFactors.latePayments} onChange={e => setSimFactors({ ...simFactors, latePayments: Number(e.target.value) })}
              className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Antigüedad (meses)</label>
            <input type="number" value={simFactors.timeAsClient} onChange={e => setSimFactors({ ...simFactors, timeAsClient: Number(e.target.value) })}
              className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Garantías</label>
            <select value={String(simFactors.hasGuarantees)} onChange={e => setSimFactors({ ...simFactors, hasGuarantees: e.target.value === 'true' })}
              className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Estabilidad laboral</label>
            <select value={simFactors.employmentStability} onChange={e => setSimFactors({ ...simFactors, employmentStability: e.target.value })}
              className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={() => simMutation.mutate()}
              className="w-full bg-tertiary-500 hover:bg-tertiary-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
              <ShieldCheck size={18} /> Simular
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
