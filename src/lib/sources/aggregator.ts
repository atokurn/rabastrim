/**
 * Source Aggregator
 * 
 * Core aggregation logic for multi-source data fetching.
 * Features: parallel fetch, timeout, fallback, weight sorting, caching, analytics
 */

import { cache, cacheKeys, cacheTTL, redis } from "@/lib/cache";
import { sortByRelevance, deduplicateResults } from "@/lib/search";
import { DramaBoxAdapter } from "./adapters/dramabox";
import { FlickReelsAdapter } from "./adapters/flickreels";
import { MeloloAdapter } from "./adapters/melolo";
import { DramaWaveAdapter } from "./adapters/dramawave";
import type {
    SourceAdapter,
    UnifiedDrama,
    UnifiedDetail,
    UnifiedEpisode,
    SearchOptions,
    SearchResult,
    ProviderName,
    AggregatorConfig,
} from "./types";

// =====================
// Adapter Registry
// =====================
const adapters: Map<ProviderName, SourceAdapter> = new Map([
    ["dramabox", DramaBoxAdapter],
    ["flickreels", FlickReelsAdapter],
    ["melolo", MeloloAdapter],
    ["dramawave", DramaWaveAdapter],
]);

// =====================
// Configuration
// =====================
const config: AggregatorConfig = {
    providers: [
        { name: "dramabox", enabled: true, weight: 100, timeout: 5000 },
        { name: "flickreels", enabled: true, weight: 80, timeout: 5000 },
        { name: "dramawave", enabled: true, weight: 60, timeout: 5000 },
        { name: "melolo", enabled: true, weight: 50, timeout: 5000 },
    ],
    defaultTimeout: 5000,
    enableCache: true,
    cacheTTL: 120,
    enableAnalytics: true,
};

// =====================
// Helper Functions
// =====================

/**
 * Fetch with timeout
 */
async function fetchWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    fallback: T
): Promise<T> {
    const timeoutPromise = new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), timeoutMs);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } catch {
        return fallback;
    }
}

/**
 * Track search analytics
 */
async function trackSearchQuery(query: string): Promise<void> {
    if (!config.enableAnalytics || !redis) return;

    try {
        const today = new Date().toISOString().slice(0, 10);
        const key = `analytics:search:${today}`;
        await redis.zincrby(key, 1, query.toLowerCase().trim());
        await redis.expire(key, 86400 * 7); // Keep 7 days
    } catch (error) {
        console.error("[Aggregator] Analytics error:", error);
    }
}

/**
 * Get trending search keywords
 */
async function getTrendingKeywords(limit = 10): Promise<string[]> {
    if (!redis) return [];

    try {
        const today = new Date().toISOString().slice(0, 10);
        const key = `analytics:search:${today}`;
        const results = await redis.zrange(key, 0, limit - 1, { rev: true });
        return results as string[];
    } catch {
        return [];
    }
}

