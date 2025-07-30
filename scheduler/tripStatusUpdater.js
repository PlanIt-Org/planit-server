// server/schedulers/tripStatusUpdater.js
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updateCompletedTrips = async () => {
  const now = new Date();
  console.log(`[${now.toISOString()}] Running job to update completed trips...`);

  try {
    const result = await prisma.trip.updateMany({
      where: {
        NOT: {
          status: 'COMPLETED',
        },
        endTime: {
          lt: now, 
        },
      },
      data: {
        status: 'COMPLETED',
      },
    });

    if (result.count > 0) {
      console.log(`Successfully updated ${result.count} trip(s) to COMPLETED.`);
    } else {
      console.log('No trips needed updating.');
    }
  } catch (error) {
    console.error('Error updating trip statuses:', error);
  }
};

export const startTripStatusUpdater = () => {
  cron.schedule('0 * * * *', updateCompletedTrips, {
    scheduled: true,
    timezone: "America/Los_Angeles", 
  });

  console.log('✅ Trip status updater scheduled to run every hour.');
};