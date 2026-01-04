/**
 * Explore Data Fetchers
 * 
 * Functions to fetch and normalize explore data from each provider
 * 
 * API Base URLs:
 * - DramaBox, FlickReels, Melolo: https://dramabox-api-test.vercel.app/
 * - NetShort, Anime: https://api.sansekai.my.id/
 */

import { DramaBoxApi } from "@/lib/api/dramabox";
import { FlickReelsApi } from "@/lib/api/flickreels";
import { SansekaiApi } from "@/lib/api/sansekai";
import { MeloloApi } from "@/lib/api/melolo";
import { ExploreItem, ExploreFilters, ProviderSource, DEFAULT_SORTS } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDramaBox(item: any): ExploreItem {
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
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeFlickReels(item: any): ExploreItem {
    return {
        id: String(item.playlet_id || ""),
        title: item.playlet_title || item.title || "Untitled",
        poster: item.cover || item.process_cover || "",
        episodes: item.chapter_num || item.upload_num,
        tags: item.tag_list?.map((t: { tag_name: string }) => t.tag_name),
        source: "flickreels",
        description: item.introduce,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeNetShort(item: any): ExploreItem {
    return {
        id: item.shortPlayId || item.id || "",
        title: item.shortPlayName || item.title || "Untitled",
        poster: item.shortPlayCover || item.coverUrl || item.cover || "",
        source: "netshort",
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMelolo(item: any): ExploreItem {
    const rawImage = item.thumb_url || item.cover || "";
    const poster = rawImage && rawImage.includes(".heic")
        ? `https://wsrv.nl/?url=${encodeURIComponent(rawImage)}&output=webp&q=85`
        : rawImage;

    return {
        id: item.book_id || item.id || "",
        title: item.book_name || item.title || "Untitled",
        poster,
        source: "melolo",
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAnime(item: any): ExploreItem {
    return {
        id: item.url || item.id || "",
        title: item.judul || item.title || "Untitled",
        poster: item.cover || "",
        source: "anime",
    };
}

// Helper to deduplicate items by id
function deduplicateItems(items: ExploreItem[]): ExploreItem[] {
    const seen = new Set<string>();
    return items.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });
}

interface FetchOptions {
    category?: string;
    region?: string;
    year?: string;
    status?: string;
    sort?: string;
    page?: number;
}

/**
 * Fetch data from specific provider using CATALOG endpoints (not trending)
 * 
 * Strategy per provider:
 * - DramaBox: search("") for full catalog, or getHome() + search combo
 * - FlickReels: Merge getForYou + getRanking + getRecommend for more content
 * - NetShort: getForYou(page) - supports real pagination!
 * - Melolo: search("", limit, offset) - supports offset pagination
 * - Anime: search("") for more results, or getLatest()
 */
export async function fetchProviderData(
    source: ProviderSource,
    options: FetchOptions = {}
): Promise<{ items: ExploreItem[]; filters: ExploreFilters }> {
    const { page = 1, sort = "popular" } = options;
    let items: ExploreItem[] = [];
    const filters: ExploreFilters = {
        categories: [],
        sorts: DEFAULT_SORTS,
    };

    try {
        switch (source) {
            case "dramabox": {
                // Use search for browsing (more results) + home for featured
                const [homeData, searchData] = await Promise.all([
                    DramaBoxApi.getHome(),
                    DramaBoxApi.search(""),  // Empty query returns catalog
                ]);

                // Merge and deduplicate
                const allData = [...homeData, ...searchData];
                items = deduplicateItems(allData.map(normalizeDramaBox));
                break;
            }

            case "flickreels": {
                // Merge multiple sources for more content
                const [forYou, ranking, recommend] = await Promise.all([
                    FlickReelsApi.getForYou(),
                    FlickReelsApi.getRanking(),
                    FlickReelsApi.getRecommend(),
                ]);

                // Merge all sources and deduplicate
                const allData = [...forYou, ...ranking, ...recommend];
                items = deduplicateItems(allData.map(normalizeFlickReels));

                // Sort by type
                if (sort === "latest") {
                    // Keep original order (forYou first)
                } else {
                    // Ranking first for popular
                    items = deduplicateItems([
                        ...ranking.map(normalizeFlickReels),
                        ...forYou.map(normalizeFlickReels),
                        ...recommend.map(normalizeFlickReels),
                    ]);
                }
                break;
            }

            case "netshort": {
                // NetShort has REAL pagination support via getForYou(page)
                const data = await SansekaiApi.netshort.getForYou(page);
                items = data.map(normalizeNetShort);
                break;
            }

            case "melolo": {
                // Melolo - use trending/latest for catalog (search needs query in new API)
                const [trending, latest] = await Promise.all([
                    MeloloApi.getTrending(),
                    MeloloApi.getLatest(),
                ]);

                const allData = [...trending, ...latest];
                items = deduplicateItems(allData.map(normalizeMelolo));
                break;
            }

            case "anime": {
                // Use search for more results, fallback to latest
                const [latestData, searchData] = await Promise.all([
                    SansekaiApi.anime.getLatest(),
                    SansekaiApi.anime.search(""),
                ]);

                const allData = [...latestData, ...searchData];
                items = deduplicateItems(allData.map(normalizeAnime));
                break;
            }
        }
    } catch (error) {
        console.error(`Error fetching ${source}:`, error);
    }

    return { items, filters };
}
