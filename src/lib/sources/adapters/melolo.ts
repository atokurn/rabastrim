/**
 * Melolo Source Adapter (via new Melolo API)
 * Weight: 50
 */

import { MeloloApi, MeloloDrama } from "@/lib/api/melolo";
import type { SourceAdapter, UnifiedDrama, UnifiedDetail, UnifiedEpisode } from "../types";

function normalize(data: MeloloDrama): UnifiedDrama {
    // Handle HEIC images
    const rawCover = data.thumb_url || data.cover_url || "";
    const cover = rawCover.includes(".heic")
        ? `https://wsrv.nl/?url=${encodeURIComponent(rawCover)}&output=webp&q=85`
        : rawCover;

    return {
        id: data.book_id || "",
        title: data.book_name || "Untitled",
        cover,
        description: data.abstract || data.introduction,
        episodes: data.serial_count,
        provider: "melolo",
        _weight: 50,
    };
}

export const MeloloAdapter: SourceAdapter = {
    name: "melolo",
    weight: 50,

    search: async (query: string): Promise<UnifiedDrama[]> => {
        try {
            const results = await MeloloApi.search(query);
            return results.map(normalize);
        } catch (error) {
            console.error("[Melolo] Search failed:", error);
            return [];
        }
    },

    getTrending: async (): Promise<UnifiedDrama[]> => {
        try {
            const results = await MeloloApi.getTrending();
            return results.map(normalize);
        } catch (error) {
            console.error("[Melolo] getTrending failed:", error);
            return [];
        }
    },

    getLatest: async (): Promise<UnifiedDrama[]> => {
        try {
            const results = await MeloloApi.getLatest();
            return results.map(normalize);
        } catch (error) {
            console.error("[Melolo] getLatest failed:", error);
            return [];
        }
    },

    getDetail: async (id: string): Promise<UnifiedDetail | null> => {
        try {
            const data = await MeloloApi.getDetail(id);
            if (!data) return null;
            return normalize(data) as UnifiedDetail;
        } catch (error) {
            console.error("[Melolo] getDetail failed:", error);
            return null;
        }
    },

    getEpisodes: async (id: string): Promise<UnifiedEpisode[]> => {
        try {
            const episodes = await MeloloApi.getDirectory(id);
            return episodes.map(ep => ({
                id: ep.item_id || ep.vid || String(ep.vid_index),
                number: (ep.vid_index ?? 0) + 1,
                title: ep.title || `Episode ${(ep.vid_index ?? 0) + 1}`,
                videoUrl: "", // Will be fetched via stream endpoint when playing
                videoId: ep.vid,
                thumbnail: ep.cover_url,
                isLocked: ep.is_locked,
                provider: "melolo" as const,
            }));
        } catch (error) {
            console.error("[Melolo] getEpisodes failed:", error);
            return [];
        }
    },
};
