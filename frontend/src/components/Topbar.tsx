import { useAuthStore } from '../store/authStore';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-topbar bg-surface-100 border-b border-slate-200 flex items-center justify-between px-6">
      <div className="text-slate-500 text-sm">Panel de AdministraciÃ³n</div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-700">
          <User size={18} />
          <span className="text-sm">{user?.name || user?.firstName || 'Usuario'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors text-sm"
        >
          <LogOut size={16} />
          Salir
        </button>
      </div>
    </header>
  );
}
