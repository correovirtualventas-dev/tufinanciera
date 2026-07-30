import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClient, setClientPassword, addDocument, deleteDocument, addGuarantee, deleteGuarantee, addRelationship, deleteRelationship } from '../api/clients';
import { formatCurrency, formatDate } from '../lib/format';
import toast from 'react-hot-toast';
import { Plus, Trash2, FileText, Shield, Users, Key, Eye } from 'lucide-react';

export default function ClientDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState('profile');
  const [password, setPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const queryClient = useQueryClient();
  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => getClient(Number(id)),
  });

  const passwordMutation = useMutation({
    mutationFn: (pwd: string) => setClientPassword(Number(id), pwd),
    onSuccess: () => { toast.success('Contraseña actualizada'); setShowPasswordForm(false); setPassword(''); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Error'),
  });

  if (isLoading) return <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500 mx-auto mt-20" />;
  if (!client) return <div className="text-white/60 mt-20 text-center">Cliente no encontrado</div>;

  const tabs = [
    { key: 'profile', label: 'Perfil', icon: FileText },
    { key: 'loans', label: 'Préstamos', icon: Eye },
    { key: 'documents', label: 'Documentos', icon: FileText },
    { key: 'guarantees', label: 'Garantías', icon: Shield },
    { key: 'relationships', label: 'Relaciones', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{client.firstName} {client.lastName}</h1>
          <p className="text-white/60">DNI: {client.dni} {client.cuit ? `| CUIT: ${client.cuit}` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {client.score && (
            <span className={`px-3 py-1 rounded-full text-sm ${
              client.score >= 600 ? 'bg-secondary-500/10 text-secondary-500' :
              client.score >= 400 ? 'bg-amber/10 text-amber' : 'bg-red-500/10 text-red-500'
            }`}>
              Score: {client.score}
            </span>
          )}
          <button onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-100 border border-white/10 rounded-lg text-white/80 hover:text-white"
          >
            <Key size={16} /> {client.password ? 'Cambiar Contraseña' : 'Asignar Contraseña'}
          </button>
        </div>
      </div>

      {showPasswordForm && (
        <div className="bg-surface-100 rounded-xl p-4 border border-white/10 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm text-white/60 mb-1">Nueva Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface-400 border border-white/10 rounded-lg px-3 py-2 text-white" />
          </div>
          <button onClick={() => passwordMutation.mutate(password)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg">Guardar</button>
        </div>
      )}

      <div className="flex gap-1 bg-surface-100 rounded-xl p-1 border border-white/10">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              tab === t.key ? 'bg-primary-500 text-white' : 'text-white/60 hover:text-white'
            }`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-100 rounded-xl p-6 border border-white/5 space-y-4">
            <h3 className="text-white font-semibold">Información Personal</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-white/60">Teléfono:</span> <span className="text-white">{client.phone || '-'}</span></div>
              <div><span className="text-white/60">Email:</span> <span className="text-white">{client.email || '-'}</span></div>
              <div><span className="text-white/60">Dirección:</span> <span className="text-white">{client.address || '-'}</span></div>
              <div><span className="text-white/60">Localidad:</span> <span className="text-white">{client.localidad || '-'}</span></div>
              <div><span className="text-white/60">Actividad:</span> <span className="text-white">{client.activity || '-'}</span></div>
              <div><span className="text-white/60">Ingresos:</span> <span className="text-white">{client.income ? formatCurrency(client.income) : '-'}</span></div>
            </div>
          </div>
          <div className="bg-surface-100 rounded-xl p-6 border border-white/5 space-y-4">
            <h3 className="text-white font-semibold">Información Adicional</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-white/60">Aval:</span> <span className="text-white">{client.avalName || '-'}</span></div>
              <div><span className="text-white/60">Referido por:</span> <span className="text-white">{client.referidoPor || '-'}</span></div>
              <div><span className="text-white/60">Estado:</span> <span className={client.active ? 'text-secondary-500' : 'text-red-500'}>{client.active ? 'Activo' : 'Inactivo'}</span></div>
              <div><span className="text-white/60">Creado:</span> <span className="text-white">{formatDate(client.createdAt)}</span></div>
            </div>
            {client.notes && <div><span className="text-white/60">Notas:</span> <p className="text-white mt-1">{client.notes}</p></div>}
          </div>
        </div>
      )}

      {tab === 'loans' && (
        <div className="bg-surface-100 rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-white/60 text-sm">
                <th className="text-left py-3 px-4">ID</th>
                <th className="text-left py-3 px-4">Monto</th>
                <th className="text-left py-3 px-4">Cuotas</th>
                <th className="text-left py-3 px-4">Valor Cuota</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {client.loans?.map((loan: any) => (
                <tr key={loan.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">#{loan.id}</td>
                  <td className="py-3 px-4 text-white">{formatCurrency(loan.amount)}</td>
                  <td className="py-3 px-4 text-white/80">{loan.installments}</td>
                  <td className="py-3 px-4 text-white">{formatCurrency(loan.installmentAmount)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      loan.status === 'ACTIVE' ? 'bg-secondary-500/10 text-secondary-500' :
                      loan.status === 'OVERDUE' ? 'bg-red-500/10 text-red-500' :
                      'bg-tertiary-500/10 text-tertiary-500'
                    }`}>{loan.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Link to={`/loans/${loan.id}`} className="text-tertiary-500 hover:text-tertiary-400 text-sm">Ver detalle</Link>
                  </td>
                </tr>
              ))}
              {(!client.loans || client.loans.length === 0) && (
                <tr><td colSpan={6} className="py-8 text-center text-white/40">Sin préstamos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'documents' && <SubList title="Documentos" items={client.documents} fields={['type', 'name']} onAdd={(data: any) => addDocument(Number(id), data).then(() => queryClient.invalidateQueries({ queryKey: ['client', id] }))} onDelete={(itemId: number) => deleteDocument(Number(id), itemId).then(() => queryClient.invalidateQueries({ queryKey: ['client', id] }))} />}
      {tab === 'guarantees' && <SubList title="Garantías" items={client.guarantees} fields={['type', 'detail', 'value']} onAdd={(data: any) => addGuarantee(Number(id), data).then(() => queryClient.invalidateQueries({ queryKey: ['client', id] }))} onDelete={(itemId: number) => deleteGuarantee(Number(id), itemId).then(() => queryClient.invalidateQueries({ queryKey: ['client', id] }))} />}
      {tab === 'relationships' && <SubList title="Relaciones" items={client.relationships} fields={['name', 'relation', 'phone']} onAdd={(data: any) => addRelationship(Number(id), data).then(() => queryClient.invalidateQueries({ queryKey: ['client', id] }))} onDelete={(itemId: number) => deleteRelationship(Number(id), itemId).then(() => queryClient.invalidateQueries({ queryKey: ['client', id] }))} />}
    </div>
  );
}

