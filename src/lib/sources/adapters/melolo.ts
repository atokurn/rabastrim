/**
 * Melolo Source Adapter (via Sansekai API)
 * Weight: 50
 */

import { SansekaiApi } from "@/lib/api/sansekai";
import type { SourceAdapter, UnifiedDrama, UnifiedDetail, UnifiedEpisode } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(data: any): UnifiedDrama {
    // Handle HEIC images
    const rawCover = data.thumb_url || data.cover || "";
    const cover = rawCover.includes(".heic")
        ? `https://wsrv.nl/?url=${encodeURIComponent(rawCover)}&output=webp&q=85`
        : rawCover;

    return {
        id: data.book_id || data.id || "",
        title: data.book_name || data.title || "Untitled",
        cover,
        description: data.abstract || data.description,
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
            const results = await SansekaiApi.melolo.search(query);
            return results.map(normalize);
        } catch (error) {
            console.error("[Melolo] Search failed:", error);
            return [];
        }
    },

    getTrending: async (): Promise<UnifiedDrama[]> => {
        try {
            const results = await SansekaiApi.melolo.getTrending();
            return results.map(normalize);
        } catch (error) {
            console.error("[Melolo] getTrending failed:", error);
            return [];
        }
    },

    getLatest: async (): Promise<UnifiedDrama[]> => {
        try {
            const results = await SansekaiApi.melolo.getLatest();
            return results.map(normalize);
        } catch (error) {
            console.error("[Melolo] getLatest failed:", error);
            return [];
        }
    },

    getDetail: async (id: string): Promise<UnifiedDetail | null> => {
        try {
            const data = await SansekaiApi.melolo.getDetail(id);
            if (!data) return null;
            return normalize(data) as UnifiedDetail;
        } catch (error) {
            console.error("[Melolo] getDetail failed:", error);
            return null;
        }
    },

    getEpisodes: async (_id: string): Promise<UnifiedEpisode[]> => {
        // Melolo episodes require video stream endpoint
        // This would need additional implementation
        console.warn("[Melolo] getEpisodes not fully implemented");
        return [];
    },
};
