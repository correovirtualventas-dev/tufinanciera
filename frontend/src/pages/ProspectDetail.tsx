import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../lib/format';
import { Save } from 'lucide-react';

export default function ProspectDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: prospect, isLoading } = useQuery({
    queryKey: ['prospect', id],
    queryFn: () => apiClient.get(`/prospects/${id}`).then(r => r.data),
  });

  const [form, setForm] = useState<any>(null);

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiClient.patch(`/prospects/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['prospect', id] }); toast.success('Prospecto actualizado'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Error'),
  });

  if (isLoading) return <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500 mx-auto mt-20" />;
  if (!prospect) return <div className="text-slate-500 mt-20 text-center">Prospecto no encontrado</div>;

  const data = form || prospect;
  if (!form && prospect) setForm(prospect);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{prospect.firstName} {prospect.lastName}</h1>

      <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-500 mb-1">Nombre</label>
            <input value={data.firstName} onChange={e => setForm({ ...data, firstName: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Apellido</label>
            <input value={data.lastName} onChange={e => setForm({ ...data, lastName: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">DNI</label>
            <input value={data.dni || ''} onChange={e => setForm({ ...data, dni: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">TelÃ©fono</label>
            <input value={data.phone || ''} onChange={e => setForm({ ...data, phone: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Email</label>
            <input value={data.email || ''} onChange={e => setForm({ ...data, email: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Localidad</label>
            <input value={data.localidad || ''} onChange={e => setForm({ ...data, localidad: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Actividad</label>
            <input value={data.activity || ''} onChange={e => setForm({ ...data, activity: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Ingresos</label>
            <input type="number" value={data.income || 0} onChange={e => setForm({ ...data, income: Number(e.target.value) })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Monto</label>
            <input type="number" value={data.amount || 0} onChange={e => setForm({ ...data, amount: Number(e.target.value) })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Cuotas</label>
            <input type="number" value={data.installments || 0} onChange={e => setForm({ ...data, installments: Number(e.target.value) })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Estado</label>
            <select value={data.status} onChange={e => setForm({ ...data, status: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
              <option value="NEW">Nuevo</option>
              <option value="CONTACTED">Contactado</option>
              <option value="QUALIFIED">Calificado</option>
              <option value="CONVERTED">Convertido</option>
              <option value="LOST">Perdido</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">Temperatura</label>
            <select value={data.temperature || ''} onChange={e => setForm({ ...data, temperature: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
              <option value="">-</option>
              <option value="HOT">Caliente</option>
              <option value="WARM">Tibio</option>
              <option value="COLD">FrÃ­o</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-500 mb-1">CalificaciÃ³n</label>
            <select value={data.qualification || ''} onChange={e => setForm({ ...data, qualification: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
              <option value="">-</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-slate-500 mb-1">Notas</label>
            <textarea value={data.notes || ''} onChange={e => setForm({ ...data, notes: e.target.value })} rows={3} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={() => updateMutation.mutate(data)} className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">
            <Save size={18} /> Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
