import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/format';

export default function Prospectos() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', dni: '', phone: '', email: '', localidad: '',
    activity: '', income: 0, amount: 0, installments: 0, notes: '',
    temperature: '', qualification: '', status: 'NEW',
  });

  const queryClient = useQueryClient();
  const { data: prospects } = useQuery({
    queryKey: ['prospects', status],
    queryFn: () => apiClient.get('/prospects', { params: { status: status || undefined } }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => editing
      ? apiClient.patch(`/prospects/${editing.id}`, data)
      : apiClient.post('/prospects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] });
      setModalOpen(false); setEditing(null);
      toast.success(editing ? 'Prospecto actualizado' : 'Prospecto creado');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/prospects/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['prospects'] }); toast.success('Prospecto eliminado'); },
  });

  const handleEdit = (p: any) => {
    setEditing(p);
    setForm({
      firstName: p.firstName, lastName: p.lastName, dni: p.dni || '', phone: p.phone || '',
      email: p.email || '', localidad: p.localidad || '', activity: p.activity || '',
      income: p.income || 0, amount: p.amount || 0, installments: p.installments || 0,
      notes: p.notes || '', temperature: p.temperature || '', qualification: p.qualification || '',
      status: p.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Prospectos</h1>
        <button onClick={() => { setEditing(null); setForm({ firstName: '', lastName: '', dni: '', phone: '', email: '', localidad: '', activity: '', income: 0, amount: 0, installments: 0, notes: '', temperature: '', qualification: '', status: 'NEW' }); setModalOpen(true); }}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Nuevo Prospecto
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
            className="w-full bg-surface-100 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="bg-surface-100 border border-white/10 rounded-lg px-4 py-3 text-white">
          <option value="">Todos</option>
          <option value="NEW">Nuevo</option>
          <option value="CONTACTED">Contactado</option>
          <option value="QUALIFIED">Calificado</option>
          <option value="CONVERTED">Convertido</option>
          <option value="LOST">Perdido</option>
        </select>
      </div>

      <div className="bg-surface-100 rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-white/60 text-sm">
              <th className="text-left py-3 px-4">Nombre</th>
              <th className="text-left py-3 px-4">DNI</th>
              <th className="text-left py-3 px-4">Teléfono</th>
              <th className="text-center py-3 px-4">Estado</th>
              <th className="text-center py-3 px-4">Temp.</th>
              <th className="text-center py-3 px-4">Calif.</th>
              <th className="text-right py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(prospects || []).map((p: any) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 px-4">
                  <Link to={`/prospects/${p.id}`} className="text-white hover:text-primary-500">{p.firstName} {p.lastName}</Link>
                </td>
                <td className="py-3 px-4 text-white/80">{p.dni || '-'}</td>
                <td className="py-3 px-4 text-white/80">{p.phone || '-'}</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-1 rounded-full text-xs bg-tertiary-500/10 text-tertiary-500">{p.status}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  {p.temperature ? (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      p.temperature === 'HOT' ? 'bg-red-500/10 text-red-500' :
                      p.temperature === 'WARM' ? 'bg-amber/10 text-amber' : 'bg-tertiary-500/10 text-tertiary-500'
                    }`}>{p.temperature}</span>
                  ) : '-'}
                </td>
                <td className="py-3 px-4 text-center text-white/80">{p.qualification || '-'}</td>
                <td className="py-3 px-4 text-right">
                  <Link to={`/prospects/${p.id}`} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-tertiary-500 inline-block"><Eye size={16} /></Link>
                  <button onClick={() => handleEdit(p)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-primary-500"><Edit2 size={16} /></button>
                  <button onClick={() => { if (confirm('¿Eliminar?')) deleteMutation.mutate(p.id); }} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-red-500"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModalOpen(false)}>
          <div className="bg-surface-100 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">{editing ? 'Editar' : 'Nuevo'} Prospecto</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm text-white/60 mb-1">Nombre *</label>
                <input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm text-white/60 mb-1">Apellido *</label>
                <input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
              <div><label className="block text-sm text-white/60 mb-1">DNI</label><input value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" /></div>
              <div><label className="block text-sm text-white/60 mb-1">Teléfono</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" /></div>
              <div><label className="block text-sm text-white/60 mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" /></div>
              <div><label className="block text-sm text-white/60 mb-1">Localidad</label><input value={form.localidad} onChange={e => setForm({ ...form, localidad: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" /></div>
              <div><label className="block text-sm text-white/60 mb-1">Actividad</label><input value={form.activity} onChange={e => setForm({ ...form, activity: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" /></div>
              <div><label className="block text-sm text-white/60 mb-1">Ingresos</label><input type="number" value={form.income} onChange={e => setForm({ ...form, income: Number(e.target.value) })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" /></div>
              <div><label className="block text-sm text-white/60 mb-1">Monto Solicitado</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" /></div>
              <div><label className="block text-sm text-white/60 mb-1">Cuotas</label><input type="number" value={form.installments} onChange={e => setForm({ ...form, installments: Number(e.target.value) })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" /></div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Estado</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white">
                  <option value="NEW">Nuevo</option>
                  <option value="CONTACTED">Contactado</option>
                  <option value="QUALIFIED">Calificado</option>
                  <option value="CONVERTED">Convertido</option>
                  <option value="LOST">Perdido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Temperatura</label>
                <select value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white">
                  <option value="">Seleccionar</option>
                  <option value="HOT">Caliente</option>
                  <option value="WARM">Tibio</option>
                  <option value="COLD">Frío</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Calificación</label>
                <select value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white">
                  <option value="">Seleccionar</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-white/60 mb-1">Notas</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-white/60 hover:text-white">Cancelar</button>
                <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg">{editing ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
