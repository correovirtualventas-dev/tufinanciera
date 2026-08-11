import { useState } from 'react';

const links = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'como-funciona', label: 'Cómo Funciona' },
  { id: 'faq', label: 'FAQ' },
];

export default function Navbar({ activeSection, onSolicitar, onCotizador }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-900">Tu<span className="text-primary-500">Financiera</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <button key={link.id} onClick={() => scrollTo(link.id)}
                className={`text-sm transition-colors ${activeSection === link.id ? 'text-primary-500 font-medium' : 'text-tertiary-500 hover:text-slate-900'}`}>
                {link.label}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={onCotizador} className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2">Cotizador</button>
            <button onClick={onSolicitar} className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary-500/25">
              Solicitar ahora
            </button>
          </div>
          <button className="md:hidden text-slate-900" onClick={() => setMobileOpen(!mobileOpen)}>
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {links.map((link) => (
              <button key={link.id} onClick={() => scrollTo(link.id)}
                className={`block w-full text-left px-4 py-2 text-sm ${activeSection === link.id ? 'text-primary-500' : 'text-tertiary-500'}`}>
                {link.label}
              </button>
            ))}
            <button onClick={onSolicitar} className="w-full bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-semibold mt-2">Solicitar ahora</button>
          </div>
        )}
      </div>
    </nav>
  );
}