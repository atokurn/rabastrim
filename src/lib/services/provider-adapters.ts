import { normalizeCountry } from "@/lib/utils/country";

export interface ContentInput {
    bookId: string;
    title: string;
    description?: string;
    poster?: string;
    episodeCount?: number;
    tags?: string[];
    isVip?: boolean;
    region?: string;
    contentType?: string;
    // Release info
    year?: number;
    tahun_rilis?: string;
    is_finish?: boolean;
    is_coming?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptDramaBox(item: any): ContentInput {
    return {
        bookId: item.bookId || item.book_id || "",
        title: item.bookName || item.book_name || item.title || "Untitled",
        description: item.introduction || item.desc,
        poster: item.coverWap || item.cover,
        episodeCount: item.chapterCount,
        tags: item.tags,
        isVip: item.isVip,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptFlickReels(item: any): ContentInput {
    return {
        bookId: String(item.playlet_id || ""),
        title: item.playlet_title || item.title || "Untitled",
        description: item.introduce,
        poster: item.cover || item.process_cover,
        episodeCount: item.chapter_num || item.upload_num,
        tags: item.tag_list?.map((t: { tag_name: string }) => t.tag_name),
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptMelolo(item: any): ContentInput {
    const rawImage = item.thumb_url || item.cover || "";
    // Note: wsrv.nl optimization logic moved here for consistency if needed, 
    // or kept in ingestion. For adapter, we just return the raw or normalized string.
    const poster = rawImage && rawImage.includes(".heic")
        ? `https://wsrv.nl/?url=${encodeURIComponent(rawImage)}&output=webp&q=85`
        : rawImage;

    return {
        bookId: item.book_id || item.id || "",
        title: item.book_name || item.title || "Untitled",
        description: item.abstract || item.introduction || undefined,
        poster,
        episodeCount: item.serial_count || undefined,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptDramaQueen(item: any, type: "drama" | "anime" = "drama"): ContentInput {
    // DramaQueenApi normalizes negara -> country
    // The API might return 'type' as 'donghua' or 'drama'
    const contentType = type === "anime" ? "donghua" : (item.type === "donghua" ? "donghua" : "drama");

    // Extract year
    const tahunRilis = item.tahun_rilis;
    const year = tahunRilis ? parseInt(String(tahunRilis).slice(0, 4)) : (item.year ? parseInt(item.year) : undefined);

    return {
        bookId: String(item.id || item.bookId || ""),
        title: item.title || item.name || "Untitled",
        description: item.description || item.desc || undefined,
        poster: item.cover || item.landscapeCover || undefined,
        episodeCount: item.episodes || item.totalEpisodes || item.episodeCount ? parseInt(String(item.episodes || item.totalEpisodes || item.episodeCount)) : undefined,
        region: normalizeCountry(item.country || item.region) || undefined,
        contentType,
        tags: item.type ? [item.type] : undefined,
        year,
        tahun_rilis: tahunRilis,
        is_finish: item.is_finish ?? (item.status === "Completed"),
        is_coming: item.is_coming ?? (item.status === "Coming Soon"),
    };
}

// Sansekai (NetShort) Adapter placeholder
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptNetShort(item: any): ContentInput {
    // Implement based on Sansekai API structure when available
    return {
        bookId: String(item.id || ""),
        title: item.title || "Untitled",
        description: item.description,
        poster: item.cover,
        // ...
    };
}
