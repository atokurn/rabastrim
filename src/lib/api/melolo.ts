/**
 * Melolo API Adapter
 * Base URL: https://dramabox-api-test.vercel.app
 * 
 * Uses the dedicated Melolo API endpoints (ByteDance/Worldance platform)
 */

const BASE_URL = "https://dramabox-api-test.vercel.app";

export interface MeloloDrama {
    book_id: string;
    book_name: string;
    thumb_url?: string;
    cover_url?: string;
    abstract?: string;
    serial_count?: number;
    stat_infos?: string[];
    introduction?: string;
    // Additional fields from API responses
    read_count?: string;
    like_count?: string;
    category?: string;
}

export interface MeloloEpisode {
    item_id: string;
    vid: string;
    vid_index: number;
    title?: string;
    duration?: number;
    cover_url?: string;
    is_locked?: boolean;
}

export interface MeloloCategory {
    id: string;
    name: string;
    icon?: string;
}

export interface MeloloStreamResponse {
    main_url?: string;
    backup_url?: string;
    expire_time?: number;
    url?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchApi<T>(endpoint: string): Promise<T | null> {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            next: { revalidate: 300 },
        });
        if (!res.ok) {
            console.error(`Melolo API Error: ${res.status} on ${endpoint}`);
            return null;
        }
        return await res.json();
    } catch (error) {
        console.error(`Melolo Fetch Error:`, error);
        return null;
    }
}

// Helper to extract dramas from various response structures
// The Melolo API has a deeply nested structure: data.data.book_tab_infos[].cells[].books[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractDramas(data: any): MeloloDrama[] {
    if (!data) return [];

    // Direct array
    if (Array.isArray(data)) return data;

    // Nested in data.books
    if (data.books && Array.isArray(data.books)) return data.books;

    // Nested in data.data.books
    if (data.data?.books && Array.isArray(data.data.books)) return data.data.books;

    // Deeply nested Melolo structure: data.data.book_tab_infos[].cells[].books[]
    if (data.data?.data?.book_tab_infos && Array.isArray(data.data.data.book_tab_infos)) {
        const allBooks: MeloloDrama[] = [];
        for (const tabInfo of data.data.data.book_tab_infos) {
            if (tabInfo.cells && Array.isArray(tabInfo.cells)) {
                for (const cell of tabInfo.cells) {
                    if (cell.books && Array.isArray(cell.books)) {
                        allBooks.push(...cell.books);
                    }
                }
            }
        }
        return allBooks;
    }

    // Alternative structure: data.data.book_tab_infos (without extra data wrapper)
    if (data.data?.book_tab_infos && Array.isArray(data.data.book_tab_infos)) {
        const allBooks: MeloloDrama[] = [];
        for (const tabInfo of data.data.book_tab_infos) {
            if (tabInfo.cells && Array.isArray(tabInfo.cells)) {
                for (const cell of tabInfo.cells) {
                    if (cell.books && Array.isArray(cell.books)) {
                        allBooks.push(...cell.books);
                    }
                }
            }
        }
        return allBooks;
    }

    // Nested in data.data (simple array)
    if (data.data && Array.isArray(data.data)) return data.data;

    return [];
}

