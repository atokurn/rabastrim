/**
 * Sansekai API Adapter
 * Base URL: https://api.sansekai.my.id/api
 * 
 * This adapter provides: NetShort, Melolo, Anime
 * DramaBox is handled by the dedicated DramaBox API
 */

const BASE_URL = "https://api.sansekai.my.id/api";

// Common interfaces
export interface Drama {
    id: string;
    title: string;
    cover: string;
    description?: string;
    episodes?: number;
    // NetShort specific
    shortPlayId?: string;
    shortPlayName?: string;
    labelArray?: string[];
    // Melolo specific
    book_id?: string;
    book_name?: string;
    abstract?: string;
    // Anime specific
    judul?: string;
    sinopsis?: string;
    genre?: string[];
    url?: string;
}

export interface Episode {
    id: string;
    number: number;
    title: string;
    videoUrl?: string;
    thumbnail?: string;
}

async function fetchApi<T>(endpoint: string): Promise<T | null> {
    // START SSL BYPASS
    const originalReject = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            next: { revalidate: 300 },
        });

        // Restore logic (optional, but good for safety if we care, 
        // but for this dev session keeping it off might be safer for stability)
        // process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalReject; 

        if (!res.ok) {
            console.error(`Sansekai API Error: ${res.status} on ${endpoint}`);
            return null;
        }
        return await res.json();
    } catch (error) {
        console.error(`Sansekai Fetch Error:`, error);
        return null;
    } finally {
        // Restore to prevent security holes elsewhere if needed
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalReject;
    }
}

// =====================
// NetShort Provider
// =====================
export const SansekaiNetShort = {
    getTheaters: async (): Promise<Drama[]> => {
        const data = await fetchApi<{ contentInfos?: Drama[] }[]>("/netshort/theaters");
        if (!data || !Array.isArray(data)) return [];
        // Flatten all contentInfos from groups
        return data.flatMap(group => group.contentInfos || []);
    },
    getForYou: (page = 1) => fetchApi<Drama[]>(`/netshort/foryou?page=${page}`).then(d => d || []),
    search: (query: string) =>
        fetchApi<Drama[]>(`/netshort/search?query=${encodeURIComponent(query)}`).then(d => d || []),
    getAllEpisodes: (shortPlayId: string) =>
        fetchApi<Episode[]>(`/netshort/allepisode?shortPlayId=${shortPlayId}`).then(d => d || []),
};

// =====================
// Melolo Provider
// =====================
interface MeloloResponse {
    books?: Drama[];
}

export const SansekaiMelolo = {
    getTrending: async (): Promise<Drama[]> => {
        const data = await fetchApi<MeloloResponse>("/melolo/trending");
        return data?.books || [];
    },
    getLatest: async (): Promise<Drama[]> => {
        const data = await fetchApi<MeloloResponse>("/melolo/latest");
        return data?.books || [];
    },
    search: (query: string, limit = 10, offset = 0) =>
        fetchApi<Drama[]>(`/melolo/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`).then(d => d || []),
    getDetail: (bookId: string) =>
        fetchApi<Drama>(`/melolo/detail?bookId=${bookId}`),
    getStream: (videoId: string) =>
        fetchApi<{ url?: string }>(`/melolo/stream?videoId=${videoId}`),
};

// =====================
// Anime Provider
// =====================
export const SansekaiAnime = {
    getLatest: () => fetchApi<Drama[]>("/anime/latest").then(d => d || []),
    search: (query: string) =>
        fetchApi<Drama[]>(`/anime/search?query=${encodeURIComponent(query)}`).then(d => d || []),
    getDetail: (url: string) =>
        fetchApi<Drama>(`/anime/detail?url=${encodeURIComponent(url)}`),
    getVideo: (url: string) =>
        fetchApi<{ url?: string }>(`/anime/getvideo?url=${encodeURIComponent(url)}`),
};

// Convenience aggregator
export const SansekaiApi = {
    netshort: SansekaiNetShort,
    melolo: SansekaiMelolo,
    anime: SansekaiAnime,
};
