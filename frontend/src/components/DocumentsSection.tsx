import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { addDocument, deleteDocument } from '../api/clients';
import { compressImage } from '../lib/image';
import { formatDate } from '../lib/format';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload, X } from 'lucide-react';

const DOC_CATEGORIES = ['DNI Frente', 'DNI Dorso', 'Recibo de Sueldo', 'Impuesto o Servicio', 'Otros'];
const NEW_CATEGORY = '__new__';
const MAX_DOCS = 5;

interface DocumentsSectionProps {
  clientId: number;
  documents: any[];
}

export default function DocumentsSection({ clientId, documents }: DocumentsSectionProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ dataUrl: string; fileName: string } | null>(null);
  const [category, setCategory] = useState(DOC_CATEGORIES[0]);
  const [newCategory, setNewCategory] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['client', clientId] });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }
    if ((documents?.length || 0) >= MAX_DOCS) {
      toast.error(`Máximo ${MAX_DOCS} documentos por cliente`);
      return;
    }
    const dataUrl = await compressImage(file);
    setCategory(DOC_CATEGORIES[0]);
    setNewCategory('');
    setDescription('');
    setPending({ dataUrl, fileName: file.name });
  };

  const handleUpload = async () => {
    if (!pending) return;
    const finalCategory = category === NEW_CATEGORY ? newCategory.trim() : category;
    if (category === NEW_CATEGORY && !finalCategory) {
      toast.error('Ingresá el nombre de la nueva categoría');
      return;
    }
    setUploading(true);
    try {
      await addDocument(clientId, {
        type: finalCategory,
        name: description || pending.fileName,
        url: pending.dataUrl,
      });
      toast.success('Documento cargado');
      setPending(null);
      setNewCategory('');
      setDescription('');
      invalidate();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al cargar documento');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('¿Eliminar documento?')) return;
    await deleteDocument(clientId, docId);
    toast.success('Documento eliminado');
    invalidate();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => {
          if ((documents?.length || 0) >= MAX_DOCS) {
            toast.error(`Máximo ${MAX_DOCS} documentos por cliente`);
            return;
          }
          fileInputRef.current?.click();
        }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm">
          <Plus size={16} /> Agregar Documento
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {pending && (
        <div className="bg-surface-100 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="w-32 h-40 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200">
            <img src={pending.dataUrl} alt="Vista previa" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 truncate">{pending.fileName}</p>
              <button onClick={() => setPending(null)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-1">Tipo de Documento</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900">
                {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                <option value={NEW_CATEGORY}>Nueva categoría...</option>
              </select>
              {category === NEW_CATEGORY && (
                <input value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  placeholder="Nombre de la nueva categoría"
                  className="mt-2 w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
              )}
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-1">Descripción {category === 'Otros' && <span className="text-slate-400">(título automotor, inmueble, etc.)</span>}</label>
              <input value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Detalle opcional"
                className="w-full bg-surface-400 border border-slate-200 rounded-lg px-3 py-2 text-slate-900" />
            </div>
            <button onClick={handleUpload} disabled={uploading}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
              <Upload size={16} /> {uploading ? 'Cargando...' : 'Cargar'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-surface-100 rounded-xl border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-sm">
              <th className="text-left py-3 px-4">Vista Previa</th>
              <th className="text-left py-3 px-4">Tipo</th>
              <th className="text-left py-3 px-4">Descripción</th>
              <th className="text-left py-3 px-4">Fecha</th>
              <th className="text-right py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(documents || []).map((doc: any) => (
              <tr key={doc.id} className="border-b border-slate-100 hover:bg-slate-100">
                <td className="py-2 px-4">
                  <a href={doc.url} target="_blank" rel="noreferrer">
                    <img src={doc.url} alt={doc.type} className="w-16 h-12 object-cover rounded border border-slate-200" />
                  </a>
                </td>
                <td className="py-3 px-4 text-slate-900">{doc.type || '-'}</td>
                <td className="py-3 px-4 text-slate-700">{doc.name || '-'}</td>
                <td className="py-3 px-4 text-slate-700">{doc.createdAt ? formatDate(doc.createdAt) : '-'}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleDelete(doc.id)}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {!documents?.length && (
              <tr><td colSpan={5} className="py-8 text-center text-slate-400">Sin documentos cargados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
