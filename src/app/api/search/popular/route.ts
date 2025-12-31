import { NextResponse } from "next/server";
import { DramaBoxApi } from "@/lib/api/dramabox";
import { cache, cacheKeys, cacheTTL } from "@/lib/cache";

export const dynamic = "force-dynamic";

interface PopularItem {
    id: string;
    title: string;
    cover: string;
    rank: number;
    episodes?: number;
    playCount?: string;
    provider: string;
}

/**
 * GET /api/search/popular
 * Returns popular/trending dramas for discovery with caching
 */
export async function GET() {
    const cacheKey = cacheKeys.searchPopular();

    try {
        const popular = await cache.getOrSet<PopularItem[]>(
            cacheKey,
            async () => {
                // Get trending from DramaBox for popular searches
                const trending = await DramaBoxApi.getTrending();

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return trending.slice(0, 10).map((d: any, index: number) => ({
                    id: d.bookId,
                    title: d.bookName || "Untitled",
                    cover: d.coverWap || d.cover || "",
                    rank: index + 1,
                    episodes: d.chapterCount,
                    playCount: d.playCount,
                    provider: "dramabox",
                }));
            },
            cacheTTL.recommendation  // 300 seconds TTL (5 minutes)
        );

        return NextResponse.json({ popular });
    } catch (error) {
        console.error("Popular API error:", error);
        return NextResponse.json({ popular: [] });
    }
}
