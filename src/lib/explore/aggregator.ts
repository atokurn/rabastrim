/**
 * Content Aggregator
 * 
 * Strategy: Fetch ALL endpoints per provider → Merge & Dedupe → Cache → Filter Locally
 * 
 * This layer aggregates content from multiple API endpoints into a unified cache,
 * enabling local filtering and pagination without additional API calls.
 */

import { DramaBoxApi } from "@/lib/api/dramabox";
import { FlickReelsApi } from "@/lib/api/flickreels";
import { SansekaiApi } from "@/lib/api/sansekai";
import { cache } from "@/lib/cache";
import { ExploreItem, ProviderSource } from "./types";

// Cache TTL for aggregated data (30 minutes)
const AGGREGATION_CACHE_TTL = 30 * 60;

// Helper to safely ensure result is an array
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ensureArray(val: any): any[] {
    if (Array.isArray(val)) return val;
    return [];
}

// Normalize DramaBox item to ExploreItem
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDramaBox(item: any, source?: string): ExploreItem {
    return {
        id: item.bookId || item.book_id || "",
        title: item.bookName || item.book_name || "Untitled",
        poster: item.coverWap || item.cover || "",
        episodes: item.chapterCount,
        tags: item.tags,
        source: "dramabox",
        isVip: item.isVip,
        score: item.score,
        description: item.introduction,
        _source: source,
    };
}

// Normalize FlickReels item to ExploreItem
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeFlickReels(item: any, source?: string): ExploreItem {
    return {
        id: String(item.playlet_id || ""),
        title: item.playlet_title || item.title || "Untitled",
        poster: item.cover || item.process_cover || "",
        episodes: item.chapter_num || item.upload_num,
        tags: item.tag_list?.map((t: { tag_name: string }) => t.tag_name),
        source: "flickreels",
        description: item.introduce,
        _source: source,
    };
}

// Normalize NetShort item to ExploreItem
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeNetShort(item: any, source?: string): ExploreItem {
    return {
        id: item.shortPlayId || item.id || "",
        title: item.shortPlayName || item.title || "Untitled",
        poster: item.shortPlayCover || item.coverUrl || item.cover || "",
        source: "netshort",
        _source: source,
    };
}

// Normalize Melolo item to ExploreItem
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMelolo(item: any, source?: string): ExploreItem {
    const rawImage = item.thumb_url || item.cover || "";
    const poster = rawImage && rawImage.includes(".heic")
        ? `https://wsrv.nl/?url=${encodeURIComponent(rawImage)}&output=webp&q=85`
        : rawImage;

    return {
        id: item.book_id || item.id || "",
        title: item.book_name || item.title || "Untitled",
        poster,
        source: "melolo",
        _source: source,
    };
}

// Normalize Anime item to ExploreItem
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAnime(item: any, source?: string): ExploreItem {
    return {
        id: item.url || item.id || "",
        title: item.judul || item.title || "Untitled",
        poster: item.cover || "",
        source: "anime",
        _source: source,
    };
}

