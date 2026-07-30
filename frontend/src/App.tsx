import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Loans from './pages/Loans';
import LoanDetail from './pages/LoanDetail';
import Cobros from './pages/Cobros';
import Scoring from './pages/Scoring';
import Reports from './pages/Reports';
import Contabilidad from './pages/Contabilidad';
import Configuracion from './pages/Configuracion';
import Alertas from './pages/Alertas';
import Cotizador from './pages/Cotizador';
import Prospectos from './pages/Prospectos';
import ProspectDetail from './pages/ProspectDetail';
import Exchange from './pages/Exchange';
import Investors from './pages/Investors';
import InvestorDetail from './pages/InvestorDetail';

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a1a2e', color: '#fff', border: '1px solid #333' },
      }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="loans" element={<Loans />} />
          <Route path="loans/:id" element={<LoanDetail />} />
          <Route path="payments" element={<Cobros />} />
          <Route path="scoring" element={<Scoring />} />
          <Route path="reports" element={<Reports />} />
          <Route path="accounting" element={<Contabilidad />} />
          <Route path="settings" element={<Configuracion />} />
          <Route path="alerts" element={<Alertas />} />
          <Route path="cotizador" element={<Cotizador />} />
          <Route path="prospects" element={<Prospectos />} />
          <Route path="prospects/:id" element={<ProspectDetail />} />
          <Route path="exchange" element={<Exchange />} />
          <Route path="investors" element={<Investors />} />
          <Route path="investors/:id" element={<InvestorDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