export const MeloloApi = {
    /**
     * Get home page content
     */
    getHome: async (): Promise<MeloloDrama[]> => {
        const data = await fetchApi<{ success: boolean; data?: MeloloDrama[] }>("/api/melolo/home");
        return extractDramas(data);
    },

    /**
     * Get "For You" personalized content
     */
    getForYou: async (): Promise<MeloloDrama[]> => {
        const data = await fetchApi<{ success: boolean; data?: MeloloDrama[] }>("/api/melolo/foryou");
        return extractDramas(data);
    },

    /**
     * Get ranking list
     */
    getRanking: async (): Promise<MeloloDrama[]> => {
        const data = await fetchApi<{ success: boolean; data?: MeloloDrama[] }>("/api/melolo/ranking");
        return extractDramas(data);
    },

    /**
     * Get trending dramas
     */
    getTrending: async (): Promise<MeloloDrama[]> => {
        const data = await fetchApi<{ success: boolean; data?: MeloloDrama[] }>("/api/melolo/trending");
        return extractDramas(data);
    },

    /**
     * Get latest releases
     */
    getLatest: async (): Promise<MeloloDrama[]> => {
        const data = await fetchApi<{ success: boolean; data?: MeloloDrama[] }>("/api/melolo/latest");
        return extractDramas(data);
    },

    /**
     * Get categories/genres list
     */
    getCategories: async (): Promise<MeloloCategory[]> => {
        const data = await fetchApi<{ success: boolean; data?: MeloloCategory[] }>("/api/melolo/categories");
        return data?.data || [];
    },

    /**
     * Search dramas by query
     */
    search: async (query: string): Promise<MeloloDrama[]> => {
        const data = await fetchApi<{ success: boolean; data?: MeloloDrama[] }>(
            `/api/melolo/search?q=${encodeURIComponent(query)}`
        );
        return extractDramas(data);
    },

    /**
     * Get popular search keywords
     */
    getPopularSearch: async (): Promise<string[]> => {
        const data = await fetchApi<{ success: boolean; data?: string[] }>("/api/melolo/search/popular");
        return data?.data || [];
    },

    /**
     * Get search suggestions
     */
    getSuggestions: async (query: string): Promise<string[]> => {
        const data = await fetchApi<{ success: boolean; data?: string[] }>(
            `/api/melolo/search/suggestions?q=${encodeURIComponent(query)}`
        );
        return data?.data || [];
    },

    /**
     * Get drama detail by bookId
     */
    getDetail: async (bookId: string): Promise<MeloloDrama | null> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<{ success: boolean; data?: any }>(`/api/melolo/detail/${bookId}`);
        if (!data?.data) return null;

        // Handle nested structure - detail is in data.data.video_data or data.data directly
        const rawOuter = data.data;
        const raw = rawOuter.data?.video_data || rawOuter.video_data || rawOuter.data || rawOuter;

        // Check if there's valid data
        if (!raw || (Array.isArray(raw) && raw.length === 0)) return null;

        return {
            book_id: raw.series_id || raw.book_id || raw.id || bookId,
            book_name: raw.series_title || raw.book_name || raw.title || raw.name || "Untitled",
            thumb_url: raw.series_cover || raw.thumb_url || raw.cover_url || raw.cover,
            abstract: raw.series_intro || raw.abstract || raw.description || raw.introduction,
            serial_count: raw.episode_cnt || raw.serial_count || raw.episode_count || raw.total_episodes,
            stat_infos: raw.stat_infos || raw.tags,
        };
    },

    /**
     * Get directory / episode list from detail endpoint's video_data.video_list
     */
    getDirectory: async (bookId: string): Promise<MeloloEpisode[]> => {
        // Use detail endpoint as it contains video_data.video_list with vid info
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<{ success: boolean; data?: any }>(`/api/melolo/detail/${bookId}`);
        if (!data?.data) return [];

        // Extract video_list from nested structure
        const rawOuter = data.data;
        const videoData = rawOuter.data?.video_data || rawOuter.video_data;
        const videoList = videoData?.video_list || [];

        if (!Array.isArray(videoList) || videoList.length === 0) {
            // Fallback to directory endpoint if detail doesn't have video_list
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dirData = await fetchApi<{ success: boolean; data?: any }>(`/api/melolo/directory/${bookId}`);
            const itemList = dirData?.data?.data?.item_list || [];
            // item_list contains just IDs, so we need to create episode objects
            return itemList.map((itemId: string, index: number) => ({
                item_id: itemId,
                vid: itemId,
                vid_index: index,
                title: `Episode ${index + 1}`,
            }));
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return videoList.map((ep: any, index: number) => ({
            item_id: ep.vid || String(index),
            vid: ep.vid || "",
            vid_index: (ep.vid_index ?? index + 1) - 1, // API uses 1-based index, convert to 0-based
            title: ep.title || `Episode ${(ep.vid_index ?? index + 1)}`,
            duration: ep.duration,
            cover_url: ep.cover || ep.episode_cover,
            is_locked: ep.disable_play,
        }));
    },

    /**
     * Get episodes with video URLs
     */
    getEpisodes: async (seriesId: string): Promise<MeloloEpisode[]> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<{ success: boolean; data?: any }>(`/api/melolo/episodes/${seriesId}`);
        if (!data?.data) return [];

        const episodes = Array.isArray(data.data) ? data.data : (data.data.items || data.data.episodes || []);

        return episodes.map((ep: MeloloEpisode, index: number) => ({
            item_id: ep.item_id || String(index),
            vid: ep.vid || "",
            vid_index: ep.vid_index ?? index,
            title: ep.title,
            duration: ep.duration,
            cover_url: ep.cover_url,
            is_locked: ep.is_locked,
        }));
    },

    /**
     * Get stream URL for a video
     */
    getStream: async (videoId: string): Promise<MeloloStreamResponse | null> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<{ success: boolean; data?: any }>(
            `/api/melolo/stream?videoId=${videoId}`
        );
        if (!data?.data) return null;

        // Handle deeply nested structure: data.data.data.main_url
        const innerData = data.data.data || data.data;

        return {
            main_url: innerData.main_url,
            backup_url: innerData.backup_url,
            url: innerData.main_url || innerData.backup_url,
            expire_time: innerData.expire_time,
        };
    },
};
