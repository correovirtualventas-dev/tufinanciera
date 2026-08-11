import { useState } from 'react';

const responses = {
  prestamo: '¿Querés solicitar un crédito? Hacé clic en "Solicitar ahora" en la parte superior.',
  cotizador: 'Usá nuestro cotizador para simular tu cuota.',
  inversiones: 'Invertí con nosotros y obtené rendimientos diarios. ¿Querés conocer tu rendimiento?',
  contacto: 'Contactanos por WhatsApp al 3422123456 o escribinos a info@tufinanciera.com',
};

const quickReplies = [
  { id: 'prestamo', label: 'Conocé sobre créditos', keywords: ['credito', 'préstamo', 'prestamo', 'solicitar'] },
  { id: 'cotizador', label: 'Simulá tu cuota', keywords: ['simular', 'cuota', 'cotizar', 'calcular'] },
  { id: 'inversiones', label: 'Información de inversiones', keywords: ['inversion', 'inversiones', 'rendimiento', 'invertir'] },
  { id: 'contacto', label: 'Hablar con un asesor', keywords: ['asesor', 'contacto', 'whatsapp', 'ayuda'] },
];

export default function ChatBot({ onOpenClient, onOpenInvestor, onOpenCotizador }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ type: 'bot', text: '¡Hola! Soy el asistente de TuFinanciera. ¿En qué puedo ayudarte?' }]);
  const [input, setInput] = useState('');
  const [showSubmenu, setShowSubmenu] = useState(null);

  const addBotMessage = (text) => setMessages(prev => [...prev, { type: 'bot', text }]);

  const handleQuickReply = (id) => {
    setMessages(prev => [...prev, { type: 'user', text: quickReplies.find(r => r.id === id)?.label || '' }]);
    if (id === 'prestamo') {
      addBotMessage('Hacé clic en "Solicitar préstamo" para abrir el formulario.');
      setTimeout(() => { onOpenClient(); }, 500);
    } else if (id === 'cotizador') {
      addBotMessage(responses.cotizador);
      setTimeout(() => { onOpenCotizador(); }, 500);
    } else if (id === 'inversiones') {
      setShowSubmenu('inversiones');
      addBotMessage('Tenemos opciones de inversión con rendimientos diarios. ¿Querés conocer tu rendimiento como inversor?');
    } else if (id === 'contacto') {
      addBotMessage(responses.contacto);
    }
  };

  const handleSubmenuAction = (action) => {
    if (action === 'rendimiento') {
      addBotMessage('Podés consultar tu rendimiento como inversor.');
      setTimeout(() => { onOpenInvestor(); }, 500);
    }
    setShowSubmenu(null);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { type: 'user', text: input }]);
    const lower = input.toLowerCase();
    let found = false;
    for (const reply of quickReplies) {
      if (reply.keywords.some(k => lower.includes(k))) {
        setTimeout(() => handleQuickReply(reply.id), 300);
        found = true;
        break;
      }
    }
    if (!found) {
      addBotMessage('No entendí tu consulta. Por favor, elegí una de las opciones o contactanos por WhatsApp.');
    }
    setInput('');
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:shadow-primary-500/30 transition-all animate-pulse-primary">
          <span className="material-symbols-outlined text-white">chat</span>
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[500px] animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <span className="font-semibold text-slate-900">Asistente</span>
            <button onClick={() => setOpen(false)} className="text-tertiary-500 hover:text-slate-900"><span className="material-symbols-outlined">close</span></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${msg.type === 'user' ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {showSubmenu === 'inversiones' && (
              <div className="flex gap-2">
                <button onClick={() => handleSubmenuAction('rendimiento')} className="bg-secondary-500/10 text-secondary-600 border border-secondary-500/30 px-4 py-2 rounded-full text-sm">Conocé tu rendimiento</button>
                <button onClick={() => { addBotMessage('Contactanos para más información sobre inversiones.'); setShowSubmenu(null); }} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm">Más info</button>
              </div>
            )}
          </div>
          {showSubmenu === null && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickReplies.map(r => (
                <button key={r.id} onClick={() => handleQuickReply(r.id)} className="bg-slate-100 border border-slate-200 hover:border-primary-500/50 text-slate-700 text-xs px-3 py-1.5 rounded-full transition-colors">{r.label}</button>
              ))}
            </div>
          )}
          <form onSubmit={handleSend} className="p-4 border-t border-slate-200 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Escribí tu consulta..." className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-slate-900 text-sm focus:outline-none focus:border-primary-500" />
            <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full"><span className="material-symbols-outlined">send</span></button>
          </form>
        </div>
      )}
    </>
  );
}