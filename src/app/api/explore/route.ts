import { NextRequest, NextResponse } from "next/server";
import { ProviderSource, PROVIDERS, DEFAULT_SORTS } from "@/lib/explore";
import { getAggregatedContent, filterItemsLocally, paginateItemsLocally } from "@/lib/explore/aggregator";

/**
 * Explore API - Aggregated Content Index
 * 
 * Strategy:
 * 1. Get full aggregated content from cache (or fetch all endpoints)
 * 2. Apply LOCAL filtering (no additional API calls)
 * 3. Apply LOCAL pagination
 * 
 * This approach enables 100+ items per provider with consistent filtering.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const source = (searchParams.get("source") || searchParams.get("provider") || "dramabox") as ProviderSource;
    const category = searchParams.get("category") || undefined;
    const region = searchParams.get("region") || undefined;
    const year = searchParams.get("year") || undefined;
    const status = searchParams.get("status") || undefined;
    const sort = searchParams.get("sort") || "popular";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Validate source
    const validSources = PROVIDERS.filter(p => p.enabled).map(p => p.id);
    if (!validSources.includes(source)) {
        return NextResponse.json(
            { error: `Invalid source. Valid: ${validSources.join(", ")}` },
            { status: 400 }
        );
    }

    try {
        // Step 1: Get full aggregated content (cached for 30 minutes)
        console.log(`[Explore API] Fetching aggregated content for ${source}...`);
        const allItems = await getAggregatedContent(source);
        console.log(`[Explore API] Got ${allItems.length} items for ${source}`);

        // Step 2: Apply local filtering
        let filteredItems = filterItemsLocally(allItems, { category, region, year, status });

        // Step 3: Apply sorting
        if (sort === "latest") {
            filteredItems = [...filteredItems].reverse();
        }

        // Step 4: Apply local pagination
        const { items: paginatedItems, hasNext, total } = paginateItemsLocally(filteredItems, page, limit);

        // Response
        const response = {
            meta: {
                page,
                limit,
                hasNext,
                total,
                aggregated: true,
            },
            filters: {
                categories: [],
                sorts: DEFAULT_SORTS,
            },
            items: paginatedItems,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("[Explore API] Error:", error);

        // Return empty result instead of error on aggregation failure
        return NextResponse.json({
            meta: { page, limit, hasNext: false, total: 0, aggregated: false },
            filters: { categories: [], sorts: DEFAULT_SORTS },
            items: [],
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}
