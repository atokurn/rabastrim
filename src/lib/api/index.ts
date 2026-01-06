/**
 * API Aggregator
 * 
 * Unified interface for fetching data from multiple providers.
 * Use this for consistent data access across the app.
 */

import { DramaBoxApi, Drama as DramaBoxDrama } from "./dramabox";
import { MeloloApi, MeloloDrama } from "./melolo";
import { DramaQueenApi, DramaQueenDrama } from "./dramaqueen";

// Re-export types
export type { DramaBoxDrama, MeloloDrama, DramaQueenDrama };

export interface UnifiedDrama {
    id: string;
    title: string;
    cover: string;
    description?: string;
    episodes?: number;
    score?: number;
    tags?: string[];
    year?: string;
    provider: "dramabox" | "flickreels" | "melolo" | "dramaqueen";
}

/**
 * Transform API responses to unified format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformDrama(drama: any, provider: UnifiedDrama["provider"]): UnifiedDrama {
    return {
        id: drama.bookId || drama.book_id || drama.playlet_id || drama.id || "",
        title: drama.bookName || drama.book_name || drama.playlet_title || drama.title || "Untitled",
        cover: drama.coverWap || drama.cover || drama.process_cover || drama.thumb_url || drama.image || drama.poster || "",
        description: drama.introduction || drama.abstract || drama.introduce || drama.description || drama.synopsis,
        episodes: drama.chapterCount || drama.serial_count || drama.chapter_num || drama.episodes || drama.episodeCount,
        score: drama.score ? parseFloat(String(drama.score)) : (drama.rating ? parseFloat(String(drama.rating)) : undefined),
        tags: drama.tags || drama.genres,
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
        const [dramabox, melolo, dramaqueen] = await Promise.all([
            DramaBoxApi.getTrending(),
            MeloloApi.getTrending(),
            DramaQueenApi.getTrending(),
        ]);
        return [
            ...dramabox.map(d => transformDrama(d, "dramabox")),
            ...melolo.map(d => transformDrama(d, "melolo")),
            ...dramaqueen.map(d => transformDrama(d, "dramaqueen")),
        ];
    },

    /**
     * Get latest releases
     */
    getLatest: async (): Promise<UnifiedDrama[]> => {
        const [dramabox, melolo, dramaqueen] = await Promise.all([
            DramaBoxApi.getLatest(),
            MeloloApi.getLatest(),
            DramaQueenApi.getLatest(),
        ]);
        return [
            ...dramabox.map(d => transformDrama(d, "dramabox")),
            ...melolo.map(d => transformDrama(d, "melolo")),
            ...dramaqueen.map(d => transformDrama(d, "dramaqueen")),
        ];
    },

    /**
     * Search across providers
     */
    search: async (query: string): Promise<UnifiedDrama[]> => {
        const [dramabox, melolo, dramaqueen] = await Promise.all([
            DramaBoxApi.search(query),
            MeloloApi.search(query),
            DramaQueenApi.search(query),
        ]);
        return [
            ...dramabox.map(d => transformDrama(d, "dramabox")),
            ...melolo.map(d => transformDrama(d, "melolo")),
            ...dramaqueen.map(d => transformDrama(d, "dramaqueen")),
        ];
    },
};

export { DramaBoxApi } from "./dramabox";
export { MeloloApi } from "./melolo";
export { DramaQueenApi } from "./dramaqueen";
