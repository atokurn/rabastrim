/**
 * API Aggregator
 * 
 * Unified interface for fetching data from multiple providers.
 * Use this for consistent data access across the app.
 */

import { DramaBoxApi, Drama as DramaBoxDrama } from "./dramabox";
import { SansekaiApi, Drama as SansekaiDrama } from "./sansekai";
import { MeloloApi, MeloloDrama } from "./melolo";

// Re-export types
export type { DramaBoxDrama, SansekaiDrama, MeloloDrama };

export interface UnifiedDrama {
    id: string;
    title: string;
    cover: string;
    description?: string;
    episodes?: number;
    score?: number;
    tags?: string[];
    year?: string;
    provider: "dramabox" | "netshort" | "melolo";
}

/**
 * Transform API responses to unified format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformDrama(drama: any, provider: UnifiedDrama["provider"]): UnifiedDrama {
    return {
        id: drama.bookId || drama.book_id || drama.shortPlayId || drama.id || "",
        title: drama.bookName || drama.book_name || drama.shortPlayName || drama.title || "Untitled",
        cover: drama.coverWap || drama.cover || drama.shortPlayCover || drama.thumb_url || "",
        description: drama.introduction || drama.abstract || drama.description,
        episodes: drama.chapterCount || drama.serial_count || drama.episodes,
        score: drama.score ? parseFloat(String(drama.score)) : undefined,
        tags: drama.tags,
        year: drama.year,
        provider,
    };
}

/**
 * Aggregated API functions for home page
 */
export const ApiAggregator = {
    /**
     * Get featured content for Hero section (uses DramaBox For You)
     */
    getFeatured: async (): Promise<UnifiedDrama[]> => {
        const trending = await DramaBoxApi.getTrending();
        return trending.map(d => transformDrama(d, "dramabox"));
    },

    /**
     * Get trending dramas from all providers
     */
    getTrending: async (): Promise<UnifiedDrama[]> => {
        const [dramabox, melolo] = await Promise.all([
            DramaBoxApi.getTrending(),
            MeloloApi.getTrending(),
        ]);
        return [
            ...dramabox.map(d => transformDrama(d, "dramabox")),
            ...melolo.map(d => transformDrama(d, "melolo")),
        ];
    },

    /**
     * Get latest releases
     */
    getLatest: async (): Promise<UnifiedDrama[]> => {
        const [dramabox, melolo] = await Promise.all([
            DramaBoxApi.getLatest(),
            MeloloApi.getLatest(),
        ]);
        return [
            ...dramabox.map(d => transformDrama(d, "dramabox")),
            ...melolo.map(d => transformDrama(d, "melolo")),
        ];
    },

    /**
     * Search across providers
     */
    search: async (query: string): Promise<UnifiedDrama[]> => {
        const [dramabox, netshort, melolo] = await Promise.all([
            DramaBoxApi.search(query),
            SansekaiApi.netshort.search(query),
            MeloloApi.search(query),
        ]);
        return [
            ...dramabox.map(d => transformDrama(d, "dramabox")),
            ...netshort.map(d => transformDrama(d, "netshort")),
            ...melolo.map(d => transformDrama(d, "melolo")),
        ];
    },
};

export { DramaBoxApi } from "./dramabox";
export { SansekaiApi } from "./sansekai";
export { MeloloApi } from "./melolo";