function SubList({ title, items, fields, onAdd, onDelete }: {
  title: string;
  items: any[];
  fields: string[];
  onAdd: (data: any) => Promise<any>;
  onDelete: (id: number) => Promise<any>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd(form);
    setForm({});
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm">
          <Plus size={16} /> Agregar
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface-100 rounded-xl p-4 border border-white/10 grid grid-cols-4 gap-3">
          {fields.map(f => (
            <div key={f}>
              <label className="block text-xs text-white/60 mb-1 capitalize">{f}</label>
              <input value={form[f] || ''} onChange={e => setForm({ ...form, [f]: e.target.value })}
                className="w-full bg-surface-400 border border-white/10 rounded px-3 py-2 text-white text-sm" />
            </div>
          ))}
          <div className="flex items-end">
            <button type="submit" className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm">Agregar</button>
          </div>
        </form>
      )}
      <div className="bg-surface-100 rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-white/60 text-sm">
              {fields.map(f => <th key={f} className="text-left py-3 px-4 capitalize">{f}</th>)}
              <th className="text-right py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(items || []).map((item: any) => (
              <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                {fields.map(f => <td key={f} className="py-3 px-4 text-white">{item[f] ?? '-'}</td>)}
                <td className="py-3 px-4 text-right">
                  <button onClick={() => { if (confirm('¿Eliminar?')) onDelete(item.id); }}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
