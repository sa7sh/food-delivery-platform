import cron from 'node-cron';
import Order from './models/Order.js';

const setupCronJobs = () => {
  // Schedule task to run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running daily cleanup of old orders...');

    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const result = await Order.deleteMany({
        createdAt: { $lt: threeDaysAgo }
      });

      console.log(`[Cron] Cleanup complete. Deleted ${result.deletedCount} orders older than 3 days.`);
    } catch (error) {
      console.error('[Cron] Error during order cleanup:', error);
    }
  });

  console.log('[Cron] Order cleanup job scheduled (Daily at 00:00).');
};

export default setupCronJobs;
