import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClients, createClient, updateClient, deleteClient, toggleClientActive } from '../api/clients';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, Eye } from 'lucide-react';
import PasswordModal from '../components/PasswordModal';

export default function Clients() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', dni: '', cuit: '', phone: '', email: '',
    address: '', localidad: '', activity: '', income: '', notes: '', avalName: '', referidoPor: '',
  });

  const queryClient = useQueryClient();
  const { data: clients } = useQuery({
    queryKey: ['clients', search],
    queryFn: () => getClients({ search, active: undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => editing ? updateClient(editing.id, data) : createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setModalOpen(false);
      setEditing(null);
      toast.success(editing ? 'Cliente actualizado' : 'Cliente creado');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Ha ocurrido un error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Cliente eliminado');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleClientActive,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });

  const handleEdit = (client: any) => {
    setEditing(client);
    setForm({
      firstName: client.firstName || '', lastName: client.lastName || '', dni: client.dni || '',
      cuit: client.cuit || '', phone: client.phone || '', email: client.email || '',
      address: client.address || '', localidad: client.localidad || '', activity: client.activity || '',
      income: client.income ? Number(client.income).toLocaleString('es-AR') : '', notes: client.notes || '', avalName: client.avalName || '',
      referidoPor: client.referidoPor || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const income = typeof form.income === 'string'
      ? Number(form.income.replace(/\./g, '')) || 0
      : form.income;
    createMutation.mutate({ ...form, income });
  };

  const itemsPerPage = 10;
  const paginatedClients = (clients || []).slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const totalPages = Math.ceil((clients || []).length / itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
        <button
          onClick={() => { setEditing(null); setForm({ firstName: '', lastName: '', dni: '', cuit: '', phone: '', email: '', address: '', localidad: '', activity: '', income: '', notes: '', avalName: '', referidoPor: '' }); setModalOpen(true); }}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder="Buscar por nombre, apellido o DNI..."
          className="w-full bg-surface-100 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-slate-900 focus:outline-none focus:border-primary-500"
        />
      </div>

      <div className="bg-surface-100 rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-sm">
                <th className="text-left py-4 px-4">Nombre</th>
                <th className="text-left py-4 px-4">DNI</th>
                <th className="text-left py-4 px-4">Teléfono</th>
                <th className="text-center py-4 px-4">Puntaje</th>
                <th className="text-center py-4 px-4">Estado</th>
                <th className="text-right py-4 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients?.map((client: any) => (
                <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-100">
                  <td className="py-3 px-4">
                    <Link to={`/clients/${client.id}`} className="text-slate-900 hover:text-primary-500">
                      {client.firstName} {client.lastName}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{client.dni}</td>
                  <td className="py-3 px-4 text-slate-700">{client.phone || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      client.score >= 600 ? 'bg-secondary-500/10 text-secondary-500' :
                      client.score >= 400 ? 'bg-amber/10 text-amber' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {client.score || 'S/D'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      client.active ? 'bg-secondary-500/10 text-secondary-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {client.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/clients/${client.id}`} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-tertiary-500">
                        <Eye size={16} />
                      </Link>
                      <button onClick={() => handleEdit(client)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-primary-500">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => toggleMutation.mutate(client.id)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-secondary-500">
                        {client.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button onClick={() => setDeleteTarget(client)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-slate-200">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`px-3 py-1 rounded ${page === i ? 'bg-primary-500 text-white' : 'bg-surface-400 text-slate-500 hover:text-slate-900'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModalOpen(false)}>
          <div className="bg-surface-100 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{editing ? 'Editar' : 'Nuevo'} Cliente</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm text-slate-500 mb-1">Nombre *</label>
                <input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm text-slate-500 mb-1">Apellido *</label>
                <input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">DNI *</label>
                <input required value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">CUIT</label>
                <input value={form.cuit} onChange={e => setForm({ ...form, cuit: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Teléfono</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Correo electrónico</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-slate-500 mb-1">Dirección</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Localidad</label>
                <input value={form.localidad} onChange={e => setForm({ ...form, localidad: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Actividad</label>
                <input value={form.activity} onChange={e => setForm({ ...form, activity: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Ingresos</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.income}
                    onChange={e => {
                      const digits = e.target.value.replace(/[^\d]/g, '');
                      const num = digits ? parseInt(digits, 10) : 0;
                      setForm({ ...form, income: num ? num.toLocaleString('es-AR') : '' });
                    }}
                    className="w-full bg-surface-400 border border-slate-200 rounded-lg pl-8 px-3 py-2 text-slate-900"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Aval</label>
                <input value={form.avalName} onChange={e => setForm({ ...form, avalName: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Referido por</label>
                <input value={form.referidoPor} onChange={e => setForm({ ...form, referidoPor: e.target.value })} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-slate-500 mb-1">Notas</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              </div>
              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-900">Cancelar</button>
                <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg">{editing ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PasswordModal
        open={!!deleteTarget}
        title="Eliminar cliente"
        description={deleteTarget ? `¿Eliminar a ${deleteTarget.firstName} ${deleteTarget.lastName}? Esta acción no se puede deshacer.` : undefined}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
