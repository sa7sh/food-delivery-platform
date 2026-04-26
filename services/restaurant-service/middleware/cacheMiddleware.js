import { redisClient } from "../config/redis.js";

/**
 * Middleware to cache responses for a specific duration.
 * @param {number} durationInSeconds - Time to live (TTL) in seconds
 */
export const cacheResponse = (durationInSeconds) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    try {
      if (!redisClient.isReady) {
        // If Redis isn't connected or failed, bypass cache
        return next();
      }

      // Create a unique key based on the request URL (including query params)
      const key = `cache:${req.originalUrl}`;
      
      // Support manual cache refresh via header
      const refreshCache = req.headers['x-refresh-cache'] === 'true';
      
      if (!refreshCache) {
        const cachedData = await redisClient.get(key);
        if (cachedData) {
          console.log(`[Cache] HIT for: ${key}`);
          return res.json(JSON.parse(cachedData));
        }
      } else {
        console.log(`[Cache] REFRESH FORCED for: ${key}`);
      }

      console.log(`[Cache] MISS for: ${key}`);

      // Override res.json to capture the response data before sending it
      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            await redisClient.setEx(key, durationInSeconds, JSON.stringify(body));
          } catch (err) {
            console.error("[Cache] Write Error:", err);
          }
        }
        originalJson(body);
      };

      next();
    } catch (error) {
      console.error("[Cache] Read Error:", error);
      next(); // Proceed without cache on error
    }
  };
};

/**
 * Utility to manually clear a specific cache key
 * @param {string} url - The exact URL path that was cached
 */
export const clearCache = async (url) => {
  try {
    if (redisClient.isReady) {
      const key = `cache:${url}`;
      await redisClient.del(key);
      console.log(`[Cache] CLEARED exact match: ${key}`);
    }
  } catch (error) {
    console.error("[Cache] Delete Error:", error);
  }
};

/**
 * Utility to manually clear cache keys matching a pattern (e.g., all food routes)
 * @param {string} pattern - Pattern to match (e.g., 'cache:/api/foods*')
 */
export const clearPatternCache = async (pattern) => {
  try {
    if (!redisClient.isReady) {
      console.log(`[Cache] Redis not ready, skipping pattern clear: ${pattern}`);
      return;
    }

    console.log(`[Cache] Scanning for pattern: ${pattern}`);
    // Use SCAN to find keys matching the pattern (safer than KEYS in production)
    let cursor = 0;
    const keysToDelete = [];

    do {
      const result = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });

      cursor = result.cursor;
      keysToDelete.push(...result.keys);
    } while (cursor !== 0);

    console.log(`[Cache] Found ${keysToDelete.length} keys to delete:`, keysToDelete);

    if (keysToDelete.length > 0) {
      await redisClient.del(keysToDelete);
      console.log(`[Cache] CLEARED ${keysToDelete.length} keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    console.error("[Cache] Pattern Delete Error:", error);
  }
};

/**
 * High-level utility to clear all caches related to a specific restaurant
 * @param {string} restaurantId - The ID of the restaurant
 */
export const clearRestaurantCache = async (restaurantId) => {
  try {
    console.log(`[Cache] Invalidating all data for restaurant: ${restaurantId}`);
    
    // 1. Clear the public listing (always plural /api/restaurants)
    await clearPatternCache('cache:/api/restaurants/public*');
    
    // 2. Clear the specific restaurant detail
    if (restaurantId) {
      console.log(`[Cache] Clearing specific restaurant detail: /api/restaurants/public/${restaurantId}`);
      await clearCache(`/api/restaurants/public/${restaurantId}`);
    }
    
    // 3. Clear food items for this restaurant
    await clearPatternCache('cache:/api/foods*');
    
    console.log(`[Cache] Invalidation complete for restaurant: ${restaurantId}`);
    
  } catch (error) {
    console.error("[Cache] Restaurant Invalidation Error:", error);
  }
};
