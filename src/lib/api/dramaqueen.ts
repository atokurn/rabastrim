/**
 * Drama Queen API Adapter
 * Base URL: https://drama-queen-api.vercel.app/api
 * 
 * Provides Korean/Asian Drama and Donghua (Chinese Animation) content
 * Video: Direct Whatbox links (720p MP4) with auto-authentication
 * 
 * API Response Field Mapping:
 * - Drama: name, cover_url, img_landscape_url, desc, genre, jumlah_episode
 * - Donghua: name, image, description, genre, jumlah_episode
 * - Episodes: episodeNumber/number_episode, videoUrl/link720_pro/link_720
 */

const BASE_URL = "https://drama-queen-api.vercel.app/api";
const API_KEY = "7a56ed7a117d0b58f841f827314fa95d927kdjn0okdkndjaebdndwkamvnfjdltdk";

// Types for normalized output
export interface DramaQueenDrama {
    id: string;
    title: string;
    cover?: string;
    landscapeCover?: string;
    description?: string;
    year?: string;
    rating?: string;
    score?: number;
    episodes?: number;
    totalEpisodes?: number;
    status?: string;
    genres?: string[];
    country?: string;
    type?: "drama" | "donghua";
    views?: number;
}

export interface DramaQueenEpisode {
    id: string;
    number: number;
    title?: string;
    videoUrl?: string;
    thumbnail?: string;
    duration?: number;
}

export interface DramaQueenDetail extends DramaQueenDrama {
    cast?: { name: string; role?: string }[];
    director?: string;
    releaseDate?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchApi<T>(endpoint: string): Promise<T | null> {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                "x-api-key": API_KEY,
            },
            next: { revalidate: 300 },
        });
        if (!res.ok) {
            console.error(`Drama Queen API Error: ${res.status} on ${endpoint}`);
            return null;
        }
        return await res.json();
    } catch (error) {
        console.error(`Drama Queen Fetch Error:`, error);
        return null;
    }
}

