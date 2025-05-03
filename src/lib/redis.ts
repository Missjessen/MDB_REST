// // src/lib/redis.ts
// import IORedis from 'ioredis';

// export const redis = new IORedis({
//   host: process.env.REDIS_HOST  || '127.0.0.1',
//   port: Number(process.env.REDIS_PORT) || 6379,
//   password: process.env.REDIS_PASSWORD,   // hvis du har sat et password
// });