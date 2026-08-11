import { useState } from 'react';

const faqs = [
  { q: '¿Qué requisitos necesito para solicitar un préstamo?', a: 'DNI argentino, comprobante de ingresos, residencia en Santa Fe y ser mayor de 18 años.' },
  { q: '¿Cuánto tiempo tarda la aprobación?', a: 'La evaluación con IA es instantánea. En minutos tenés una respuesta.' },
  { q: '¿Cuáles son las tasas de interés?', a: 'Ofrecemos tasas competitivas desde 60% TNA. El porcentaje exacto depende de tu perfil crediticio.' },
  { q: '¿Puedo pagar anticipadamente?', a: 'Sí, podés cancelar tu préstamo anticipadamente sin penalidades.' },
  { q: '¿Cómo invierto con ustedes?', a: 'Contactanos para conocer las opciones de inversión con rendimientos diarios atractivos.' },
  { q: '¿Hacen envíos al interior?', a: 'Operamos en toda la provincia de Santa Fe.' },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-slate-900">Preguntas Frecuentes</h2>
        <p className="text-tertiary-500 text-center mb-12">Todo lo que necesitás saber</p>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full text-left px-6 py-4 flex justify-between items-center">
                <span className="font-medium text-sm sm:text-base text-slate-900">{faq.q}</span>
                <span className={`material-symbols-outlined transition-transform text-tertiary-400 ${openIndex === i ? 'rotate-180' : ''}`}>expand_more</span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-4 text-tertiary-500 text-sm animate-fade-in">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
