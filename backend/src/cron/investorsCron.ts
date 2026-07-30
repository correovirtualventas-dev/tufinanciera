import cron from 'node-cron';
import { investorsService } from '../services/investors.service';

export function startInvestorsCron() {
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Procesando acreditaciones diarias de inversores...');
    try {
      const result = await investorsService.processDailyAccruals();
      console.log(`[CRON] Acreditaciones procesadas: ${result.processed}`);
    } catch (err) {
      console.error('[CRON] Error:', err);
    }
  });
  console.log('[CRON] Investors cron scheduled at midnight');
}
