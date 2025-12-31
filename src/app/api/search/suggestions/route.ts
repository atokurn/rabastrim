import { NextRequest, NextResponse } from "next/server";
import { cache, cacheKeys, cacheTTL } from "@/lib/cache";
import { SourceAggregator } from "@/lib/sources";

export const dynamic = "force-dynamic";

interface Suggestion {
    id: string;
    title: string;
    cover?: string;
    provider: string;
}

/**
 * GET /api/search/suggestions?q=query
 * Returns lightweight suggestions for autocomplete from ALL providers
 * Uses SourceAggregator for unified multi-source suggestions
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
                // Use SourceAggregator for multi-source suggestions
                const { results } = await SourceAggregator.search(query, {
                    limit: 12,  // Get more, then dedupe
                    page: 1,
                });

                // Deduplicate by title (case-insensitive)
                const seen = new Set<string>();
                const unique: Suggestion[] = [];

                for (const item of results) {
                    const key = item.title.toLowerCase().trim();
                    if (!seen.has(key)) {
                        seen.add(key);
                        unique.push({
                            id: item.id,
                            title: item.title,
                            cover: item.cover,
                            provider: item.provider,
                        });
                    }
                    if (unique.length >= 8) break;
                }

                return unique;
            },
            cacheTTL.search  // 120 seconds TTL
        );

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error("Suggestions API error:", error);
        return NextResponse.json({ suggestions: [] });
    }
}
