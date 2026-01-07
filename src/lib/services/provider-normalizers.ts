import { NewContent } from "@/lib/db/schema";

interface BaseProviderData {
    bookId: string;
    bookName?: string;
    title?: string;
    cover?: string;
    poster?: string;
    introduction?: string;
    desc?: string;
    description?: string;
    totalEpisodes?: number;
    episodeCount?: number;
    tags?: string[];
    tagNames?: string[];
    year?: number;
    region?: string;
    score?: number;
}

export function normalizeDramaBox(data: BaseProviderData, fetchedFrom: "trending" | "search" | "home" | "foryou"): NewContent {
    return {
        provider: "dramabox",
        providerContentId: data.bookId,
        title: data.bookName || data.title || "Unknown Title",
        altTitles: data.bookName ? JSON.stringify([data.bookName]) : null,
        description: data.introduction || data.desc || data.description || "",
        posterUrl: data.cover || data.poster || "",
        year: data.year || null,
        region: data.region || null,
        tags: data.tagNames ? JSON.stringify(data.tagNames) : data.tags ? JSON.stringify(data.tags) : null,
        isSeries: true,
        episodeCount: data.totalEpisodes || data.episodeCount || 0,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}

export function normalizeNetShort(data: BaseProviderData, fetchedFrom: "trending" | "search" | "home" | "foryou"): NewContent {
    return {
        provider: "netshort",
        providerContentId: data.bookId, // Assuming NetShort uses bookId mostly
        title: data.title || data.bookName || "Unknown Title",
        altTitles: null,
        description: data.description || "",
        posterUrl: data.poster || data.cover || "",
        year: data.year || null,
        region: null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        isSeries: true,
        episodeCount: data.episodeCount || data.totalEpisodes || 0,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}

export function normalizeMelolo(data: BaseProviderData, fetchedFrom: "trending" | "search" | "home" | "foryou"): NewContent {
    return {
        provider: "melolo",
        providerContentId: data.bookId || String(Math.random()),
        title: data.title || "Unknown Title",
        altTitles: null,
        description: data.description || "",
        posterUrl: data.cover || "",
        year: null,
        region: null,
        tags: null,
        isSeries: true,
        episodeCount: data.episodeCount || 0,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}
