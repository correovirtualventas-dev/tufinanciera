import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authService } from './services/auth.service';
import { startInvestorsCron } from './cron/investorsCron';

import authRoutes from './routes/auth.routes';
import clientsRoutes from './routes/clients.routes';
import loansRoutes from './routes/loans.routes';
import paymentsRoutes from './routes/payments.routes';
import dashboardRoutes from './routes/dashboard.routes';
import scoringRoutes from './routes/scoring.routes';
import reportsRoutes from './routes/reports.routes';
import cashRegisterRoutes from './routes/cashRegister.routes';
import adminRoutes from './routes/admin.routes';
import alertsRoutes from './routes/alerts.routes';
import accountingRoutes from './routes/accounting.routes';
import exchangeRoutes from './routes/exchange.routes';
import investorsRoutes from './routes/investors.routes';
import prospectsRoutes from './routes/prospects.routes';

const app = express();

const corsOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://tufinanciera-frontend.vercel.app',
  'https://tufinanciera-landing.vercel.app',
  'https://tufinanciera-api.vercel.app',
];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas solicitudes, intente más tarde' },
});
app.use(globalLimiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de inicio de sesión' },
});
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/investor-login', loginLimiter);
app.use('/api/auth/client-login', loginLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/scoring', scoringRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/cash-register', cashRegisterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/exchange', exchangeRoutes);
app.use('/api/investors', investorsRoutes);
app.use('/api/prospects', prospectsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/dolar', async (_req, res) => {
  try {
    const response = await fetch('https://api.bluelytics.com.ar/v2/latest');
    if (response.ok) {
      const data = await response.json();
      return res.json({
        blue: data.blue,
        official: data.oficial,
        date: data.last_update,
      });
    }
  } catch {}
  res.json({
    blue: { value_sell: 1400, value_buy: 1380 },
    official: { value_sell: 1000, value_buy: 980 },
    date: new Date().toISOString(),
  });
});

if (env.NODE_ENV === 'development') {
  app.get('/api/debug', (_req, res) => {
    res.json({ env: env.NODE_ENV, port: env.PORT, corsOrigins });
  });
}

app.use(errorHandler);

authService.seedAdmin().catch(console.error);
startInvestorsCron();

export default app;
