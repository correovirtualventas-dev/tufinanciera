import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login } from '../api/auth';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
  const [nameOrEmail, setNameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(nameOrEmail, password);
      setAuth(result.token, result.user, result.user.role);
      toast.success('Inicio de sesión exitoso');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-400 flex items-center justify-center">
      <div className="bg-surface-100 p-8 rounded-2xl border border-white/10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            Tu<span className="text-primary-500">Financiera</span>
          </h1>
          <p className="text-white/60 mt-2">Inicia sesión para continuar</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Usuario o Email</label>
            <input
              type="text"
              value={nameOrEmail}
              onChange={(e) => setNameOrEmail(e.target.value)}
              className="w-full bg-surface-400 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="Ingresa tu usuario"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Contraseña</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="w-full px-4 py-3"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn size={18} />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
