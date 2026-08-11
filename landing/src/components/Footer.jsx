export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <span className="text-xl font-bold text-slate-900">Tu<span className="text-primary-500">Financiera</span></span>
            <p className="text-tertiary-500 text-sm mt-2">Tu solución financiera en Santa Fe</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-slate-900">Redes Sociales</h3>
            <div className="flex gap-4">
              <a href="#" className="text-tertiary-500 hover:text-primary-500 transition-colors"><span className="material-symbols-outlined">facebook</span></a>
              <a href="#" className="text-tertiary-500 hover:text-primary-500 transition-colors"><span className="material-symbols-outlined">camera</span></a>
              <a href="#" className="text-tertiary-500 hover:text-primary-500 transition-colors"><span className="material-symbols-outlined">music_note</span></a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-slate-900">Contacto</h3>
            <a href="https://wa.me/543422123456" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-tertiary-500 hover:text-secondary-600 transition-colors">
              <span className="material-symbols-outlined text-lg">chat</span> WhatsApp
            </a>
            <a href="mailto:info@tufinanciera.com"
              className="flex items-center gap-2 text-tertiary-500 hover:text-primary-500 transition-colors mt-2">
              <span className="material-symbols-outlined text-lg">mail</span> info@tufinanciera.com
            </a>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-8 text-center text-tertiary-400 text-sm">
          &copy; {new Date().getFullYear()} TuFinanciera. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}