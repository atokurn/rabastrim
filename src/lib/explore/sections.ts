/**
 * Section Config per Provider
 * 
 * Each provider has its own sections based on available API endpoints.
 * Sections are displayed as horizontal carousels on the Explore page.
 */

import { DramaBoxApi } from "@/lib/api/dramabox";
import { FlickReelsApi } from "@/lib/api/flickreels";
import { MeloloApi } from "@/lib/api/melolo";
import { DramaWaveApi } from "@/lib/api/dramawave";
import { DramaQueenApi } from "@/lib/api/dramaqueen";
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

// Normalize Drama Queen item (already normalized by DramaQueenApi)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDramaQueen(item: any): ExploreItem {
    return {
        id: item.id || "",
        title: item.title || "Untitled",
        poster: item.cover || item.landscapeCover || "",
        episodes: item.episodes || item.totalEpisodes,
        tags: item.genres,
        source: "dramaqueen",
        score: item.score,
        description: item.description,
    };
}

// Normalize Donghua item - requires separate provider for correct video fetching
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDonghua(item: any): ExploreItem {
    return {
        id: item.id || "",
        title: item.title || "Untitled",
        poster: item.cover || item.landscapeCover || "",
        episodes: item.episodes || item.totalEpisodes,
        tags: item.genres,
        source: "donghua", // Use donghua provider for correct API routing
        score: item.score,
        description: item.description,
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

// Melolo sections
const MELOLO_SECTIONS: SectionConfig[] = [
    { id: "trending", source: "melolo", title: "Trending", icon: "🔥", variant: "ranking", fetcher: MeloloApi.getTrending, normalizer: normalizeMelolo },
    { id: "latest", source: "melolo", title: "Terbaru", icon: "🆕", variant: "portrait", fetcher: MeloloApi.getLatest, normalizer: normalizeMelolo },
];

// Normalize DramaWave item
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDramaWave(item: any): ExploreItem {
    return {
        id: item.id || item.key || "",
        title: item.title || "Untitled",
        poster: item.cover || "",
        episodes: item.episodeCount,
        tags: item.tags,
        source: "dramawave",
        description: item.description,
    };
}

// DramaWave sections
const DRAMAWAVE_SECTIONS: SectionConfig[] = [
    { id: "trending", source: "dramawave", title: "Trending", icon: "🔥", variant: "ranking", layout: "ranking-list", fetcher: DramaWaveApi.getTrending, normalizer: normalizeDramaWave },
    { id: "home", source: "dramawave", title: "Untuk Kamu", icon: "🌊", variant: "portrait", layout: "carousel", fetcher: DramaWaveApi.getHome, normalizer: normalizeDramaWave },
    { id: "ranking", source: "dramawave", title: "Ranking", icon: "📊", variant: "portrait", layout: "grid", fetcher: DramaWaveApi.getRanking, normalizer: normalizeDramaWave },
];

// Drama Queen sections
const DRAMAQUEEN_SECTIONS: SectionConfig[] = [
    { id: "popular", source: "dramaqueen", title: "Drama Populer", icon: "⭐", variant: "portrait", layout: "carousel", fetcher: DramaQueenApi.getPopular, normalizer: normalizeDramaQueen },
    { id: "korea", source: "dramaqueen", title: "Drama Korea", icon: "🇰🇷", variant: "portrait", layout: "carousel", fetcher: () => DramaQueenApi.getKoreanDramas(20), normalizer: normalizeDramaQueen },
    { id: "china", source: "dramaqueen", title: "Drama China", icon: "🇨🇳", variant: "portrait", layout: "carousel", fetcher: () => DramaQueenApi.getChineseDramas(20), normalizer: normalizeDramaQueen },
    { id: "latest", source: "dramaqueen", title: "Terbaru", icon: "🆕", variant: "portrait", layout: "carousel", fetcher: DramaQueenApi.getLatest, normalizer: normalizeDramaQueen },
];

// Anime sections (Donghua)
const ANIME_SECTIONS: SectionConfig[] = [
    { id: "donghua", source: "donghua", title: "Donghua", icon: "🐲", variant: "portrait", layout: "grid", fetcher: () => DramaQueenApi.getDonghuaList(1), normalizer: normalizeDonghua },
];

// Get sections for a provider
export function getProviderSections(provider: ProviderSource): SectionConfig[] {
    switch (provider) {
        case "dramabox":
            return DRAMABOX_SECTIONS;
        case "flickreels":
            return FLICKREELS_SECTIONS;
        case "melolo":
            return MELOLO_SECTIONS;
        case "dramawave":
            return DRAMAWAVE_SECTIONS;
        case "dramaqueen":
            return DRAMAQUEEN_SECTIONS;
        case "anime":
            return ANIME_SECTIONS;
        default:
            return [];
    }
}
