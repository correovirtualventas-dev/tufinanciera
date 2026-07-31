export default function Services({ onClient, onInvestor, onSolicitar }) {
  const services = [
    {
      title: 'Préstamos Personales',
      desc: 'Créditos rápidos desde $10,000 hasta $1,000,000. Evaluación instantánea con IA.',
      icon: 'payments',
      actions: (
        <div className="flex gap-3 mt-4">
          <button onClick={onSolicitar} className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-full text-sm font-semibold transition-all">Solicitar</button>
          <button onClick={onClient} className="flex-1 bg-amber/20 text-amber hover:bg-amber/30 py-3 rounded-full text-sm font-semibold transition-all border border-amber/30">Soy Cliente</button>
        </div>
      ),
    },
    {
      title: 'Inversiones',
      desc: 'Invertí con nosotros y obtené rendimientos diarios. Consultá tu saldo en línea.',
      icon: 'trending_up',
      actions: (
        <button onClick={onInvestor} className="w-full bg-secondary text-surface py-3 rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:shadow-secondary/25 mt-4">
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
          className="block w-full bg-white/5 border border-white/10 text-white hover:bg-white/10 py-3 rounded-full text-sm font-semibold transition-all text-center mt-4">
          Contactanos
        </a>
      ),
    },
  ];

  return (
    <section id="servicios" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Nuestros Servicios</h2>
        <p className="text-white/60 text-center mb-12 max-w-2xl mx-auto">Soluciones financieras diseñadas para vos</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div key={i} className="bg-surface-light rounded-2xl p-8 border border-white/10 hover:border-primary/50 transition-all group">
              <span className="material-symbols-outlined text-4xl text-primary mb-4">{s.icon}</span>
              <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
              {s.actions}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
