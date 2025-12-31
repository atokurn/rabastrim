import { NextRequest, NextResponse } from "next/server";
import { DramaBoxApi } from "@/lib/api/dramabox";
import { cache, cacheKeys, cacheTTL } from "@/lib/cache";

export const dynamic = "force-dynamic";

interface Suggestion {
    id: string;
    title: string;
    provider: string;
}

/**
 * GET /api/search/suggestions?q=query
 * Returns lightweight suggestions for autocomplete with caching
 */
export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get("q");

    if (!query || query.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    // Normalize query
    const normalizedQuery = query.toLowerCase().trim();
    const cacheKey = cacheKeys.searchSuggestions(normalizedQuery);

    try {
        const suggestions = await cache.getOrSet<Suggestion[]>(
            cacheKey,
            async () => {
                // Use DramaBox as primary source (fastest)
                const results = await DramaBoxApi.search(query);

                // Return only title + id + provider (lightweight) - max 8 items
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return results.slice(0, 8).map((d: any) => ({
                    id: d.bookId,
                    title: d.bookName || "Untitled",
                    provider: "dramabox",
                }));
            },
            cacheTTL.search  // 120 seconds TTL
        );

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error("Suggestions API error:", error);
        return NextResponse.json({ suggestions: [] });
    }
}
