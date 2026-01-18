import { NextRequest, NextResponse } from "next/server";
import { searchContent } from "@/lib/services/content-repository";
import { ContentIngestionService, ScraperItem } from "@/lib/services/content-ingestion";
import { SourceAggregator, ProviderName } from "@/lib/sources";
import { ContentProvider, db, contents, Content } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Fetch details from provider API and update DB for items missing description/episodes
 */
async function enrichMissingDetails(items: Content[]): Promise<void> {
    for (const item of items) {
        try {
            const detail = await SourceAggregator.getDetail(
                item.providerContentId,
                item.provider as ProviderName
            );

            if (detail) {
                // Update DB with enriched data
                await db.update(contents)
                    .set({
                        description: detail.description || item.description,
                        episodeCount: detail.totalEpisodes || item.episodeCount,
                        rating: detail.score || item.rating,
                        tags: detail.tags ? JSON.stringify(detail.tags) : item.tags,
                    })
                    .where(eq(contents.id, item.id));

                console.log(`[Enrichment] Updated ${item.title}`);
            }
        } catch (err) {
            console.error(`[Enrichment] Failed for ${item.providerContentId}:`, err);
        }
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!query || query.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        // 1. DB Search
        // Strict Hierarchy: Exact/Prefix -> Fuzzy
        const dbResults = await searchContent(query, limit);

        // 2. Check if Fallback needed
        // If we have enough results (e.g. >= 4), return immediately
        if (dbResults.length >= 4) {
            // Enrich items missing description/episodes (async, update DB in background)
            const itemsNeedingEnrichment = dbResults.filter(
                item => !item.description || !item.episodeCount
            ).slice(0, 3); // Limit to 3 to avoid slow response

            // Fire enrichment in background (don't await)
            if (itemsNeedingEnrichment.length > 0) {
                enrichMissingDetails(itemsNeedingEnrichment).catch(err =>
                    console.error("[Search] Enrichment failed:", err)
                );
            }

            // Transform to frontend-compatible format
            const transformed = dbResults.map(item => ({
                id: item.providerContentId,
                title: item.title,
                cover: item.posterUrl || "",
                description: item.description || undefined,
                episodes: item.episodeCount || undefined,
                score: item.rating || undefined,
                tags: item.tags ? JSON.parse(item.tags) : undefined,
                provider: item.provider,
            }));
            return NextResponse.json({
                success: true,
                results: transformed,
                source: "db"
            });
        }

        // 3. API Fallback (Fan-out)
        // Ensure we search for "all" types to get max coverage
        const apiResponse = await SourceAggregator.search(query, {
            limit: limit,
            page: 1,
            type: "all"
        });

        // 4. Async Ingestion (Fire and forget? No, wait to return combined)
        // We need to ingest to return from DB or just valid objects.
        // Let's ingest then return the combined list or just return the API results merged.

        // Map API results to ScraperItems for ingestion
        // UnifiedDrama interface: { id, title, cover, description, episodes, score, provider, ... }
        const scraperItems: ScraperItem[] = apiResponse.results.map(item => ({
            bookId: item.id,
            title: item.title,
            cover: item.cover, // Correct property
            introduction: item.description,
            // Map other fields as best effort
            provider: item.provider as ContentProvider,
            score: item.score, // Correct property
            episodeCount: item.episodes, // Correct property
        }));

        // Group by provider for ingestion
        const byProvider: Record<string, ScraperItem[]> = {};
        apiResponse.results.forEach(item => {
            const p = item.provider?.toLowerCase() || 'unknown'; // Correct property
            if (!byProvider[p]) byProvider[p] = [];
            byProvider[p].push({
                bookId: item.id,
                title: item.title,
                cover: item.cover,
                description: item.description,
                score: item.score,
                episodeCount: item.episodes,
            });
        });

        // Get user's preferred language from query param (or default to "id")
        const lang = searchParams.get("lang") || "id";

        const ingestionPromises = Object.entries(byProvider).map(([provider, items]) => {
            // Basic validation if provider is valid enum
            if (['dramabox', 'netshort', 'melolo', 'flickreels'].includes(provider)) {
                // For DramaBox, use language-aware sync to save language association
                if (provider === 'dramabox') {
                    return ContentIngestionService.syncContentWithLanguage(
                        provider as ContentProvider,
                        items,
                        lang,
                        "search"
                    );
                }
                return ContentIngestionService.ingestFromSearch(provider as ContentProvider, items);
            }
            return Promise.resolve();
        });

        await Promise.all(ingestionPromises);

        // 5. Re-fetch from DB to get standardized objects
        // This ensures we return consistent Content objects
        const finalResults = await searchContent(query, limit);

        // Transform to frontend-compatible format
        const transformed = finalResults.map(item => ({
            id: item.providerContentId,
            title: item.title,
            cover: item.posterUrl || "",
            description: item.description || undefined,
            episodes: item.episodeCount || undefined,
            score: item.rating || undefined,
            tags: item.tags ? JSON.parse(item.tags) : undefined,
            provider: item.provider,
        }));

        return NextResponse.json({
            success: true,
            results: transformed,
            source: "hybrid"
        });

    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json(
            { error: "Search failed", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
