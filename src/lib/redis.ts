import Redis from 'ioredis';

const getRedisUrl = () => {
  return process.env.REDIS_URL || 'redis://localhost:6379';
};

class RedisSingleton {
  private static instance: Redis | null = null;

  public static getInstance(): Redis {
    if (!RedisSingleton.instance) {
      const url = getRedisUrl();
      
      // Configuration for offline-safe and serverless environments:
      // lazyConnect avoids blocking process start if Redis is offline
      RedisSingleton.instance = new Redis(url, {
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        enableOfflineQueue: true, // Queue commands when disconnected
        reconnectOnError: (err) => {
          console.warn('Redis reconnection error triggered:', err.message);
          return true; // Auto reconnect
        },
      });

      RedisSingleton.instance.on('error', (err) => {
        console.error('Redis Client Error:', err.message);
      });

      RedisSingleton.instance.on('connect', () => {
        console.log('Redis client successfully connected.');
      });
    }

    return RedisSingleton.instance;
  }
}

const redis = RedisSingleton.getInstance();
export default redis;
