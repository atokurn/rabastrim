/**
 * DramaBox Source Adapter
 * Weight: 100 (highest priority)
 */

import { DramaBoxApi } from "@/lib/api/dramabox";
import type { SourceAdapter, UnifiedDrama, UnifiedDetail, UnifiedEpisode } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(data: any): UnifiedDrama {
    return {
        id: data.bookId || "",
        title: data.bookName || "Untitled",
        cover: data.coverWap || data.cover || "",
        description: data.introduction,
        episodes: data.chapterCount,
        score: data.score ? parseFloat(String(data.score)) : undefined,
        tags: data.tagNames || data.tags,
        playCount: data.playCount,
        provider: "dramabox",
        _weight: 100,
    };
}

export const DramaBoxAdapter: SourceAdapter = {
    name: "dramabox",
    weight: 100,

    search: async (query: string): Promise<UnifiedDrama[]> => {
        try {
            const results = await DramaBoxApi.search(query);
            return results.map(normalize);
        } catch (error) {
            console.error("[DramaBox] Search failed:", error);
            return [];
        }
    },

    getTrending: async (): Promise<UnifiedDrama[]> => {
        try {
            const results = await DramaBoxApi.getTrending();
            return results.map(normalize);
        } catch (error) {
            console.error("[DramaBox] getTrending failed:", error);
            return [];
        }
    },

    getLatest: async (): Promise<UnifiedDrama[]> => {
        try {
            const results = await DramaBoxApi.getLatest();
            return results.map(normalize);
        } catch (error) {
            console.error("[DramaBox] getLatest failed:", error);
            return [];
        }
    },

    getDetail: async (id: string): Promise<UnifiedDetail | null> => {
        try {
            const data = await DramaBoxApi.getDetail(id);
            if (!data) return null;
            return {
                ...normalize(data),
                totalEpisodes: data.chapterCount,
            };
        } catch (error) {
            console.error("[DramaBox] getDetail failed:", error);
            return null;
        }
    },

    getEpisodes: async (id: string): Promise<UnifiedEpisode[]> => {
        try {
            const episodes = await DramaBoxApi.getEpisodes(id);
            return episodes.map(ep => ({
                id: ep.id,
                number: ep.number,
                title: ep.title,
                videoUrl: ep.videoUrl,
                thumbnail: ep.thumbnail,
                isVip: ep.isVip,
                provider: "dramabox" as const,
            }));
        } catch (error) {
            console.error("[DramaBox] getEpisodes failed:", error);
            return [];
        }
    },
};
