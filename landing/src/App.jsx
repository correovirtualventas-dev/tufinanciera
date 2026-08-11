import { useState, useEffect, lazy, Suspense } from 'react';

const Navbar = lazy(() => import('./components/Navbar'));
const Hero = lazy(() => import('./components/Hero'));
const Services = lazy(() => import('./components/Services'));
const HowItWorks = lazy(() => import('./components/HowItWorks'));
const Faq = lazy(() => import('./components/Faq'));
const Footer = lazy(() => import('./components/Footer'));
const ChatBot = lazy(() => import('./components/ChatBot'));
const Modal = lazy(() => import('./components/Modal'));
const CotizadorModal = lazy(() => import('./components/CotizadorModal'));
const InvestorModal = lazy(() => import('./components/InvestorModal'));
const ClientModal = lazy(() => import('./components/ClientModal'));

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [cotizadorOpen, setCotizadorOpen] = useState(false);
  const [investorOpen, setInvestorOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#solicitar') setModalOpen(true);
      if (window.location.hash === '#cotizador') setCotizadorOpen(true);
    };
    const handleQueryChange = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('modal') === 'solicitar') setModalOpen(true);
      if (params.get('modal') === 'cotizador') setCotizadorOpen(true);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    handleQueryChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3 }
    );
    ['inicio', 'servicios', 'como-funciona', 'faq'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500"></div></div>}>
        <Navbar activeSection={activeSection} onSolicitar={() => setModalOpen(true)} onCotizador={() => setCotizadorOpen(true)} />
        <Hero onSolicitar={() => setModalOpen(true)} />
        <Services onClient={() => setClientOpen(true)} onInvestor={() => setInvestorOpen(true)} onSolicitar={() => setModalOpen(true)} />
        <HowItWorks />
        <Faq />
        <Footer />
        <ChatBot
          onOpenClient={() => setClientOpen(true)}
          onOpenInvestor={() => setInvestorOpen(true)}
          onOpenCotizador={() => setCotizadorOpen(true)}
        />
        {modalOpen && <Modal onClose={() => setModalOpen(false)} />}
        {cotizadorOpen && <CotizadorModal onClose={() => setCotizadorOpen(false)} />}
        {investorOpen && <InvestorModal onClose={() => setInvestorOpen(false)} />}
        {clientOpen && <ClientModal onClose={() => setClientOpen(false)} />}
      </Suspense>
    </div>
  );
}
