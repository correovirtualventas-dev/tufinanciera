import apiClient from '../api/client';
import toast from 'react-hot-toast';
import { FileText, Download } from 'lucide-react';

const reports = [
  { label: 'Clientes', path: '/reports/clients' },
  { label: 'Préstamos Activos', path: '/reports/loans/active' },
  { label: 'Préstamos Vencidos', path: '/reports/loans/overdue' },
  { label: 'Pagos', path: '/reports/payments' },
  { label: 'Dashboard', path: '/reports/dashboard' },
  { label: 'Exchange', path: '/reports/exchange' },
  { label: 'Inversores', path: '/reports/investors' },
  { label: 'Balance Inversores', path: '/reports/investors/:id/balance' },
  { label: 'Caja', path: '/reports/cash-register' },
];

export default function Reports() {
  const downloadReport = async (path: string, label: string) => {
    try {
      const { data } = await apiClient.get(path, { responseType: 'blob' });
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${label.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      a.click();
      toast.success(`Descargando ${label}`);
    } catch {
      toast.error('Error al descargar reporte');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <button
            key={report.path}
            onClick={() => downloadReport(report.path, report.label)}
            className="bg-surface-100 rounded-xl p-6 border border-slate-100 hover:border-primary-500/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-500/10 rounded-lg text-primary-500 group-hover:bg-primary-500/20 transition-colors">
                <FileText size={24} />
              </div>
              <div className="flex-1">
                <p className="text-slate-900 font-semibold">{report.label}</p>
                <p className="text-slate-500 text-sm">PDF</p>
              </div>
              <Download size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
