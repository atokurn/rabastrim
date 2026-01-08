import { NewContent } from "@/lib/db/schema";

// Type-safe release status values
type ReleaseStatus = "released" | "ongoing" | "upcoming" | "unknown";

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
    contentType?: string;
    // Release info from API
    release_date?: string;
    tahun_rilis?: string;
    is_finish?: boolean;
    is_coming?: boolean;
    score?: number;
}

type ReleaseSource = "api_detail" | "inferred" | "ingestion" | "unknown";

interface ReleaseInfo {
    releaseDate: string | null;
    releaseYear: number | null;
    releaseStatus: ReleaseStatus;
    releaseSource: ReleaseSource;
}

/**
 * Normalize release date info from various API formats
 * ⚠️ releaseDate ≠ createdAt - createdAt is DB ingestion time, releaseDate is content release
 */
function normalizeReleaseInfo(data: BaseProviderData): ReleaseInfo {
    // Debug: Log what we receive
    if (data.tahun_rilis || data.release_date) {
        console.log("[normalizeReleaseInfo] Received:", {
            tahun_rilis: data.tahun_rilis,
            release_date: data.release_date,
            is_finish: data.is_finish,
            year: data.year,
        });
    }

    let releaseDate: string | null = null;
    let releaseYear: number | null = data.year || null;
    let releaseStatus: ReleaseStatus = "unknown";
    let releaseSource: ReleaseSource = "unknown";

    // Try to parse release date from API
    const dateStr = data.release_date || data.tahun_rilis;
    if (dateStr) {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
            releaseDate = parsed.toISOString().split("T")[0]; // YYYY-MM-DD
            releaseYear = parsed.getFullYear();
            releaseStatus = parsed <= new Date() ? "released" : "upcoming";
            releaseSource = "api_detail";  // We have full date from API
        }
    }

    // Override status if API provides explicit flags
    if (data.is_finish) releaseStatus = "released";
    if (data.is_coming) releaseStatus = "upcoming";

    // If we only have year but no full date, mark as inferred
    if (!releaseDate && releaseYear && releaseSource === "unknown") {
        releaseStatus = "released";
        releaseSource = "inferred";
    }

    return { releaseDate, releaseYear, releaseStatus, releaseSource };
}

export function normalizeDramaBox(data: BaseProviderData, fetchedFrom: "trending" | "search" | "home" | "foryou"): NewContent {
    const { releaseDate, releaseYear, releaseStatus, releaseSource } = normalizeReleaseInfo(data);

    return {
        provider: "dramabox",
        providerContentId: data.bookId,
        title: data.bookName || data.title || "Unknown Title",
        altTitles: data.bookName ? JSON.stringify([data.bookName]) : null,
        description: data.introduction || data.desc || data.description || "",
        posterUrl: data.cover || data.poster || "",
        year: data.year || null,
        releaseDate,
        releaseYear,
        releaseStatus,
        releaseSource,
        region: data.region || "CN",
        contentType: "short_drama",
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
    const { releaseDate, releaseYear, releaseStatus, releaseSource } = normalizeReleaseInfo(data);

    return {
        provider: "netshort",
        providerContentId: data.bookId,
        title: data.title || data.bookName || "Unknown Title",
        altTitles: null,
        description: data.description || "",
        posterUrl: data.poster || data.cover || "",
        year: data.year || null,
        releaseDate,
        releaseYear,
        releaseStatus,
        releaseSource,
        region: data.region || null,
        contentType: "short_drama",
        tags: data.tags ? JSON.stringify(data.tags) : null,
        isSeries: true,
        episodeCount: data.episodeCount || data.totalEpisodes || 0,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}

export function normalizeFlickReels(data: BaseProviderData, fetchedFrom: "trending" | "search" | "home" | "foryou"): NewContent {
    const { releaseDate, releaseYear, releaseStatus, releaseSource } = normalizeReleaseInfo(data);

    return {
        provider: "flickreels",
        providerContentId: data.bookId,
        title: data.title || data.bookName || "Unknown Title",
        altTitles: null,
        description: data.description || "",
        posterUrl: data.poster || data.cover || "",
        year: data.year || null,
        releaseDate,
        releaseYear,
        releaseStatus,
        releaseSource,
        region: data.region || null,
        contentType: "short_drama",
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
    const posterUrl = data.poster || data.cover || "";
    const { releaseDate, releaseYear, releaseStatus, releaseSource } = normalizeReleaseInfo(data);

    return {
        provider: "melolo",
        providerContentId: data.bookId || String(Math.random()),
        title: data.bookName || data.title || "Unknown Title",
        altTitles: null,
        description: data.description || data.introduction || "",
        posterUrl,
        year: null,
        releaseDate,
        releaseYear,
        releaseStatus,
        releaseSource,
        region: "ID",
        contentType: "short_drama",
        tags: null,
        isSeries: true,
        episodeCount: data.episodeCount || 0,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}

export function normalizeDramaQueen(data: BaseProviderData, fetchedFrom: "trending" | "search" | "home" | "foryou"): NewContent {
    const contentType = (data.contentType === "donghua" || data.contentType === "anime") ? "anime" : "drama";
    const { releaseDate, releaseYear, releaseStatus, releaseSource } = normalizeReleaseInfo(data);

    return {
        provider: "dramaqueen",
        providerContentId: data.bookId,
        title: data.title || data.bookName || "Unknown Title",
        altTitles: null,
        description: data.description || data.desc || "",
        posterUrl: data.cover || data.poster || "",
        year: data.year || null,
        releaseDate,
        releaseYear,
        releaseStatus,
        releaseSource,
        region: data.region || "CN",
        contentType,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        isSeries: true,
        episodeCount: data.episodeCount || data.totalEpisodes || 0,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}

/**
 * Normalize donghua content - same as DramaQueen but with provider='donghua'
 * This enables correct video playback routing via getDonghuaEpisodes()
 */
export function normalizeDonghua(data: BaseProviderData, fetchedFrom: "trending" | "search" | "home" | "foryou"): NewContent {
    const { releaseDate, releaseYear, releaseStatus, releaseSource } = normalizeReleaseInfo(data);

    return {
        provider: "donghua",  // Changed from "dramaqueen" for correct video routing
        providerContentId: data.bookId,
        title: data.title || data.bookName || "Unknown Title",
        altTitles: null,
        description: data.description || data.desc || "",
        posterUrl: data.cover || data.poster || "",
        year: data.year || null,
        releaseDate,
        releaseYear,
        releaseStatus,
        releaseSource,
        region: "CN",  // Donghua is Chinese animation
        contentType: "anime",
        tags: data.tags ? JSON.stringify(data.tags) : null,
        isSeries: true,
        episodeCount: data.episodeCount || data.totalEpisodes || 0,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}
