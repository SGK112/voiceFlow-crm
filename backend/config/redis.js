import { createClient } from 'redis';

let redisClient = null;

export const connectRedis = async () => {
  // Skip Redis entirely if no config is provided
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    console.log('⚠️  Redis not configured - skipping (caching and rate limiting disabled)');
    return null;
  }

  try {
    let redisConfig;

    // Check if using individual config variables
    if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
      const host = process.env.REDIS_HOST;
      const port = parseInt(process.env.REDIS_PORT);
      const password = process.env.REDIS_PASSWORD;

      console.log(`Connecting to Redis at ${host}:${port} with TLS`);

      redisConfig = {
        socket: {
          host,
          port,
          tls: true,
          rejectUnauthorized: false
        }
      };

      if (password) {
        redisConfig.password = password;
      }
    }
    // Otherwise use REDIS_URL
    else if (process.env.REDIS_URL) {
      console.log('Connecting to Redis via URL');
      redisConfig = { url: process.env.REDIS_URL };
    }

    redisClient = createClient(redisConfig);

    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.on('connect', () => console.log('✅ Redis Connected'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('⚠️  Redis connection failed:', error.message);
    console.log('Continuing without Redis (caching and rate limiting disabled)');
    return null;
  }
};

export const getRedisClient = () => redisClient;

export default { connectRedis, getRedisClient };