// Deduplicate items by ID
function deduplicateItems(items: ExploreItem[]): ExploreItem[] {
    const seen = new Set<string>();
    return items.filter(item => {
        const key = `${item.source}-${item.id}`;
        if (!item.id || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * Aggregate ALL endpoints for DramaBox
 */
async function aggregateDramaBox(): Promise<ExploreItem[]> {
    console.log("[Aggregator] Fetching all DramaBox endpoints...");

    const [home, recommend, ranking, trending, latest, foryou, vip, dubindo] = await Promise.all([
        DramaBoxApi.getHome().catch(() => []),
        DramaBoxApi.getRecommend().catch(() => []),
        DramaBoxApi.getRanking().catch(() => []),
        DramaBoxApi.getTrending().catch(() => []),
        DramaBoxApi.getLatest().catch(() => []),
        DramaBoxApi.getForYou().catch(() => []),
        DramaBoxApi.getVip().catch(() => []),
        DramaBoxApi.getDubIndo().catch(() => []),
    ]);

    const allItems = [
        ...ensureArray(home).map(i => normalizeDramaBox(i, "home")),
        ...ensureArray(recommend).map(i => normalizeDramaBox(i, "recommend")),
        ...ensureArray(ranking).map(i => normalizeDramaBox(i, "ranking")),
        ...ensureArray(trending).map(i => normalizeDramaBox(i, "trending")),
        ...ensureArray(latest).map(i => normalizeDramaBox(i, "latest")),
        ...ensureArray(foryou).map(i => normalizeDramaBox(i, "foryou")),
        ...ensureArray(vip).map(i => normalizeDramaBox(i, "vip")),
        ...ensureArray(dubindo).map(i => normalizeDramaBox(i, "dubindo")),
    ];

    const deduplicated = deduplicateItems(allItems);
    console.log(`[Aggregator] DramaBox: ${allItems.length} raw → ${deduplicated.length} unique`);

    return deduplicated;
}

/**
 * Aggregate ALL endpoints for FlickReels
 */
async function aggregateFlickReels(): Promise<ExploreItem[]> {
    console.log("[Aggregator] Fetching all FlickReels endpoints...");

    const [home, foryou, ranking, recommend] = await Promise.all([
        FlickReelsApi.getHome().catch(() => []),
        FlickReelsApi.getForYou().catch(() => []),
        FlickReelsApi.getRanking().catch(() => []),
        FlickReelsApi.getRecommend().catch(() => []),
    ]);

    const allItems = [
        ...ensureArray(home).map(i => normalizeFlickReels(i, "home")),
        ...ensureArray(foryou).map(i => normalizeFlickReels(i, "foryou")),
        ...ensureArray(ranking).map(i => normalizeFlickReels(i, "ranking")),
        ...ensureArray(recommend).map(i => normalizeFlickReels(i, "recommend")),
    ];

    const deduplicated = deduplicateItems(allItems);
    console.log(`[Aggregator] FlickReels: ${allItems.length} raw → ${deduplicated.length} unique`);

    return deduplicated;
}

/**
 * Aggregate ALL endpoints for NetShort
 */
async function aggregateNetShort(): Promise<ExploreItem[]> {
    console.log("[Aggregator] Fetching all NetShort endpoints...");

    const [theaters, foryou] = await Promise.all([
        SansekaiApi.netshort.getTheaters().catch(() => []),
        SansekaiApi.netshort.getForYou(1).catch(() => []),
    ]);

    const allItems = [
        ...ensureArray(theaters).map(i => normalizeNetShort(i, "theaters")),
        ...ensureArray(foryou).map(i => normalizeNetShort(i, "foryou")),
    ];

    const deduplicated = deduplicateItems(allItems);
    console.log(`[Aggregator] NetShort: ${allItems.length} raw → ${deduplicated.length} unique`);

    return deduplicated;
}

/**
 * Aggregate ALL endpoints for Melolo
 */
async function aggregateMelolo(): Promise<ExploreItem[]> {
    console.log("[Aggregator] Fetching all Melolo endpoints...");

    const [latest, trending] = await Promise.all([
        SansekaiApi.melolo.getLatest().catch(() => []),
        SansekaiApi.melolo.getTrending().catch(() => []),
    ]);

    const allItems = [
        ...ensureArray(latest).map(i => normalizeMelolo(i, "latest")),
        ...ensureArray(trending).map(i => normalizeMelolo(i, "trending")),
    ];

    const deduplicated = deduplicateItems(allItems);
    console.log(`[Aggregator] Melolo: ${allItems.length} raw → ${deduplicated.length} unique`);

    return deduplicated;
}

/**
 * Aggregate ALL endpoints for Anime
 */
async function aggregateAnime(): Promise<ExploreItem[]> {
    console.log("[Aggregator] Fetching all Anime endpoints...");

    const [latest] = await Promise.all([
        SansekaiApi.anime.getLatest().catch(() => []),
    ]);

    const allItems = [
        ...ensureArray(latest).map(i => normalizeAnime(i, "latest")),
    ];

    const deduplicated = deduplicateItems(allItems);
    console.log(`[Aggregator] Anime: ${allItems.length} raw → ${deduplicated.length} unique`);

    return deduplicated;
}

/**
 * Get aggregated content for a provider (with caching)
 */
export async function getAggregatedContent(provider: ProviderSource): Promise<ExploreItem[]> {
    const cacheKey = `agg:${provider}:all`;

    return cache.getOrSet<ExploreItem[]>(
        cacheKey,
        async () => {
            switch (provider) {
                case "dramabox":
                    return aggregateDramaBox();
                case "flickreels":
                    return aggregateFlickReels();
                case "netshort":
                    return aggregateNetShort();
                case "melolo":
                    return aggregateMelolo();
                case "anime":
                    return aggregateAnime();
                default:
                    return [];
            }
        },
        AGGREGATION_CACHE_TTL
    );
}

/**
 * Filter items locally (no additional API calls)
 */
export function filterItemsLocally(
    items: ExploreItem[],
    filters: { category?: string; region?: string; year?: string; status?: string }
): ExploreItem[] {
    let filtered = items;

    if (filters.category) {
        filtered = filtered.filter(item =>
            item.tags?.some(tag =>
                tag.toLowerCase().includes(filters.category!.toLowerCase())
            )
        );
    }

    return filtered;
}

/**
 * Paginate items locally
 */
export function paginateItemsLocally(
    items: ExploreItem[],
    page: number,
    limit: number
): { items: ExploreItem[]; hasNext: boolean; total: number } {
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = items.slice(start, end);

    return {
        items: paginated,
        hasNext: end < items.length,
        total: items.length,
    };
}
