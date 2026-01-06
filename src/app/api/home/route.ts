import { NextResponse } from "next/server";
import { ContentRepository } from "@/lib/services/content-repository";
import { DramaBoxApi } from "@/lib/api/dramabox";
import { FlickReelsApi } from "@/lib/api/flickreels";
import { MeloloApi } from "@/lib/api/melolo";
import { cache, cacheKeys, cacheTTL } from "@/lib/cache";
import type { Content } from "@/lib/db";

interface HomeItem {
    id: string;
    title: string;
    image: string;
    badge?: string;
    isVip?: boolean;
    episodes?: string;
    provider: string;
}

interface HomeSection {
    provider: string;
    title: string;
    items: HomeItem[];
}

// Transform Content from DB to HomeItem format
function transformContent(content: Content, index?: number): HomeItem {
    return {
        id: content.providerContentId,
        title: content.title,
        image: content.posterUrl || "",
        badge: index !== undefined && index < 10 ? `TOP ${index + 1}` : undefined,
        episodes: content.episodeCount ? `${content.episodeCount} Eps` : undefined,
        provider: content.provider,
        isVip: content.isVip ?? false,
    };
}

// Transform external API data (fallback only)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformDramaBox(drama: any, index?: number): HomeItem {
    return {
        id: drama.bookId || drama.book_id || String(index),
        title: drama.bookName || drama.book_name || drama.title || "Untitled",
        image: drama.coverWap || drama.cover || "",
        badge: index !== undefined && index < 10 ? `TOP ${index + 1}` : undefined,
        episodes: drama.chapterCount ? `${drama.chapterCount} Eps` : undefined,
        provider: "dramabox",
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformFlickReels(drama: any, index?: number): HomeItem {
    return {
        id: drama.playlet_id || String(index),
        title: drama.playlet_title || "Untitled",
        image: drama.cover || drama.process_cover || "",
        badge: index !== undefined && index < 10 ? `TOP ${index + 1}` : undefined,
        episodes: drama.chapter_num ? `${drama.chapter_num} Eps` : undefined,
        provider: "flickreels",
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformMelolo(drama: any, index?: number): HomeItem {
    const rawImage = drama.thumb_url || drama.cover || "";
    const image = rawImage && rawImage.includes(".heic")
        ? `https://wsrv.nl/?url=${encodeURIComponent(rawImage)}&output=webp&q=85`
        : rawImage;

    return {
        id: drama.book_id || drama.id || String(index),
        title: drama.book_name || drama.title || "Untitled",
        image,
        badge: index !== undefined && index < 10 ? `TOP ${index + 1}` : undefined,
        provider: "melolo",
    };
}

const SECTION_TITLES: Record<string, string> = {
    dramabox: "DramaBox - Trending",
    flickreels: "FlickReels - For You",
    melolo: "Melolo - Trending",
};

/**
 * GET /api/home
 * 
 * DB-FIRST approach:
 * 1. Try fetching from local database (fast)
 * 2. If DB is empty or has insufficient data, fallback to external APIs
 */
export async function GET() {
    try {
        const data = await cache.getOrSet(
            cacheKeys.home(),
            async () => {
                // Step 1: Try local DB first
                const dbContent = await ContentRepository.getForHomepageGrouped(12);

                // Check if we have enough data from DB (lowered threshold)
                const hasEnoughData = dbContent.length >= 1 &&
                    dbContent.some(section => section.items.length >= 3);

                if (hasEnoughData) {
                    console.log("[Home] Serving from local DB");

                    const sections: HomeSection[] = dbContent.map(section => ({
                        provider: section.provider,
                        title: SECTION_TITLES[section.provider] || section.provider,
                        items: section.items.map((item, index) => transformContent(item, index)),
                    }));

                    return { sections, source: "db" };
                }

                // Step 2: Fallback to external APIs if DB doesn't have enough data
                console.log("[Home] DB insufficient, falling back to external APIs");

                const [
                    dramaboxTrending,
                    flickreelsForYou,
                    meloloTrending,
                ] = await Promise.all([
                    DramaBoxApi.getTrending().catch(() => []),
                    FlickReelsApi.getForYou().catch(() => []),
                    MeloloApi.getTrending().catch(() => []),
                ]);

                const sections: HomeSection[] = [];

                if (flickreelsForYou.length > 0) {
                    sections.push({
                        provider: "flickreels",
                        title: SECTION_TITLES.flickreels,
                        items: flickreelsForYou.slice(0, 12).map((d, i) => transformFlickReels(d, i)),
                    });
                }

                if (dramaboxTrending.length > 0) {
                    sections.push({
                        provider: "dramabox",
                        title: SECTION_TITLES.dramabox,
                        items: dramaboxTrending.slice(0, 12).map((d, i) => transformDramaBox(d, i)),
                    });
                }

                if (meloloTrending.length > 0) {
                    sections.push({
                        provider: "melolo",
                        title: SECTION_TITLES.melolo,
                        items: meloloTrending.slice(0, 12).map((d, i) => transformMelolo(d, i)),
                    });
                }

                return { sections, source: "api" };
            },
            cacheTTL.home
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error("Home API error:", error);
        return NextResponse.json({ error: "Failed to fetch home data" }, { status: 500 });
    }
}
