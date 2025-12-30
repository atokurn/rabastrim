import { NextResponse } from "next/server";
import { DramaBoxApi } from "@/lib/api/dramabox";
import { SansekaiApi } from "@/lib/api/sansekai";
import { cache, cacheKeys, cacheTTL } from "@/lib/cache";

interface HomeItem {
    id: string;
    title: string;
    image: string;
    badge?: string;
    isVip?: boolean;
    episodes?: string;
    provider: string;
}

// Transform functions
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

function transformNetShort(drama: any): HomeItem {
    return {
        id: drama.shortPlayId || drama.id || "",
        title: drama.shortPlayName || drama.title || "Untitled",
        image: drama.shortPlayCover || drama.coverUrl || drama.cover || "",
        provider: "netshort",
    };
}

function transformAnime(drama: any): HomeItem {
    return {
        id: drama.url || drama.id || "",
        title: drama.judul || drama.title || "Untitled",
        image: drama.cover || "",
        provider: "anime",
    };
}

export async function GET() {
    try {
        const data = await cache.getOrSet(
            cacheKeys.home(),
            async () => {
                const [
                    dramaboxTrending,
                    dramaboxLatest,
                    netshortTheaters,
                    meloloTrending,
                    animeLatest,
                ] = await Promise.all([
                    DramaBoxApi.getTrending().catch(() => []),
                    DramaBoxApi.getLatest().catch(() => []),
                    SansekaiApi.netshort.getTheaters().catch(() => []),
                    SansekaiApi.melolo.getTrending().catch(() => []),
                    SansekaiApi.anime.getLatest().catch(() => []),
                ]);

                return {
                    dramabox: {
                        trending: dramaboxTrending.slice(0, 12).map((d, i) => transformDramaBox(d, i)),
                        latest: dramaboxLatest.slice(0, 12).map(d => transformDramaBox(d)),
                    },
                    netshort: netshortTheaters.slice(0, 12).map(d => transformNetShort(d)),
                    melolo: meloloTrending.slice(0, 12).map((d, i) => transformMelolo(d, i)),
                    anime: animeLatest.slice(0, 12).map(d => transformAnime(d)),
                };
            },
            cacheTTL.home
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error("Home API error:", error);
        return NextResponse.json({ error: "Failed to fetch home data" }, { status: 500 });
    }
}
