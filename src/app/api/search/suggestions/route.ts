import { NextRequest, NextResponse } from "next/server";
import { cache, cacheKeys, cacheTTL } from "@/lib/cache";
import { searchContent } from "@/lib/services/content-repository";
import { ContentIngestionService } from "@/lib/services/content-ingestion";
import { SourceAggregator } from "@/lib/sources";
import { ContentProvider } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Suggestion {
    id: string;
    title: string;
    cover?: string;
    provider: string;
    providerContentId: string;
}

// Minimum results before falling back to API
const MIN_LOCAL_RESULTS = 5;

/**
 * GET /api/search/suggestions?q=query
 * 
 * DB-FIRST search suggest with API fallback:
 * 1. Query local DB (fast)
 * 2. If results < MIN_LOCAL_RESULTS, call API
 * 3. Ingest API results to DB (hidden status)
 * 4. Return combined results
 */
export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get("q");

    if (!query || query.length < 2) {
        return NextResponse.json({ suggestions: [] });
    }

    const normalizedQuery = query.toLowerCase().trim();
    const cacheKey = cacheKeys.searchSuggestions(normalizedQuery);

    try {
        const suggestions = await cache.getOrSet<Suggestion[]>(
            cacheKey,
            async () => {
                // Step 1: Query local DB first (fast)
                const localResults = await searchContent(normalizedQuery, 8);

                const suggestions: Suggestion[] = localResults.map(item => ({
                    id: item.id,
                    title: item.title,
                    cover: item.posterUrl || undefined,
                    provider: item.provider,
                    providerContentId: item.providerContentId,
                }));

                // Step 2: If not enough local results, fallback to API
                if (suggestions.length < MIN_LOCAL_RESULTS) {
                    console.log(`[SearchSuggest] Local results: ${suggestions.length}, fetching from API...`);

                    const apiResult = await SourceAggregator.search(query, {
                        limit: 10,
                        page: 1,
                    });

                    // Step 3: Ingest API results to DB (hidden status)
                    const byProvider = new Map<ContentProvider, typeof apiResult.results>();
                    for (const item of apiResult.results) {
                        const provider = item.provider as ContentProvider;
                        if (!byProvider.has(provider)) {
                            byProvider.set(provider, []);
                        }
                        byProvider.get(provider)!.push(item);
                    }

                    // Ingest each provider's results
                    for (const [provider, items] of byProvider) {
                        await ContentIngestionService.ingestFromSearch(
                            provider,
                            items.map(item => ({
                                bookId: item.id, // Correct: bookId
                                title: item.title,
                                description: item.description,
                                poster: item.cover, // Correct: poster
                                episodeCount: item.episodes, // Correct property
                                // tags: item.tags, // Not present in unified drama usually unless mapped
                            }))
                        );
                    }

                    // Add API results to suggestions (deduplicate)
                    const seen = new Set(suggestions.map(s => `${s.provider}-${s.providerContentId}`));
                    for (const item of apiResult.results) {
                        const key = `${item.provider}-${item.id}`;
                        if (!seen.has(key)) {
                            seen.add(key);
                            suggestions.push({
                                id: item.id,
                                title: item.title,
                                cover: item.cover,
                                provider: item.provider,
                                providerContentId: item.id,
                            });
                        }
                        if (suggestions.length >= 8) break;
                    }
                }

                return suggestions.slice(0, 8);
            },
            cacheTTL.search // 120 seconds TTL (can be lowered to 60s for faster updates)
        );

        return NextResponse.json({ suggestions });
    } catch (error) {
        console.error("Suggestions API error:", error);
        return NextResponse.json({ suggestions: [] });
    }
}
