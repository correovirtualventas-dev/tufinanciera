import { useState } from 'react';
import toast from 'react-hot-toast';
import { verifyPassword } from '../api/auth';
import { Lock, Loader2 } from 'lucide-react';

interface PasswordModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function PasswordModal({ open, title, description, onClose, onConfirm }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      await verifyPassword(password);
      setPassword('');
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Clave incorrecta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-surface-100 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 p-2 rounded-lg">
              <Lock size={20} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              {description && <p className="text-sm text-slate-500">{description}</p>}
            </div>
          </div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Ingresá tu clave para confirmar"
            autoFocus
            required
            className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 hover:text-slate-900">Cancelar</button>
            <button type="submit" disabled={loading} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />} Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}