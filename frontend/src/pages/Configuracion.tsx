import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Save, Upload, Download } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';

export default function Configuracion() {
  const [tab, setTab] = useState('users');
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'ADMIN' });
  const [editingUser, setEditingUser] = useState<any>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => apiClient.get('/admin/users').then(r => r.data) });
  const { data: settingsData } = useQuery({ queryKey: ['settings'], queryFn: () => apiClient.get('/admin/settings').then(r => r.data) });

  const createUserMutation = useMutation({
    mutationFn: (data: any) => editingUser
      ? apiClient.patch(`/admin/users/${editingUser.id}`, data)
      : apiClient.post('/admin/users', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success(editingUser ? 'Usuario actualizado' : 'Usuario creado'); setUserForm({ name: '', email: '', password: '', role: 'ADMIN' }); setEditingUser(null); },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/admin/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('Usuario eliminado'); },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: (data: Record<string, string>) => Promise.all(
      Object.entries(data).map(([key, value]) => apiClient.post(`/admin/settings/${key}`, { value }))
    ),
    onSuccess: () => { toast.success('Configuración guardada'); queryClient.invalidateQueries({ queryKey: ['settings'] }); },
  });

  const handleBackup = async () => {
    try {
      const { data } = await apiClient.get('/admin/backup');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `backup-${new Date().toISOString().split('T')[0]}.json`; a.click();
      toast.success('Backup descargado');
    } catch { toast.error('Error al hacer backup'); }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await apiClient.post('/admin/restore', JSON.parse(text));
      toast.success('Datos restaurados');
      queryClient.invalidateQueries();
    } catch { toast.error('Error al restaurar'); }
  };

  const tabs = [
    { key: 'users', label: 'Usuarios' },
    { key: 'settings', label: 'Configuración' },
    { key: 'backup', label: 'Backup/Restore' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>

      <div className="flex gap-1 bg-surface-100 rounded-xl p-1 border border-slate-200">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${tab === t.key ? 'bg-primary-500 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
            <h3 className="text-slate-900 font-semibold mb-4">{editingUser ? 'Editar' : 'Nuevo'} Usuario</h3>
            <form onSubmit={e => { e.preventDefault(); createUserMutation.mutate(userForm); }} className="grid grid-cols-2 gap-4">
              <input type="text" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} placeholder="Nombre" required className="bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              <input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} placeholder="Email" required className="bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              <PasswordInput value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder={editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña'} className="w-full px-3 py-2" />
              <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} className="bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
                <option value="ADMIN">Admin</option>
                <option value="USER">Usuario</option>
              </select>
              <div className="col-span-2 flex gap-3">
                <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Save size={16} /> {editingUser ? 'Actualizar' : 'Crear'}</button>
                {editingUser && <button type="button" onClick={() => { setEditingUser(null); setUserForm({ name: '', email: '', password: '', role: 'ADMIN' }); }} className="text-slate-500 hover:text-slate-900">Cancelar</button>}
              </div>
            </form>
          </div>

          <div className="bg-surface-100 rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-sm">
                  <th className="text-left py-3 px-4">Nombre</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Rol</th>
                  <th className="text-center py-3 px-4">Estado</th>
                  <th className="text-right py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(users || []).map((u: any) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-100">
                    <td className="py-3 px-4 text-slate-900">{u.name}</td>
                    <td className="py-3 px-4 text-slate-700">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-primary-500/10 text-primary-500">{u.role}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${u.active ? 'bg-secondary-500/10 text-secondary-500' : 'bg-red-500/10 text-red-500'}`}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => { setEditingUser(u); setUserForm({ name: u.name, email: u.email, password: '', role: u.role }); }} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-primary-500"><Edit2 size={16} /></button>
                      <button onClick={() => deleteUserMutation.mutate(u.id)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-red-500"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
          <h3 className="text-slate-900 font-semibold mb-4">Configuración del Sistema</h3>
          <div className="space-y-4">
            {['initialCapital', 'alertDays', 'interestRate', 'maxInstallments', 'minAmount', 'maxAmount'].map(key => (
              <div key={key}>
                <label className="block text-sm text-slate-500 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  type="text"
                  value={settings[key] ?? settingsData?.[key] ?? ''}
                  onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                  className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
            ))}
            <button onClick={() => saveSettingsMutation.mutate(settings)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg">
              Guardar Configuración
            </button>
          </div>
        </div>
      )}

      {tab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
            <h3 className="text-slate-900 font-semibold mb-4">Backup</h3>
            <p className="text-slate-500 mb-4">Descargar copia de seguridad de todos los datos</p>
            <button onClick={handleBackup} className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg flex items-center gap-2">
              <Download size={18} /> Descargar Backup
            </button>
          </div>
          <div className="bg-surface-100 rounded-xl p-6 border border-slate-100">
            <h3 className="text-slate-900 font-semibold mb-4">Restaurar</h3>
            <p className="text-slate-500 mb-4">Seleccionar archivo JSON de backup para restaurar</p>
            <label className="bg-tertiary-500 hover:bg-tertiary-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer w-fit">
              <Upload size={18} /> Restaurar Backup
              <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
