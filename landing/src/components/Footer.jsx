export default function Footer() {
  return (
    <footer className="bg-surface-light border-t border-white/10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <span className="text-xl font-bold">Tu<span className="text-primary">Financiera</span></span>
            <p className="text-white/60 text-sm mt-2">Tu solución financiera en Santa Fe</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Redes Sociales</h3>
            <div className="flex gap-4">
              <a href="#" className="text-white/60 hover:text-primary transition-colors"><span className="material-symbols-outlined">facebook</span></a>
              <a href="#" className="text-white/60 hover:text-primary transition-colors"><span className="material-symbols-outlined">camera</span></a>
              <a href="#" className="text-white/60 hover:text-primary transition-colors"><span className="material-symbols-outlined">music_note</span></a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <a href="https://wa.me/543422123456" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/60 hover:text-secondary transition-colors">
              <span className="material-symbols-outlined text-lg">chat</span> WhatsApp
            </a>
            <a href="mailto:info@tufinanciera.com"
              className="flex items-center gap-2 text-white/60 hover:text-primary transition-colors mt-2">
              <span className="material-symbols-outlined text-lg">mail</span> info@tufinanciera.com
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-white/40 text-sm">
          &copy; {new Date().getFullYear()} TuFinanciera. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
