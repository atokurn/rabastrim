import { NextRequest, NextResponse } from "next/server";
import { SourceAggregator } from "@/lib/sources";

export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=query&limit=20&page=1&type=all
 * Search across all providers with caching and pagination
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const type = searchParams.get("type") || "all";

    if (!query || query.length < 2) {
        return NextResponse.json({
            results: [],
            total: 0,
            page,
            limit,
            hasMore: false,
            sources: [],
        });
    }

    try {
        // Use SourceAggregator for multi-source search
        const result = await SourceAggregator.search(query, {
            limit,
            page,
            type: type as "all" | "drama" | "movie",
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json(
            {
                results: [],
                total: 0,
                page,
                limit,
                hasMore: false,
                sources: [],
                error: "Search failed"
            },
            { status: 500 }
        );
    }
}
