import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard, Users, Handshake, DollarSign, BarChart3,
  ShieldCheck, Megaphone, Settings, TrendingUp, Target, Building2,
  PiggyBank, Receipt, ScrollText,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN'] },
  { to: '/clients', icon: Users, label: 'Clientes', roles: ['ADMIN'] },
  { to: '/loans', icon: Handshake, label: 'Préstamos', roles: ['ADMIN'] },
  { to: '/payments', icon: DollarSign, label: 'Cobros', roles: ['ADMIN'] },
  { to: '/scoring', icon: ShieldCheck, label: 'Scoring', roles: ['ADMIN'] },
  { to: '/reports', icon: BarChart3, label: 'Reportes', roles: ['ADMIN'] },
  { to: '/accounting', icon: Receipt, label: 'Contabilidad', roles: ['ADMIN'] },
  { to: '/exchange', icon: TrendingUp, label: 'Exchange', roles: ['ADMIN'] },
  { to: '/investors', icon: PiggyBank, label: 'Inversores', roles: ['ADMIN'] },
  { to: '/prospects', icon: Target, label: 'Prospectos', roles: ['ADMIN'] },
  { to: '/alerts', icon: Megaphone, label: 'Alertas', roles: ['ADMIN'] },
  { to: '/cotizador', icon: ScrollText, label: 'Cotizador', roles: ['ADMIN'] },
  { to: '/settings', icon: Settings, label: 'Configuración', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const role = useAuthStore((s) => s.role);

  const filtered = navItems.filter((item) => item.roles.includes(role || ''));

  return (
    <aside className="w-sidebar bg-surface-100 border-r border-white/10 flex flex-col h-full">
      <div className="h-topbar flex items-center px-6 border-b border-white/10">
        <h1 className="text-lg font-bold text-white">
          Tu<span className="text-primary-500">Financiera</span>
        </h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {filtered.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-primary-500/10 text-primary-500 border-r-2 border-primary-500'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
