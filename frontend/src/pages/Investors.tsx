import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInvestors, createInvestor, updateInvestor, deleteInvestor, setInvestorPassword } from '../api/investors';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Eye, Key } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';
import { formatCurrency } from '../lib/format';

export default function Investors() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordModal, setPasswordModal] = useState({ open: false, id: 0, name: '' });
  const [password, setPassword] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ clientId: '', name: '', tna: 0, currency: 'ARS', active: true });

  const queryClient = useQueryClient();
  const { data: investors } = useQuery({ queryKey: ['investors'], queryFn: getInvestors });

  const createMutation = useMutation({
    mutationFn: (data: any) => editing ? updateInvestor(editing.id, data) : createInvestor(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['investors'] }); setModalOpen(false); setEditing(null); toast.success(editing ? 'Inversor actualizado' : 'Inversor creado'); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInvestor,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['investors'] }); toast.success('Inversor eliminado'); },
  });

  const passwordMutation = useMutation({
    mutationFn: ({ id, pwd }: { id: number; pwd: string }) => setInvestorPassword(id, pwd),
    onSuccess: () => { toast.success('Contraseña actualizada'); setPasswordModal({ open: false, id: 0, name: '' }); setPassword(''); },
  });

  const filtered = (investors || []).filter((i: any) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Inversores</h1>
        <button onClick={() => { setEditing(null); setForm({ clientId: '', name: '', tna: 0, currency: 'ARS', active: true }); setModalOpen(true); }}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Nuevo Inversor
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar inversor..."
          className="w-full bg-surface-100 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white" />
      </div>

      <div className="bg-surface-100 rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-white/60 text-sm">
              <th className="text-left py-3 px-4">Nombre</th>
              <th className="text-center py-3 px-4">TNA</th>
              <th className="text-center py-3 px-4">Moneda</th>
              <th className="text-center py-3 px-4">Estado</th>
              <th className="text-right py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv: any) => (
              <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 px-4">
                  <Link to={`/investors/${inv.id}`} className="text-white hover:text-primary-500">{inv.name}</Link>
                </td>
                <td className="py-3 px-4 text-center text-white/80">{inv.tna}%</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${inv.currency === 'ARS' ? 'bg-secondary-500/10 text-secondary-500' : 'bg-tertiary-500/10 text-tertiary-500'}`}>
                    {inv.currency}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${inv.active ? 'bg-secondary-500/10 text-secondary-500' : 'bg-red-500/10 text-red-500'}`}>
                    {inv.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Link to={`/investors/${inv.id}`} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-tertiary-500 inline-block"><Eye size={16} /></Link>
                  <button onClick={() => { setEditing(inv); setForm({ clientId: inv.clientId || '', name: inv.name, tna: inv.tna, currency: inv.currency, active: inv.active }); setModalOpen(true); }}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-primary-500"><Edit2 size={16} /></button>
                  <button onClick={() => setPasswordModal({ open: true, id: inv.id, name: inv.name })}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-amber"><Key size={16} /></button>
                  <button onClick={() => { if (confirm('¿Eliminar inversor?')) deleteMutation.mutate(inv.id); }}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-red-500"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setModalOpen(false)}>
          <div className="bg-surface-100 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">{editing ? 'Editar' : 'Nuevo'} Inversor</h2>
            <form onSubmit={e => { e.preventDefault(); createMutation.mutate({ ...form, clientId: form.clientId ? Number(form.clientId) : undefined }); }} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Nombre *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">TNA (%) *</label>
                <input type="number" step="0.01" required value={form.tna} onChange={e => setForm({ ...form, tna: Number(e.target.value) })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Moneda</label>
                <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white">
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="accent-primary-500" />
                <span className="text-white">Activo</span>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-white/60 hover:text-white">Cancelar</button>
                <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg">{editing ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setPasswordModal({ open: false, id: 0, name: '' })}>
          <div className="bg-surface-100 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-2">Contraseña para {passwordModal.name}</h2>
            <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Nueva contraseña" className="w-full px-3 py-2 mb-4" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setPasswordModal({ open: false, id: 0, name: '' })} className="px-4 py-2 text-white/60 hover:text-white">Cancelar</button>
              <button onClick={() => passwordMutation.mutate({ id: passwordModal.id, pwd: password })} className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
