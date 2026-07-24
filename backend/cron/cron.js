import cron from 'node-cron';
import { syncRSSFeeds } from '../services/rssService.js';

let cronTask = null;

export const startCronJobs = () => {
  console.log('Registering Node Cron Job for RSS Feed synchronization...');

  // Trigger an initial sync asynchronously in the background on startup
  console.log('Starting initial RSS synchronization on boot...');
  syncRSSFeeds()
    .then(result => console.log('Initial boot RSS sync finished:', JSON.stringify(result)))
    .catch(error => console.error('Initial boot RSS sync failed:', error.message));

  // Sync every 10 minutes
  cronTask = cron.schedule('*/10 * * * *', async () => {
    console.log('Cron Job Triggered: Syncing RSS feeds...');
    try {
      const result = await syncRSSFeeds();
      console.log('Cron Job Completed. Result details:', JSON.stringify(result));
    } catch (error) {
      console.error('Fatal Error during RSS Cron Job:', error.message);
    }
  });

  cronTask.start();
};

export const stopCronJobs = () => {
  if (cronTask) {
    cronTask.stop();
    console.log('Stopped RSS Feed Sync Cron Job.');
  }
};