/**
 * Normalize drama from API response to unified format
 * API uses: name, cover_url, desc, genre, jumlah_episode
 * Note: /popular endpoint returns {id: ranking_order, drama_id: actual_id}
 *       /latest endpoint returns {id: actual_id}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDrama(item: any): DramaQueenDrama {
    return {
        // Prioritize drama_id (from /popular) over id (from /latest)
        id: String(item.drama_id || item.id || ""),
        title: item.name || item.title || "Untitled",
        cover: item.cover_url || item.cover || item.image || item.poster || "",
        landscapeCover: item.img_landscape_url || item.cover_url || "",
        description: item.desc || item.description || item.synopsis || "",
        year: item.tahun_rilis ? String(item.tahun_rilis).slice(0, 4) : undefined,
        rating: item.rating ? String(item.rating) : undefined,
        score: item.rating ? parseFloat(String(item.rating)) : undefined,
        episodes: item.jumlah_episode || item.episode_count || item.episodes,
        totalEpisodes: item.episode_final || item.total_episodes,
        status: item.is_finish ? "Completed" : item.is_coming ? "Coming Soon" : "Ongoing",
        genres: item.genre || item.genres || [],
        country: item.negara || item.country,
        type: item.type === "donghua" ? "donghua" : "drama",
        views: item.views,
    };
}

/**
 * Normalize donghua from API response
 * API uses: name, image, description, genre, jumlah_episode
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDonghua(item: any): DramaQueenDrama {
    return {
        id: String(item.id || ""),
        title: item.name || item.title || "Untitled",
        cover: item.image || item.cover_url || item.cover || "",
        description: item.description || item.desc || item.synopsis || "",
        year: item.tahun_rilis ? String(item.tahun_rilis).slice(0, 4) : undefined,
        rating: item.rating ? String(item.rating) : undefined,
        score: item.rating ? parseFloat(String(item.rating)) : undefined,
        episodes: item.jumlah_episode || item.episode_count,
        totalEpisodes: item.episode_final,
        status: item.is_finish ? "Completed" : "Ongoing",
        genres: item.genre || item.genres || [],
        type: "donghua",
        views: item.views,
    };
}

/**
 * Normalize episode from API response
 * API uses: episodeNumber/number_episode, videoUrl/link720_pro/link_720
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEpisode(ep: any, index: number): DramaQueenEpisode {
    return {
        id: String(ep.id || index + 1),
        number: ep.episodeNumber || ep.number_episode || ep.number || index + 1,
        title: ep.title || `Episode ${ep.episodeNumber || ep.number_episode || index + 1}`,
        // Priority: link720_en (public HLS, no auth required) > authenticated URLs
        // Using link720_en first prevents Chrome from showing HTTP Basic Auth popup
        videoUrl: ep.link720_en || ep.videoUrl || ep.videoUrlPremium || ep.link720_premium || ep.link720_pro || ep.link_720 || undefined,
        thumbnail: ep.thumbnail,
        duration: ep.duration,
    };
}

// Helper to extract dramas from response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractDramas(data: any, isDonghua = false): DramaQueenDrama[] {
    if (!data) return [];

    let items: any[] = [];
    if (Array.isArray(data)) {
        items = data;
    } else if (data.data && Array.isArray(data.data)) {
        items = data.data;
    } else if (data.dramas && Array.isArray(data.dramas)) {
        items = data.dramas;
    } else if (data.results && Array.isArray(data.results)) {
        items = data.results;
    } else if (data.items && Array.isArray(data.items)) {
        items = data.items;
    }

    return items.map(item => isDonghua ? normalizeDonghua(item) : normalizeDrama(item));
}

export const DramaQueenApi = {
    // ============================================
    // DRAMA ENDPOINTS
    // ============================================

    /**
     * Get home page data (popular and latest)
     */
    getHome: async (): Promise<DramaQueenDrama[]> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<any>("/drama/home");
        return extractDramas(data);
    },

    /**
     * Get popular dramas
     */
    getPopular: async (): Promise<DramaQueenDrama[]> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<any>("/drama/popular");
        return extractDramas(data);
    },

    /**
     * Get latest dramas
     */
    getLatest: async (limit = 20): Promise<DramaQueenDrama[]> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<any>(`/drama/latest?limit=${limit}`);
        return extractDramas(data);
    },

    /**
     * Get paginated drama list
     */
    getList: async (page = 1, limit = 20): Promise<DramaQueenDrama[]> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<any>(`/drama/list?page=${page}&limit=${limit}`);
        return extractDramas(data);
    },

    /**
     * Search dramas by keyword
     */
    search: async (query: string, page = 1): Promise<DramaQueenDrama[]> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<any>(`/drama/search?q=${encodeURIComponent(query)}&page=${page}`);
        return extractDramas(data);
    },

    /**
     * Get drama detail by ID
     */
    getDetail: async (id: string): Promise<DramaQueenDetail | null> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<any>(`/drama/detail/${id}`);
        if (!data) return null;
        const item = data.data || data;
        return normalizeDrama(item) as DramaQueenDetail;
    },

    /**
     * Get episodes with video URLs
     */
    getEpisodes: async (id: string): Promise<DramaQueenEpisode[]> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<any>(`/drama/episodes/${id}`);
        if (!data) return [];

        const episodes = data.data || data.episodes || data;
        if (!Array.isArray(episodes)) return [];

        return episodes.map((ep, index) => normalizeEpisode(ep, index));
    },

    /**
     * Get single episode detail
     */
    getEpisode: async (id: string): Promise<DramaQueenEpisode | null> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<any>(`/drama/episode/${id}`);
        if (!data) return null;
        const ep = data.data || data;
        return normalizeEpisode(ep, 0);
    },

    // ============================================
    // DONGHUA ENDPOINTS
    // ============================================

    /**
     * Get donghua list
     */
    getDonghuaList: async (page = 1): Promise<DramaQueenDrama[]> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<any>(`/donghua/list?page=${page}`);
        return extractDramas(data, true);
    },

    /**
     * Get donghua detail
     */
    getDonghuaDetail: async (id: string): Promise<DramaQueenDetail | null> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<any>(`/donghua/detail/${id}`);
        if (!data) return null;
        const item = data.data || data;
        return normalizeDonghua(item) as DramaQueenDetail;
    },

    /**
     * Get donghua episodes
     * Note: Donghua API doesn't have separate episodes endpoint
     * Episodes are included in the detail response at data.episodes[]
     */
    getDonghuaEpisodes: async (id: string): Promise<DramaQueenEpisode[]> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<any>(`/donghua/detail/${id}`);
        if (!data) return [];

        // Episodes are included in the detail response
        const detail = data.data || data;
        const episodes = detail.episodes || [];
        if (!Array.isArray(episodes)) return [];

        // Normalize with Donghua-specific field names
        return episodes.map((ep, index) => ({
            id: String(ep.id || index + 1),
            number: ep.number_episode || ep.episodeNumber || ep.number || index + 1,
            title: ep.title || `Episode ${ep.number_episode || index + 1}`,
            // Donghua uses link_720 and videoUrl fields
            videoUrl: ep.videoUrl || ep.link_720 || undefined,
            thumbnail: ep.thumbnail,
            duration: ep.duration,
        }));
    },

    // ============================================
    // COMBINED METHODS
    // ============================================

    /**
     * Get trending (combines popular drama + donghua)
     */
    getTrending: async (): Promise<DramaQueenDrama[]> => {
        const [popular, donghua] = await Promise.all([
            DramaQueenApi.getPopular(),
            DramaQueenApi.getDonghuaList(1),
        ]);
        return [...popular.slice(0, 10), ...donghua.slice(0, 5)];
    },

    /**
     * Get Korean dramas (filtered by negara = "South Korea")
     */
    getKoreanDramas: async (limit = 20): Promise<DramaQueenDrama[]> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<any>(`/drama/latest?limit=100`);
        const dramas = extractDramas(data);
        // Filter by country
        return dramas
            .filter(d => d.country === "South Korea")
            .slice(0, limit);
    },

    /**
     * Get Chinese dramas (filtered by negara = "China")
     */
    getChineseDramas: async (limit = 20): Promise<DramaQueenDrama[]> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<any>(`/drama/latest?limit=100`);
        const dramas = extractDramas(data);
        // Filter by country
        return dramas
            .filter(d => d.country === "China")
            .slice(0, limit);
    },
};
