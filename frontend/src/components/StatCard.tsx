import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
}

export default function StatCard({ title, value, icon: Icon, color = 'primary' }: StatCardProps) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary-500/10 text-primary-500',
    secondary: 'bg-secondary-500/10 text-secondary-500',
    tertiary: 'bg-tertiary-500/10 text-tertiary-500',
    amber: 'bg-amber/10 text-amber',
    red: 'bg-red-500/10 text-red-500',
  };

  return (
    <div className="bg-surface-100 rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">
            {typeof value === 'number' ? value.toLocaleString('es-AR') : value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color] || colorMap.primary}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
