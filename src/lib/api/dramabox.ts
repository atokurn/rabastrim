/**
 * DramaBox API Adapter
 * Base URL: https://dramabox-api-test.vercel.app
 * 
 * Uses the dedicated DramaBox API for drama content
 */

const BASE_URL = "https://dramabox-api-test.vercel.app";

export interface Drama {
    bookId: string;
    bookName: string;
    coverWap?: string;
    cover?: string;
    chapterCount?: number;
    introduction?: string;
    score?: string;
    tags?: string[];
    playCount?: string;
}

export interface Episode {
    id: string;
    number: number;
    title: string;
    videoUrl: string;
    thumbnail?: string;
    isVip?: boolean;
}

// Raw API response structure
interface ApiEpisode {
    chapterId: string;
    chapterName: string;
    chapterIndex: number;
    chapterImg?: string;
    videoUrl?: string;
    isVip?: boolean;
    isLocked?: boolean;
    quality?: number;
    allQualities?: Array<{ quality: number; url: string }>;
}

interface HomeResponse {
    success: boolean;
    data?: {
        bannerList?: Drama[];
        newTheaterList?: {
            records?: Drama[];
        };
        columnVoList?: Array<{
            bookList?: Drama[];
        }>;
        recommendList?: {
            records?: Drama[];
        };
    };
}

async function fetchApi<T>(endpoint: string): Promise<T | null> {
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            next: { revalidate: 300 },
        });
        if (!res.ok) {
            console.error(`DramaBox API Error: ${res.status} on ${endpoint}`);
            return null;
        }
        return await res.json();
    } catch (error) {
        console.error(`DramaBox Fetch Error:`, error);
        return null;
    }
}

export const DramaBoxApi = {
    /**
     * Get home page content (banners, featured, columns)
     */
    getHome: async (): Promise<Drama[]> => {
        const data = await fetchApi<HomeResponse>("/api/dramabox/home");
        if (!data?.data) return [];
        const dramas: Drama[] = [];
        if (data.data.bannerList) dramas.push(...data.data.bannerList);
        if (data.data.newTheaterList?.records) dramas.push(...data.data.newTheaterList.records);
        if (data.data.recommendList?.records) dramas.push(...data.data.recommendList.records);
        if (data.data.columnVoList) {
            data.data.columnVoList.forEach(col => {
                if (col.bookList) dramas.push(...col.bookList);
            });
        }
        return dramas;
    },

    /**
     * Get recommendations
     */
    getRecommend: async (): Promise<Drama[]> => {
        const data = await fetchApi<{ success: boolean; data?: Drama[] }>("/api/dramabox/recommend");
        return data?.data || [];
    },

    /**
     * Get ranking list
     */
    getRanking: async (): Promise<Drama[]> => {
        const data = await fetchApi<{ success: boolean; data?: Drama[] }>("/api/dramabox/ranking");
        return data?.data || [];
    },

    /**
     * Get trending dramas
     */
    getTrending: async (): Promise<Drama[]> => {
        const data = await fetchApi<{ success: boolean; data?: Drama[] }>("/api/dramabox/trending");
        return data?.data || [];
    },

    /**
     * Get latest releases
     */
    getLatest: async (): Promise<Drama[]> => {
        const data = await fetchApi<{ success: boolean; data?: Drama[] }>("/api/dramabox/latest");
        return data?.data || [];
    },

    /**
     * Get "For You" personalized content
     */
    getForYou: async (): Promise<Drama[]> => {
        const data = await fetchApi<{ success: boolean; data?: Drama[] }>("/api/dramabox/foryou");
        return data?.data || [];
    },

    /**
     * Get VIP-only dramas
     */
    getVip: async (): Promise<Drama[]> => {
        const data = await fetchApi<{
            success: boolean; data?: {
                columnVoList?: Array<{ bookList?: Drama[] }>;
            }
        }>("/api/dramabox/vip");
        if (!data?.data?.columnVoList) return [];
        // Flatten bookList from all columns
        return data.data.columnVoList.flatMap(col => col.bookList || []);
    },

    /**
     * Get Indonesian dubbed dramas
     */
    getDubIndo: async (): Promise<Drama[]> => {
        const data = await fetchApi<{ success: boolean; data?: Drama[] }>("/api/dramabox/dubindo");
        return data?.data || [];
    },

    /**
     * Get random drama
     */
    getRandomDrama: async (): Promise<Drama[]> => {
        const data = await fetchApi<{ success: boolean; data?: Drama[] }>("/api/dramabox/randomdrama");
        return data?.data || [];
    },

    /**
     * Search dramas by query
     */
    search: async (query: string): Promise<Drama[]> => {
        const data = await fetchApi<{ success: boolean; data?: Drama[] }>(`/api/dramabox/search?q=${encodeURIComponent(query)}`);
        return data?.data || [];
    },

    /**
     * Get popular search keywords
     */
    getPopularSearch: async (): Promise<string[]> => {
        const data = await fetchApi<{ success: boolean; data?: string[] }>("/api/dramabox/populersearch");
        return data?.data || [];
    },

    /**
     * Get drama detail by bookId
     */
    getDetail: async (bookId: string): Promise<Drama | null> => {
        const data = await fetchApi<{
            success: boolean;
            data?: {
                book?: Drama;
                recommends?: Drama[];
                chapterList?: ApiEpisode[];
            }
        }>(`/api/dramabox/detail/${bookId}`);
        return data?.data?.book || null;
    },

    /**
     * Get episodes for a drama
     */
    getEpisodes: async (bookId: string): Promise<Episode[]> => {
        const data = await fetchApi<{ success: boolean; data?: ApiEpisode[] }>(`/api/dramabox/episodes/${bookId}`);
        if (!data?.data) return [];
        return data.data.map(ep => ({
            id: ep.chapterId,
            number: ep.chapterIndex + 1,
            title: ep.chapterName,
            videoUrl: ep.videoUrl || (ep.allQualities?.[0]?.url) || '',
            thumbnail: ep.chapterImg,
            isVip: ep.isVip || ep.isLocked,
        }));
    },
};

