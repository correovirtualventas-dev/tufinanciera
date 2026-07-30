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
    <header className="h-topbar bg-surface-100 border-b border-white/10 flex items-center justify-between px-6">
      <div className="text-white/60 text-sm">Panel de Administración</div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-white/80">
          <User size={18} />
          <span className="text-sm">{user?.name || user?.firstName || 'Usuario'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-white/60 hover:text-white transition-colors text-sm"
        >
          <LogOut size={16} />
          Salir
        </button>
      </div>
    </header>
  );
}
