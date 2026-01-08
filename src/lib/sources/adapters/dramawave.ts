/**
 * DramaWave Source Adapter
 * 
 * Normalizes DramaWave API responses to unified format
 */

import { DramaWaveApi, DramaWaveDrama } from "@/lib/api/dramawave";
import type { SourceAdapter, UnifiedDrama, UnifiedDetail, UnifiedEpisode } from "../types";

// Normalize DramaWave drama to unified format
function normalize(drama: DramaWaveDrama): UnifiedDrama {
    return {
        id: drama.id,
        title: drama.title || "Untitled",
        cover: drama.cover || "",
        description: drama.description,
        episodes: drama.episodeCount,
        tags: drama.tags,
        provider: "dramawave",
        _weight: 60, // Priority weight for aggregation
    };
}

export const DramaWaveAdapter: SourceAdapter = {
    name: "dramawave",
    weight: 60,

    search: async (query: string): Promise<UnifiedDrama[]> => {
        try {
            const data = await DramaWaveApi.search(query);
            return data.map(normalize);
        } catch (error) {
            console.error("[DramaWave] search failed:", error);
            return [];
        }
    },

    getTrending: async (): Promise<UnifiedDrama[]> => {
        try {
            const data = await DramaWaveApi.getTrending();
            return data.map(normalize);
        } catch (error) {
            console.error("[DramaWave] getTrending failed:", error);
            return [];
        }
    },

    getLatest: async (): Promise<UnifiedDrama[]> => {
        try {
            // DramaWave uses home as latest
            const data = await DramaWaveApi.getHome();
            return data.map(normalize);
        } catch (error) {
            console.error("[DramaWave] getLatest failed:", error);
            return [];
        }
    },

    getDetail: async (id: string): Promise<UnifiedDetail | null> => {
        try {
            const data = await DramaWaveApi.getDetail(id);
            if (!data) return null;
            return {
                ...normalize(data),
                totalEpisodes: data.episodeCount,
            } as UnifiedDetail;
        } catch (error) {
            console.error("[DramaWave] getDetail failed:", error);
            return null;
        }
    },

    getEpisodes: async (id: string): Promise<UnifiedEpisode[]> => {
        try {
            const detail = await DramaWaveApi.getDetail(id);
            if (!detail) return [];

            const episodeCount = detail.episodeCount || 0;
            const episodes: UnifiedEpisode[] = [];

            // Generate episode list - video URL will be fetched when playing
            for (let i = 1; i <= episodeCount; i++) {
                episodes.push({
                    id: `${id}-ep-${i}`,
                    number: i,
                    title: `Episode ${i}`,
                    videoUrl: "", // Will be fetched via stream endpoint when playing
                    provider: "dramawave",
                });
            }

            return episodes;
        } catch (error) {
            console.error("[DramaWave] getEpisodes failed:", error);
            return [];
        }
    },
};
