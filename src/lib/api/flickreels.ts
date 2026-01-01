/**
 * FlickReels API Adapter
 * Base URL: https://dramabox-api-test.vercel.app
 * 
 * Uses the FlickReels API for drama content
 */

const BASE_URL = "https://dramabox-api-test.vercel.app";

export interface FlickReelsDrama {
    playlet_id: string | number;
    playlet_title?: string;
    title?: string;  // Search uses 'title' instead of 'playlet_title'
    cover: string;
    process_cover?: string;
    chapter_num?: number;
    upload_num?: number;  // Search uses 'upload_num' instead of 'chapter_num'
    praise_num?: string;
    tag_list?: Array<{ tag_id: number; tag_name: string }>;
    introduce?: string;
}

export interface FlickReelsEpisode {
    chapter_id: string;
    chapter_num: number;
    chapter_title: string;
    chapter_cover?: string;
    hls_url?: string;
    down_url?: string;
    origin_down_url?: string;
    videoUrl?: string;
    duration?: number;
    is_lock?: number;
    is_vip_episode?: number;
    isFree?: boolean;
    isVip?: boolean;
    isLocked?: boolean;
    hasVideo?: boolean;
}

// Response structure for list endpoints (foryou, ranking, recommend)
interface ListApiResponse {
    success: boolean;
    message: string;
    data?: {
        data?: {
            list?: FlickReelsDrama[];
        };
    };
}

// Response structure for search endpoint
interface SearchApiResponse {
    success: boolean;
    message: string;
    data?: {
        data?: FlickReelsDrama[];  // Direct array, not { list: [...] }
    };
}

// Response structure for detail endpoint
interface DetailApiResponse {
    success: boolean;
    data?: {
        data?: {
            playlet_id?: string;
            playlet_title?: string;
            chapter_num?: number;
            praise_num?: string;
            tag_list?: Array<{ tag_id: number; tag_name: string }>;
        };
    };
}

// Response structure for episodes endpoint (has cover and episode list)
interface EpisodesApiResponse {
    success: boolean;
    data?: {
        data?: {
            cover?: string;
            introduce?: string;
            upload_num?: number;
            list?: FlickReelsEpisode[];
        };
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
     * Get home page content
     */
    getHome: async (): Promise<FlickReelsDrama[]> => {
        const data = await fetchApi<ListApiResponse>("/api/flickreels/home");
        return data?.data?.data?.list || [];
    },

    /**
     * Get "For You" recommendations
     */
    getForYou: async (): Promise<FlickReelsDrama[]> => {
        const data = await fetchApi<ListApiResponse>("/api/flickreels/foryou");
        return data?.data?.data?.list || [];
    },

    /**
     * Get ranking list
     * Note: Ranking returns grouped arrays with data[].data[] structure
     * Drama objects use 'title' instead of 'playlet_title'
     */
    getRanking: async (): Promise<FlickReelsDrama[]> => {
        const data = await fetchApi<{
            success: boolean;
            data?: {
                status_code: number;
                data?: Array<{
                    name: string;
                    rank_type: number;
                    data: Array<{
                        playlet_id: string;
                        title: string;
                        cover: string;
                        upload_num: string;
                        introduce?: string;
                        hot_num?: string;
                        tag_name?: string[];
                    }>;
                }>;
            };
        }>("/api/flickreels/ranking");

        // Flatten the grouped ranking structure - take first few from each category
        const groups = data?.data?.data || [];
        const allDramas: FlickReelsDrama[] = [];

        for (const group of groups) {
            for (const drama of (group.data || []).slice(0, 10)) {
                allDramas.push({
                    playlet_id: drama.playlet_id,
                    playlet_title: drama.title, // Map title -> playlet_title
                    cover: drama.cover,
                    chapter_num: parseInt(drama.upload_num) || 0,
                    introduce: drama.introduce,
                    tag_list: drama.tag_name?.map(name => ({ tag_id: 0, tag_name: name })),
                    praise_num: drama.hot_num,
                });
            }
        }

        return allDramas;
    },

    /**
     * Get recommendations
     * Note: /recommend returns a single object, not a list. Use ForYou instead.
     */
    getRecommend: async (): Promise<FlickReelsDrama[]> => {
        // Recommend endpoint returns single object, fallback to ForYou for lists
        const data = await fetchApi<ListApiResponse>("/api/flickreels/foryou");
        return data?.data?.data?.list || [];
    },

    /**
     * Search dramas by query
     * Note: Search response uses data.data[] (direct array), not data.data.list[]
     * Also uses 'title' and 'upload_num' instead of 'playlet_title' and 'chapter_num'
     */
    search: async (query: string): Promise<FlickReelsDrama[]> => {
        const data = await fetchApi<SearchApiResponse>(`/api/flickreels/search?q=${encodeURIComponent(query)}`);
        // Search response is at data.data (array), not data.data.list
        return data?.data?.data || [];
    },

    /**
     * Get drama detail by playletId
     * IMPORTANT: Merges data from detail endpoint (title) and episodes endpoint (cover)
     * because detail endpoint does NOT return cover
     */
    getDetail: async (playletId: string): Promise<FlickReelsDrama | null> => {
        // Fetch both endpoints in parallel for complete data
        const [detailRes, episodesRes] = await Promise.all([
            fetchApi<DetailApiResponse>(`/api/flickreels/detail/${playletId}`),
            fetchApi<EpisodesApiResponse>(`/api/flickreels/episodes/${playletId}`),
        ]);

        const detail = detailRes?.data?.data;
        const episodesData = episodesRes?.data?.data;

        if (!detail && !episodesData) return null;

        // Merge data from both sources
        return {
            playlet_id: detail?.playlet_id || playletId,
            playlet_title: detail?.playlet_title,
            cover: episodesData?.cover || "",
            introduce: episodesData?.introduce || undefined,
            chapter_num: episodesData?.upload_num || detail?.chapter_num,
            upload_num: episodesData?.upload_num,
            praise_num: detail?.praise_num,
            tag_list: detail?.tag_list,
        };
    },

    /**
     * Get episodes for a drama
     */
    getEpisodes: async (playletId: string): Promise<FlickReelsEpisode[]> => {
        const data = await fetchApi<EpisodesApiResponse>(`/api/flickreels/episodes/${playletId}`);
        return data?.data?.data?.list || [];
    },

    /**
     * Get episodes metadata (cover, introduce, etc) without full episode list
     */
    getEpisodesMeta: async (playletId: string): Promise<{ cover?: string; introduce?: string; upload_num?: number } | null> => {
        const data = await fetchApi<EpisodesApiResponse>(`/api/flickreels/episodes/${playletId}`);
        if (!data?.data?.data) return null;
        return {
            cover: data.data.data.cover,
            introduce: data.data.data.introduce,
            upload_num: data.data.data.upload_num,
        };
    },
};
