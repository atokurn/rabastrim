/**
 * FlickReels API Adapter
 * Base URL: https://dramabox-api-test.vercel.app
 * 
 * Uses the FlickReels API for drama content
 */

const BASE_URL = "https://dramabox-api-test.vercel.app";

export interface FlickReelsDrama {
    playlet_id: string;
    playlet_title: string;
    cover: string;
    process_cover?: string;
    chapter_num: number;
    praise_num?: string;
    tag_list?: Array<{ tag_id: number; tag_name: string }>;
}

export interface FlickReelsEpisode {
    chapter_id: string;
    chapter_num: number;
    chapter_title: string;
    chapter_cover?: string;
    hls_url?: string;
    down_url?: string;
    origin_down_url?: string;
    videoUrl?: string; // New: Pre-constructed URL (handles VIP bypass)
    duration?: number;
    is_lock?: number;
    is_vip_episode?: number;
    isFree?: boolean;
    isVip?: boolean;
    isLocked?: boolean;
    hasVideo?: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: {
        data?: T;
        list?: T;
    };
}

async function fetchApi<T>(endpoint: string): Promise<T | null> {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            next: { revalidate: 300 },
        });
        if (!res.ok) {
            console.error(`FlickReels API Error: ${res.status} on ${endpoint}`);
            return null;
        }
        return await res.json();
    } catch (error) {
        console.error(`FlickReels Fetch Error:`, error);
        return null;
    }
}

export const FlickReelsApi = {
    /**
     * Get "For You" recommendations
     */
    getForYou: async (): Promise<FlickReelsDrama[]> => {
        const data = await fetchApi<ApiResponse<{ list: FlickReelsDrama[] }>>("/api/flickreels/foryou");
        return data?.data?.data?.list || [];
    },

    /**
     * Get ranking list
     */
    getRanking: async (): Promise<FlickReelsDrama[]> => {
        const data = await fetchApi<ApiResponse<{ list: FlickReelsDrama[] }>>("/api/flickreels/ranking");
        return data?.data?.data?.list || [];
    },

    /**
     * Get recommendations
     */
    getRecommend: async (): Promise<FlickReelsDrama[]> => {
        const data = await fetchApi<ApiResponse<{ list: FlickReelsDrama[] }>>("/api/flickreels/recommend");
        return data?.data?.data?.list || [];
    },

    /**
     * Search dramas by query
     */
    search: async (query: string): Promise<FlickReelsDrama[]> => {
        const data = await fetchApi<ApiResponse<{ list: FlickReelsDrama[] }>>(`/api/flickreels/search?q=${encodeURIComponent(query)}`);
        return data?.data?.data?.list || [];
    },

    /**
     * Get drama detail by playletId
     */
    getDetail: async (playletId: string): Promise<FlickReelsDrama | null> => {
        const data = await fetchApi<{ success: boolean; data?: { data?: FlickReelsDrama } }>(`/api/flickreels/detail/${playletId}`);
        return data?.data?.data || null;
    },

    /**
     * Get episodes for a drama
     */
    getEpisodes: async (playletId: string): Promise<FlickReelsEpisode[]> => {
        const data = await fetchApi<{ success: boolean; data?: { data?: { list?: FlickReelsEpisode[] } } }>(`/api/flickreels/episodes/${playletId}`);
        return data?.data?.data?.list || [];
    },
};
