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
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-surface-light rounded-2xl p-8 w-full max-w-md text-center animate-fade-in" onClick={e => e.stopPropagation()}>
          <span className="material-symbols-outlined text-6xl text-secondary mb-4">check_circle</span>
          <h2 className="text-2xl font-bold mb-2">¡Recibimos tu solicitud!</h2>
          <p className="text-white/60 mb-6">Te contactaremos a la brevedad.</p>
          <button onClick={onClose} className="bg-primary text-white px-8 py-3 rounded-full font-semibold">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface-light rounded-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Solicitar Préstamo</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white"><span className="material-symbols-outlined">close</span></button>
        </div>

        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-white/10'}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-white/10'}`} />
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold">Información Personal</h3>
              <div className="grid grid-cols-2 gap-4">
                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Nombre" required className="col-span-2 sm:col-span-1 bg-surface border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Apellido" required className="col-span-2 sm:col-span-1 bg-surface border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
                <input name="dni" value={form.dni} onChange={handleChange} placeholder="DNI" required className="bg-surface border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" required className="bg-surface border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="col-span-2 bg-surface border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
                <input name="address" value={form.address} onChange={handleChange} placeholder="Dirección" className="col-span-2 bg-surface border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
                <input name="localidad" value={form.localidad} onChange={handleChange} placeholder="Localidad" className="col-span-2 bg-surface border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
              </div>
              <button type="button" onClick={() => setStep(2)} className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-full font-semibold">Siguiente</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold">Información Financiera</h3>
              <div className="grid grid-cols-2 gap-4">
                <input name="activity" value={form.activity} onChange={handleChange} placeholder="Actividad" className="col-span-2 bg-surface border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
                <input name="income" type="number" value={form.income} onChange={handleChange} placeholder="Ingresos mensuales" className="bg-surface border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
                <input name="amount" type="number" value={form.amount} onChange={handleChange} placeholder="Monto solicitado" className="bg-surface border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
                <input name="installments" type="number" value={form.installments} onChange={handleChange} placeholder="Cuotas" className="col-span-2 bg-surface border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
                <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notas adicionales" rows={3} className="col-span-2 bg-surface border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-full font-semibold">Anterior</button>
                <button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-full font-semibold disabled:opacity-50">
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
