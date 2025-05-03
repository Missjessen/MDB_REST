// // src/queues/deployQueue.ts
// import { Queue } from 'bullmq';
// import { redis } from '../lib/redis';

// export const deployQueue = new Queue('deployCampaign', {
//   connection: redis,
//   defaultJobOptions: {
//     attempts: 3,
//     backoff: { type: 'exponential', delay: 1000 },
//   },
// });