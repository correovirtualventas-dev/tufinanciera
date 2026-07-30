import app from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`[Backend] Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

process.on('SIGTERM', () => {
  console.log('[Backend] SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[Backend] SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});
