export default function Hero({ onSolicitar }) {
  return (
    <section id="inicio" className="min-h-screen bg-gradient-hero flex items-center pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl animate-fade-in">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-slate-900">
            Préstamos{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">rápidos y seguros</span>
            {' '}en Santa Fe
          </h1>
          <p className="text-lg sm:text-xl text-tertiary-500 mb-8">
            Obtené tu crédito en minutos. Sin demora, evaluación con IA y las mejores tasas del mercado.
          </p>
          <div className="flex flex-wrap gap-3 mb-12">
            <span className="px-4 py-2 bg-white rounded-full text-sm text-slate-700 border border-slate-200">✓ Sin demora</span>
            <span className="px-4 py-2 bg-white rounded-full text-sm text-slate-700 border border-slate-200">✓ Evaluación IA</span>
            <span className="px-4 py-2 bg-white rounded-full text-sm text-slate-700 border border-slate-200">✓ Mejores tasas</span>
          </div>
          <button onClick={onSolicitar}
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all hover:shadow-xl hover:shadow-primary-500/30 animate-pulse-primary">
            Solicitar mi préstamo
          </button>
        </div>
      </div>
    </section>
  );
}