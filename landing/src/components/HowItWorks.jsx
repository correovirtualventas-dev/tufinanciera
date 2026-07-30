const steps = [
  { num: 1, title: 'Completá el formulario', desc: 'Contanos tus datos y el monto que necesitás.' },
  { num: 2, title: 'Evaluación IA', desc: 'Nuestro sistema analiza tu solicitud al instante.' },
  { num: 3, title: 'Aprobación', desc: 'Recibí una respuesta rápida, sin demoras.' },
  { num: 4, title: 'Recibí tu dinero', desc: 'El crédito se acredita en tu cuenta en el día.' },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 bg-surface-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">¿Cómo funciona?</h2>
        <p className="text-white/60 text-center mb-12">En 4 simples pasos</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                {step.num}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-white/60 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
