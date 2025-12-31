/**
 * FlickReels Source Adapter
 * Weight: 80
 */

import { FlickReelsApi } from "@/lib/api/flickreels";
import type { SourceAdapter, UnifiedDrama, UnifiedDetail, UnifiedEpisode } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(data: any): UnifiedDrama {
    return {
        id: String(data.playlet_id || ""),
        // Search uses 'title', other endpoints use 'playlet_title'
        title: data.title || data.playlet_title || "Untitled",
        cover: data.cover || data.process_cover || "",
        // Search uses 'upload_num', other endpoints use 'chapter_num'
        episodes: data.upload_num || data.chapter_num,
        description: data.introduce,
        tags: data.tag_list?.map((t: { tag_name: string }) => t.tag_name),
        playCount: data.praise_num,
        provider: "flickreels",
        _weight: 80,
    };
}

export const FlickReelsAdapter: SourceAdapter = {
    name: "flickreels",
    weight: 80,

    search: async (query: string): Promise<UnifiedDrama[]> => {
        try {
            const results = await FlickReelsApi.search(query);
            return results.map(normalize);
        } catch (error) {
            console.error("[FlickReels] Search failed:", error);
            return [];
        }
    },

    getTrending: async (): Promise<UnifiedDrama[]> => {
        try {
            const results = await FlickReelsApi.getRanking();
            return results.map(normalize);
        } catch (error) {
            console.error("[FlickReels] getTrending failed:", error);
            return [];
        }
    },

    getLatest: async (): Promise<UnifiedDrama[]> => {
        try {
            const results = await FlickReelsApi.getForYou();
            return results.map(normalize);
        } catch (error) {
            console.error("[FlickReels] getLatest failed:", error);
            return [];
        }
    },

    getDetail: async (id: string): Promise<UnifiedDetail | null> => {
        try {
            const data = await FlickReelsApi.getDetail(id);
            if (!data) return null;
            return {
                ...normalize(data),
                totalEpisodes: data.chapter_num,
            };
        } catch (error) {
            console.error("[FlickReels] getDetail failed:", error);
            return null;
        }
    },

    getEpisodes: async (id: string): Promise<UnifiedEpisode[]> => {
        try {
            const episodes = await FlickReelsApi.getEpisodes(id);
            return episodes.map(ep => ({
                id: ep.chapter_id,
                number: ep.chapter_num,
                title: ep.chapter_title || `Episode ${ep.chapter_num}`,
                videoUrl: ep.videoUrl || ep.hls_url || ep.down_url || "",
                thumbnail: ep.chapter_cover,
                duration: ep.duration,
                isVip: ep.isVip || ep.is_vip_episode === 1,
                isLocked: ep.isLocked || ep.is_lock === 1,
                provider: "flickreels" as const,
            }));
        } catch (error) {
            console.error("[FlickReels] getEpisodes failed:", error);
            return [];
        }
    },
};
