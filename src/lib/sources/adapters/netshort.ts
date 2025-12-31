/**
 * NetShort Source Adapter (via Sansekai API)
 * Weight: 60
 */

import { SansekaiApi } from "@/lib/api/sansekai";
import type { SourceAdapter, UnifiedDrama, UnifiedDetail, UnifiedEpisode } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(data: any): UnifiedDrama {
    return {
        id: data.shortPlayId || data.id || "",
        title: data.shortPlayName || data.title || "Untitled",
        cover: data.shortPlayCover || data.cover || "",
        description: data.description,
        tags: data.labelArray,
        provider: "netshort",
        _weight: 60,
    };
}

export const NetShortAdapter: SourceAdapter = {
    name: "netshort",
    weight: 60,

    search: async (query: string): Promise<UnifiedDrama[]> => {
        try {
            const results = await SansekaiApi.netshort.search(query);
            return results.map(normalize);
        } catch (error) {
            console.error("[NetShort] Search failed:", error);
            return [];
        }
    },

    getTrending: async (): Promise<UnifiedDrama[]> => {
        try {
            const results = await SansekaiApi.netshort.getTheaters();
            return results.slice(0, 20).map(normalize);
        } catch (error) {
            console.error("[NetShort] getTrending failed:", error);
            return [];
        }
    },

    getLatest: async (): Promise<UnifiedDrama[]> => {
        try {
            const results = await SansekaiApi.netshort.getForYou(1);
            return results.map(normalize);
        } catch (error) {
            console.error("[NetShort] getLatest failed:", error);
            return [];
        }
    },

    getDetail: async (id: string): Promise<UnifiedDetail | null> => {
        // NetShort doesn't have a dedicated detail endpoint
        // Return basic info from search or theater
        try {
            const theaters = await SansekaiApi.netshort.getTheaters();
            const found = theaters.find(d => d.shortPlayId === id || d.id === id);
            if (!found) return null;
            return normalize(found) as UnifiedDetail;
        } catch (error) {
            console.error("[NetShort] getDetail failed:", error);
            return null;
        }
    },

    getEpisodes: async (id: string): Promise<UnifiedEpisode[]> => {
        try {
            const episodes = await SansekaiApi.netshort.getAllEpisodes(id);
            return episodes.map((ep, index) => ({
                id: ep.id || String(index + 1),
                number: ep.number || index + 1,
                title: ep.title || `Episode ${index + 1}`,
                videoUrl: ep.videoUrl || "",
                thumbnail: ep.thumbnail,
                provider: "netshort" as const,
            }));
        } catch (error) {
            console.error("[NetShort] getEpisodes failed:", error);
            return [];
        }
    },
};
