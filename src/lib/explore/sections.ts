/**
 * Section Config per Provider
 * 
 * Each provider has its own sections based on available API endpoints.
 * Sections are displayed as horizontal carousels on the Explore page.
 */

import { DramaBoxApi } from "@/lib/api/dramabox";
import { FlickReelsApi } from "@/lib/api/flickreels";
import { SansekaiApi } from "@/lib/api/sansekai";
import { MeloloApi } from "@/lib/api/melolo";
import { ProviderSource, ExploreItem } from "./types";

// Section configuration
export interface SectionConfig {
    id: string;
    source: ProviderSource; // Provider source for unique SWR key
    title: string;
    icon: string;
    variant?: "portrait" | "landscape" | "ranking"; // Card style variant
    layout?: "carousel" | "grid" | "ranking-list";    // Section layout
    imageType?: "portrait" | "landscape";           // Preferred image orientation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetcher: () => Promise<any[]>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    normalizer: (item: any) => ExploreItem;
}

// Normalize DramaBox item
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDramaBox(item: any): ExploreItem {
    return {
        id: item.bookId || item.book_id || "",
        title: item.bookName || item.book_name || "Untitled",
        poster: item.cover || item.coverWap || "",
        landscapePoster: item.coverWap || item.cover || "",
        episodes: item.chapterCount,
        tags: item.tags,
        source: "dramabox",
        isVip: item.isVip,
        score: item.score ? parseFloat(item.score) : undefined,
        description: item.introduction,
        views: item.playCount,
        hotBadge: item.isHot ? "Hot" : undefined,
    };
}

// Normalize FlickReels item
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeFlickReels(item: any): ExploreItem {
    return {
        id: String(item.playlet_id || ""),
        title: item.playlet_title || item.title || "Untitled",
        poster: item.cover || item.process_cover || "",
        landscapePoster: item.process_cover || item.cover || "",
        episodes: item.chapter_num || item.upload_num,
        tags: item.tag_list?.map((t: { tag_name: string }) => t.tag_name),
        source: "flickreels",
        description: item.introduce,
        views: item.praise_num,
    };
}

// Normalize NetShort item
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeNetShort(item: any): ExploreItem {
    return {
        id: item.shortPlayId || item.id || "",
        title: item.shortPlayName || item.title || "Untitled",
        poster: item.shortPlayCover || item.coverUrl || item.cover || "",
        source: "netshort",
    };
}

// Normalize Melolo item
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMelolo(item: any): ExploreItem {
    const rawImage = item.thumb_url || item.cover || "";
    const poster = rawImage && rawImage.includes(".heic")
        ? `https://wsrv.nl/?url=${encodeURIComponent(rawImage)}&output=webp&q=85`
        : rawImage;

    return {
        id: item.book_id || item.id || "",
        title: item.book_name || item.title || "Untitled",
        poster,
        source: "melolo",
    };
}

// Normalize Anime item
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAnime(item: any): ExploreItem {
    return {
        id: item.url || item.id || "",
        title: item.judul || item.title || "Untitled",
        poster: item.cover || "",
        source: "anime",
    };
}

// DramaBox sections
const DRAMABOX_SECTIONS: SectionConfig[] = [
    { id: "trending", source: "dramabox", title: "Trending", icon: "🔥", variant: "portrait", layout: "carousel", fetcher: DramaBoxApi.getTrending, normalizer: normalizeDramaBox },
    { id: "recommend", source: "dramabox", title: "Rekomendasi", icon: "🎯", variant: "portrait", layout: "grid", fetcher: DramaBoxApi.getRecommend, normalizer: normalizeDramaBox },
    { id: "latest", source: "dramabox", title: "Terbaru", icon: "🆕", variant: "portrait", layout: "carousel", fetcher: DramaBoxApi.getLatest, normalizer: normalizeDramaBox },
    { id: "ranking", source: "dramabox", title: "Populer", icon: "⭐", variant: "ranking", layout: "ranking-list", fetcher: DramaBoxApi.getRanking, normalizer: normalizeDramaBox },
    { id: "vip", source: "dramabox", title: "VIP", icon: "👑", variant: "portrait", layout: "carousel", fetcher: DramaBoxApi.getVip, normalizer: normalizeDramaBox },
];

// FlickReels sections
const FLICKREELS_SECTIONS: SectionConfig[] = [
    { id: "foryou", source: "flickreels", title: "Untuk Kamu", icon: "💝", variant: "portrait", layout: "carousel", fetcher: FlickReelsApi.getForYou, normalizer: normalizeFlickReels },
    { id: "ranking", source: "flickreels", title: "Ranking", icon: "📊", variant: "ranking", layout: "ranking-list", fetcher: FlickReelsApi.getRanking, normalizer: normalizeFlickReels },
    { id: "recommend", source: "flickreels", title: "Rekomendasi", icon: "✨", variant: "portrait", layout: "grid", fetcher: FlickReelsApi.getRecommend, normalizer: normalizeFlickReels },
];

// NetShort sections
const NETSHORT_SECTIONS: SectionConfig[] = [
    { id: "foryou", source: "netshort", title: "Untuk Kamu", icon: "💝", variant: "landscape", fetcher: () => SansekaiApi.netshort.getForYou(1), normalizer: normalizeNetShort },
    { id: "theaters", source: "netshort", title: "Theater", icon: "🎭", variant: "portrait", fetcher: SansekaiApi.netshort.getTheaters, normalizer: normalizeNetShort },
];

// Melolo sections
const MELOLO_SECTIONS: SectionConfig[] = [
    { id: "trending", source: "melolo", title: "Trending", icon: "🔥", variant: "ranking", fetcher: MeloloApi.getTrending, normalizer: normalizeMelolo },
    { id: "latest", source: "melolo", title: "Terbaru", icon: "🆕", variant: "portrait", fetcher: MeloloApi.getLatest, normalizer: normalizeMelolo },
];

// Anime sections
const ANIME_SECTIONS: SectionConfig[] = [
    { id: "latest", source: "anime", title: "Terbaru", icon: "🆕", variant: "portrait", fetcher: SansekaiApi.anime.getLatest, normalizer: normalizeAnime },
];

// Get sections for a provider
export function getProviderSections(provider: ProviderSource): SectionConfig[] {
    switch (provider) {
        case "dramabox":
            return DRAMABOX_SECTIONS;
        case "flickreels":
            return FLICKREELS_SECTIONS;
        case "netshort":
            return NETSHORT_SECTIONS;
        case "melolo":
            return MELOLO_SECTIONS;
        case "anime":
            return ANIME_SECTIONS;
        default:
            return [];
    }
}
