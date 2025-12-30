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
     * Get trending/featured dramas from home page
     */
    getTrending: async (): Promise<Drama[]> => {
        const data = await fetchApi<HomeResponse>("/api/dramabox/home");
        if (!data?.data) return [];
        // Get dramas from newTheaterList.records
        return data.data.newTheaterList?.records || [];
    },

    /**
     * Get latest releases (using home page data)
     */
    getLatest: async (): Promise<Drama[]> => {
        const data = await fetchApi<HomeResponse>("/api/dramabox/home");
        if (!data?.data) return [];
        // Aggregate from all columnVoList
        const dramas: Drama[] = [];
        if (data.data.columnVoList) {
            data.data.columnVoList.forEach(col => {
                if (col.bookList) dramas.push(...col.bookList);
            });
        }
        // If no columnVoList, fallback to newTheaterList
        if (dramas.length === 0 && data.data.newTheaterList?.records) {
            dramas.push(...data.data.newTheaterList.records);
        }
        return dramas;
    },

    /**
     * Get all home page content
     */
    getHome: async (): Promise<Drama[]> => {
        const data = await fetchApi<HomeResponse>("/api/dramabox/home");
        if (!data?.data) return [];
        const dramas: Drama[] = [];
        // Banners
        if (data.data.bannerList) dramas.push(...data.data.bannerList);
        // New Theater
        if (data.data.newTheaterList?.records) dramas.push(...data.data.newTheaterList.records);
        // Recommend
        if (data.data.recommendList?.records) dramas.push(...data.data.recommendList.records);
        // Columns
        if (data.data.columnVoList) {
            data.data.columnVoList.forEach(col => {
                if (col.bookList) dramas.push(...col.bookList);
            });
        }
        return dramas;
    },

    /**
     * Search dramas by query
     */
    search: async (query: string): Promise<Drama[]> => {
        const data = await fetchApi<{ success: boolean; data?: Drama[] }>(`/api/dramabox/search?q=${encodeURIComponent(query)}`);
        return data?.data || [];
    },

    /**
     * Get drama detail by bookId
     */
    getDetail: async (bookId: string): Promise<Drama | null> => {
        const data = await fetchApi<{ success: boolean; data?: Drama }>(`/api/dramabox/detail/${bookId}`);
        return data?.data || null;
    },

    /**
     * Get episodes for a drama
     */
    getEpisodes: async (bookId: string): Promise<Episode[]> => {
        const data = await fetchApi<{ success: boolean; data?: ApiEpisode[] }>(`/api/dramabox/episodes/${bookId}`);
        if (!data?.data) return [];

        // Transform API response to our Episode format
        return data.data.map(ep => ({
            id: ep.chapterId,
            number: ep.chapterIndex + 1, // Convert 0-based to 1-based
            title: ep.chapterName,
            videoUrl: ep.videoUrl || (ep.allQualities?.[0]?.url) || '',
            thumbnail: ep.chapterImg,
            isVip: ep.isVip || ep.isLocked,
        }));
    },
};
