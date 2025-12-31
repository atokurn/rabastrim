import { Redis } from "@upstash/redis";

if (!process.env.REDIS_URL) {
    console.warn("REDIS_URL not set, caching will be disabled");
}

// Parse Redis URL for Upstash
function parseRedisUrl(url: string) {
    const match = url.match(/redis:\/\/([^:]+):([^@]+)@([^:]+):(\d+)/);
    if (!match) throw new Error("Invalid REDIS_URL format");
    return {
        username: match[1],
        password: match[2],
        host: match[3],
        port: parseInt(match[4]),
    };
}

let redis: Redis | null = null;

if (process.env.REDIS_URL) {
    const config = parseRedisUrl(process.env.REDIS_URL);
    redis = new Redis({
        url: `https://${config.host}`,
        token: config.password,
    });
}

export { redis };

/**
 * Cache version - bump this when structure changes
 */
const CACHE_VERSION = "v1";

/**
 * TTL values in seconds
 */
export const cacheTTL = {
    home: 60,           // 60 seconds
    drama: 300,         // 5 minutes
    episode: 1800,      // 30 minutes
    search: 120,        // 2 minutes
    recommendation: 300, // 5 minutes
};

/**
 * Cache key generators with versioning
 */
export const cacheKeys = {
    home: () => `home:${CACHE_VERSION}`,
    continueWatching: (userId: string) => `continue:${userId}:${CACHE_VERSION}`,
    drama: (id: string, provider: string) => `drama:${provider}:${id}:${CACHE_VERSION}`,
    episode: (id: string, provider: string) => `episode:${provider}:${id}:${CACHE_VERSION}`,
    search: (query: string, params?: { limit?: number; page?: number; type?: string }) => {
        const base = `search:${query.toLowerCase().trim()}`;
        const suffix = params ? `:l${params.limit || 20}:p${params.page || 1}:t${params.type || 'all'}` : '';
        return `${base}${suffix}:${CACHE_VERSION}`;
    },
    searchSuggestions: (query: string) => `suggestions:${query.toLowerCase().trim()}:${CACHE_VERSION}`,
    searchPopular: () => `popular:${CACHE_VERSION}`,
    recommendation: (userId: string) => `recommend:${userId}:${CACHE_VERSION}`,
    trending: () => `trending:${CACHE_VERSION}`,
    latest: () => `latest:${CACHE_VERSION}`,
};

/**
 * Cache helper functions
 */
export const cache = {
    /**
     * Get cached data or fetch and cache it
     */
    async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlSeconds: number = 300
    ): Promise<T> {
        if (!redis) {
            return fetcher();
        }

        try {
            const cached = await redis.get<T>(key);
            if (cached) {
                console.log(`Cache HIT: ${key}`);
                return cached;
            }
        } catch (error) {
            console.error(`Cache GET error:`, error);
        }

        console.log(`Cache MISS: ${key}`);
        const data = await fetcher();

        try {
            await redis.setex(key, ttlSeconds, JSON.stringify(data));
        } catch (error) {
            console.error(`Cache SET error:`, error);
        }

        return data;
    },

    /**
     * Invalidate cache key
     */
    async invalidate(key: string): Promise<void> {
        if (!redis) return;
        try {
            await redis.del(key);
        } catch (error) {
            console.error(`Cache DEL error:`, error);
        }
    },

    /**
     * Invalidate multiple keys by pattern
     */
    async invalidatePattern(pattern: string): Promise<void> {
        if (!redis) return;
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            console.error(`Cache DEL pattern error:`, error);
        }
    },

    /**
     * Invalidate user-specific cache (e.g., after progress update)
     */
    async invalidateUserCache(userId: string): Promise<void> {
        await this.invalidate(cacheKeys.continueWatching(userId));
        await this.invalidate(cacheKeys.recommendation(userId));
    },
};
