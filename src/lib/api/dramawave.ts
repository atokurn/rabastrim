/**
 * DramaWave API Adapter
 * Base URL: https://dramabox-api-test.vercel.app
 * 
 * DramaWave provider from mydramawave.com platform
 */

const BASE_URL = "https://dramabox-api-test.vercel.app";

export interface DramaWaveDrama {
    id: string;
    key?: string;
    title: string;
    cover: string;
    description?: string;
    episodeCount?: number;
    viewCount?: number;
    followCount?: number;
    free?: boolean;
    vipType?: number;
    tags?: string[];
    rating?: string;
    payIndex?: number;
    currentEpisode?: DramaWaveEpisode;
}

export interface DramaWaveEpisode {
    id: string;
    name?: string;
    cover?: string;
    videoUrl?: string;
    duration?: number;
    index: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchApi<T>(endpoint: string): Promise<T | null> {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            next: { revalidate: 300 },
        });
        if (!res.ok) {
            console.error(`DramaWave API Error: ${res.status} on ${endpoint}`);
            return null;
        }
        return await res.json();
    } catch (error) {
        console.error(`DramaWave Fetch Error:`, error);
        return null;
    }
}

// Helper to extract dramas from response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractDramas(data: any): DramaWaveDrama[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
}

export const DramaWaveApi = {
    /**
     * Get home page content
     */
    getHome: async (): Promise<DramaWaveDrama[]> => {
        const data = await fetchApi<{ success: boolean; data?: DramaWaveDrama[] }>("/api/dramawave/home");
        return extractDramas(data);
    },

    /**
     * Get "For You" personalized content
     */
    getForYou: async (): Promise<DramaWaveDrama[]> => {
        const data = await fetchApi<{ success: boolean; data?: DramaWaveDrama[] }>("/api/dramawave/foryou");
        return extractDramas(data);
    },

    /**
     * Get trending dramas
     */
    getTrending: async (): Promise<DramaWaveDrama[]> => {
        const data = await fetchApi<{ success: boolean; data?: DramaWaveDrama[] }>("/api/dramawave/trending");
        return extractDramas(data);
    },

    /**
     * Get ranking list
     */
    getRanking: async (): Promise<DramaWaveDrama[]> => {
        const data = await fetchApi<{ success: boolean; data?: DramaWaveDrama[] }>("/api/dramawave/ranking");
        return extractDramas(data);
    },

    /**
     * Search dramas
     */
    search: async (query: string): Promise<DramaWaveDrama[]> => {
        const data = await fetchApi<{ success: boolean; data?: DramaWaveDrama[] }>(
            `/api/dramawave/search?q=${encodeURIComponent(query)}`
        );
        return extractDramas(data);
    },

    /**
     * Get drama detail by ID
     */
    getDetail: async (id: string): Promise<DramaWaveDrama | null> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<{ success: boolean; data?: any }>(`/api/dramawave/detail/${id}`);
        return data?.data || null;
    },

    /**
     * Get episodes for a drama
     * DramaWave uses episodeCount from detail - we generate episode list based on that
     */
    getEpisodes: async (dramaId: string): Promise<DramaWaveEpisode[]> => {
        const detail = await DramaWaveApi.getDetail(dramaId);
        if (!detail) return [];

        const episodeCount = detail.episodeCount || 0;
        const episodes: DramaWaveEpisode[] = [];

        for (let i = 1; i <= episodeCount; i++) {
            episodes.push({
                id: `${dramaId}-ep-${i}`,
                index: i,
                name: `Episode ${i}`,
            });
        }

        return episodes;
    },

    /**
     * Get video stream URL for an episode using /dramas/{id}/play/{episode} endpoint
     */
    getStream: async (dramaId: string, episodeIndex: number = 1): Promise<string | null> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await fetchApi<{ success: boolean; data?: any }>(
            `/api/dramawave/dramas/${dramaId}/play/${episodeIndex}`
        );

        return data?.data?.videoUrl || null;
    },
};