// =====================
// Source Aggregator
// =====================
export const SourceAggregator = {
    /**
     * Get enabled providers
     */
    getEnabledProviders(): ProviderName[] {
        return config.providers
            .filter(p => p.enabled)
            .map(p => p.name);
    },

    /**
     * Search across all enabled sources
     */
    async search(query: string, options: SearchOptions = {}): Promise<SearchResult> {
        const { limit = 20, page = 1, providers } = options;
        const normalizedQuery = query.toLowerCase().trim();

        // Track analytics
        if (config.enableAnalytics) {
            trackSearchQuery(normalizedQuery);
        }

        // Determine which providers to use
        const enabledProviders = providers || this.getEnabledProviders();

        // Cache key
        const cacheKey = cacheKeys.search(normalizedQuery, { limit: 100, page: 1 });

        // Try cache first
        const fetchAllResults = async (): Promise<{ results: UnifiedDrama[]; sources: SearchResult["sources"] }> => {
            const sourceResults: SearchResult["sources"] = [];
            const allResults: UnifiedDrama[] = [];

            // Parallel fetch with timeout
            const fetchPromises = enabledProviders.map(async (providerName) => {
                const adapter = adapters.get(providerName);
                const providerConfig = config.providers.find(p => p.name === providerName);

                if (!adapter || !providerConfig?.enabled) {
                    return { provider: providerName, results: [], success: false };
                }

                try {
                    const results = await fetchWithTimeout(
                        adapter.search(query),
                        providerConfig.timeout,
                        []
                    );
                    return { provider: providerName, results, success: true };
                } catch {
                    return { provider: providerName, results: [], success: false };
                }
            });

            const settled = await Promise.allSettled(fetchPromises);

            for (const result of settled) {
                if (result.status === "fulfilled") {
                    const { provider, results, success } = result.value;
                    sourceResults.push({ provider, count: results.length, success });
                    allResults.push(...results);
                }
            }

            // Sort by relevance and deduplicate
            const sortedResults = sortByRelevance(allResults, query);
            const uniqueResults = deduplicateResults(sortedResults);

            return { results: uniqueResults, sources: sourceResults };
        };

        // Get from cache or fetch
        const data = config.enableCache
            ? await cache.getOrSet(cacheKey, fetchAllResults, cacheTTL.search)
            : await fetchAllResults();

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedResults = data.results.slice(startIndex, endIndex);
        const hasMore = endIndex < data.results.length;

        return {
            results: paginatedResults,
            total: data.results.length,
            page,
            limit,
            hasMore,
            sources: data.sources,
        };
    },

    /**
     * Get trending content from all sources
     */
    async getTrending(): Promise<UnifiedDrama[]> {
        const cacheKey = cacheKeys.trending();

        const fetchTrending = async () => {
            const results: UnifiedDrama[] = [];

            for (const providerName of this.getEnabledProviders()) {
                const adapter = adapters.get(providerName);
                if (!adapter) continue;

                try {
                    const items = await fetchWithTimeout(
                        adapter.getTrending(),
                        config.defaultTimeout,
                        []
                    );
                    results.push(...items);
                } catch {
                    continue;
                }
            }

            // Sort by weight
            results.sort((a, b) => (b._weight || 0) - (a._weight || 0));
            return results;
        };

        return config.enableCache
            ? cache.getOrSet(cacheKey, fetchTrending, cacheTTL.recommendation)
            : fetchTrending();
    },

    /**
     * Get latest content from all sources
     */
    async getLatest(): Promise<UnifiedDrama[]> {
        const cacheKey = cacheKeys.latest();

        const fetchLatest = async () => {
            const results: UnifiedDrama[] = [];

            for (const providerName of this.getEnabledProviders()) {
                const adapter = adapters.get(providerName);
                if (!adapter) continue;

                try {
                    const items = await fetchWithTimeout(
                        adapter.getLatest(),
                        config.defaultTimeout,
                        []
                    );
                    results.push(...items);
                } catch {
                    continue;
                }
            }

            results.sort((a, b) => (b._weight || 0) - (a._weight || 0));
            return results;
        };

        return config.enableCache
            ? cache.getOrSet(cacheKey, fetchLatest, cacheTTL.recommendation)
            : fetchLatest();
    },

    /**
     * Get detail from specific provider
     */
    async getDetail(id: string, provider: ProviderName): Promise<UnifiedDetail | null> {
        const adapter = adapters.get(provider);
        if (!adapter) return null;

        const cacheKey = cacheKeys.drama(id, provider);

        return config.enableCache
            ? cache.getOrSet(cacheKey, () => adapter.getDetail(id), cacheTTL.drama)
            : adapter.getDetail(id);
    },

    /**
     * Get episodes from specific provider
     */
    async getEpisodes(id: string, provider: ProviderName): Promise<UnifiedEpisode[]> {
        const adapter = adapters.get(provider);
        if (!adapter) return [];

        const cacheKey = cacheKeys.episode(id, provider);

        return config.enableCache
            ? cache.getOrSet(cacheKey, () => adapter.getEpisodes(id), cacheTTL.episode)
            : adapter.getEpisodes(id);
    },

    /**
     * Get trending search keywords (analytics)
     */
    getTrendingKeywords,

    /**
     * Get adapter by provider name
     */
    getAdapter(provider: ProviderName): SourceAdapter | undefined {
        return adapters.get(provider);
    },
};

// Export types
export type { UnifiedDrama, UnifiedDetail, UnifiedEpisode, SearchResult, ProviderName };
