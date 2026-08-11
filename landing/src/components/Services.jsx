export default function Services({ onClient, onInvestor, onSolicitar }) {
  const services = [
    {
      title: 'Préstamos Personales',
      desc: 'Créditos rápidos desde $10,000 hasta $1,000,000. Evaluación instantánea con IA.',
      icon: 'payments',
      actions: (
        <div className="flex gap-3 mt-4">
          <button onClick={onSolicitar} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-full text-sm font-semibold transition-all">Solicitar</button>
          <button onClick={onClient} className="flex-1 bg-primary-50 text-primary-600 hover:bg-primary-100 py-3 rounded-full text-sm font-semibold transition-all border border-primary-200">Soy Cliente</button>
        </div>
      ),
    },
    {
      title: 'Inversiones',
      desc: 'Invertí con nosotros y obtené rendimientos diarios. Consultá tu saldo en línea.',
      icon: 'trending_up',
      actions: (
        <button onClick={onInvestor} className="w-full bg-secondary-500 hover:bg-secondary-600 text-black py-3 rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:shadow-secondary-500/25 mt-4">
            Inversor
        </button>
      ),
    },
    {
      title: 'Cambio de Divisas',
      desc: 'Compra y venta de dólares al mejor tipo de cambio. Operaciones rápidas y seguras.',
      icon: 'currency_exchange',
      actions: (
        <a href="https://wa.me/543422123456?text=Quiero%20información%20sobre%20exchange" target="_blank" rel="noopener noreferrer"
          className="block w-full bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 py-3 rounded-full text-sm font-semibold transition-all text-center mt-4">
          Contactanos
        </a>
      ),
    },
  ];

  return (
    <section id="servicios" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-slate-900">Nuestros Servicios</h2>
        <p className="text-tertiary-500 text-center mb-12 max-w-2xl mx-auto">Soluciones financieras diseñadas para vos</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-primary-500/50 transition-all group shadow-sm">
              <span className="material-symbols-outlined text-4xl text-primary-500 mb-4">{s.icon}</span>
              <h3 className="text-xl font-semibold mb-3 text-slate-900">{s.title}</h3>
              <p className="text-tertiary-500 text-sm leading-relaxed">{s.desc}</p>
              {s.actions}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
