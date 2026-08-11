import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-tau-lake-99.vercel.app';

export default function Modal({ onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '', lastName: '', dni: '', phone: '', email: '',
    address: '', localidad: '', activity: '', income: '', amount: '', installments: '', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/prospects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSuccess(true);
    } catch {
      alert('Error al enviar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center animate-fade-in shadow-2xl" onClick={e => e.stopPropagation()}>
          <span className="material-symbols-outlined text-6xl text-secondary-500 mb-4">check_circle</span>
          <h2 className="text-2xl font-bold mb-2 text-slate-900">¡Recibimos tu solicitud!</h2>
          <p className="text-tertiary-500 mb-6">Te contactaremos a la brevedad.</p>
          <button onClick={onClose} className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-full font-semibold">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Solicitar Préstamo</h2>
          <button onClick={onClose} className="text-tertiary-500 hover:text-slate-900"><span className="material-symbols-outlined">close</span></button>
        </div>

        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-primary-500' : 'bg-slate-200'}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-slate-200'}`} />
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold text-slate-900">Información Personal</h3>
              <div className="grid grid-cols-2 gap-4">
                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Nombre" required className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-primary-500" />
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Apellido" required className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-primary-500" />
                <input name="dni" value={form.dni} onChange={handleChange} placeholder="DNI" required className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-primary-500" />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" required className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-primary-500" />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Correo electrónico" className="col-span-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-primary-500" />
                <input name="address" value={form.address} onChange={handleChange} placeholder="Dirección" className="col-span-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-primary-500" />
                <input name="localidad" value={form.localidad} onChange={handleChange} placeholder="Localidad" className="col-span-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-primary-500" />
              </div>
              <button type="button" onClick={() => setStep(2)} className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-full font-semibold">Siguiente</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold text-slate-900">Información Financiera</h3>
              <div className="grid grid-cols-2 gap-4">
                <input name="activity" value={form.activity} onChange={handleChange} placeholder="Actividad" className="col-span-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-primary-500" />
                <input name="income" type="number" value={form.income} onChange={handleChange} placeholder="Ingresos mensuales" className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-primary-500" />
                <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Monto solicitado" className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-primary-500" />
                <input name="installments" type="number" value={form.installments} onChange={handleChange} placeholder="Cuotas" className="col-span-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-primary-500" />
                <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notas adicionales" rows={3} className="col-span-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-primary-500" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-full font-semibold">Anterior</button>
                <button type="submit" disabled={loading} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-full font-semibold disabled:opacity-50">
                  {loading ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}