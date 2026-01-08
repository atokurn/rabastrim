import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contents } from "@/lib/db/schema";
import { desc, lt, eq, and, or, ilike, sql } from "drizzle-orm";

// Fallback imports for API-based data when DB is empty
import { DramaBoxApi } from "@/lib/api/dramabox";
import { FlickReelsApi } from "@/lib/api/flickreels";
import { MeloloApi } from "@/lib/api/melolo";

export const dynamic = 'force-dynamic';

interface NormalizedItem {
    id: string;
    title: string;
    image: string;
    episodes?: string;
    provider: string;
    createdAt?: string;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Cursor-based pagination (NOT page-based)
    const cursor = searchParams.get("cursor"); // ISO timestamp
    const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 40); // Max 40
    const provider = searchParams.get("provider") || "all";
    const category = searchParams.get("category"); // Optional category filter

    try {
        // Build WHERE conditions
        const conditions = [eq(contents.status, "active")];

        // Cursor condition
        if (cursor) {
            conditions.push(lt(contents.createdAt, new Date(cursor)));
        }

        // Provider filter
        if (provider && provider !== "all") {
            conditions.push(eq(contents.provider, provider));
        }

        // Category-based filtering
        if (category === "Short Drama") {
            // Only short drama providers
            conditions.push(
                or(
                    eq(contents.provider, "dramabox"),
                    eq(contents.provider, "flickreels"),
                    eq(contents.provider, "melolo")
                )!
            );
        } else if (category === "Drama China") {
            conditions.push(
                or(
                    ilike(contents.region, "%china%"),
                    ilike(contents.region, "%tiongkok%")
                )!
            );
        } else if (category === "Drama Korea") {
            conditions.push(
                or(
                    ilike(contents.region, "%korea%"),
                    ilike(contents.region, "%korea selatan%")
                )!
            );
        } else if (category === "Anime") {
            conditions.push(
                or(
                    eq(contents.provider, "dramaqueen"),
                    sql`${contents.tags}::text ILIKE '%donghua%'`
                )!
            );
        }

        // Query database
        const items = await db.select({
            id: contents.providerContentId,
            title: contents.title,
            image: contents.posterUrl,
            episodes: contents.episodeCount,
            provider: contents.provider,
            createdAt: contents.createdAt,
        })
            .from(contents)
            .where(and(...conditions))
            .orderBy(desc(contents.createdAt))
            .limit(limit + 1); // Fetch one extra to check hasMore

        // Determine if there are more items
        const hasMore = items.length > limit;
        const resultItems = hasMore ? items.slice(0, limit) : items;

        // Get next cursor from last item
        const lastItem = resultItems[resultItems.length - 1];
        const nextCursor = lastItem?.createdAt?.toISOString() || null;

        // Normalize response
        const data: NormalizedItem[] = resultItems.map(item => ({
            id: item.id,
            title: item.title,
            image: item.image || "",
            episodes: item.episodes ? `${item.episodes} Eps` : undefined,
            provider: item.provider,
            createdAt: item.createdAt?.toISOString(),
        }));

        // Fallback to API if database is empty
        if (data.length === 0 && !cursor) {
            console.log("[all-dramas] Database empty, falling back to API");
            const fallbackData = await fetchFallbackFromAPI(category);
            return NextResponse.json({
                success: true,
                data: fallbackData,
                nextCursor: null,
                hasMore: false,
                source: "api_fallback"
            });
        }

        return NextResponse.json({
            success: true,
            data,
            nextCursor: hasMore ? nextCursor : null,
            hasMore,
            source: "database"
        });

    } catch (error) {
        console.error("[all-dramas] Error:", error);
        return NextResponse.json({
            success: false,
            data: [],
            nextCursor: null,
            hasMore: false,
            error: "Database query failed"
        }, { status: 500 });
    }
}

// Fallback function when database is empty
async function fetchFallbackFromAPI(category?: string | null): Promise<NormalizedItem[]> {
    try {
        if (category === "Short Drama" || !category || category === "Semua") {
            const data = await DramaBoxApi.getTrending();
            return data.slice(0, 24).map(d => ({
                id: d.bookId,
                title: d.bookName,
                image: d.coverWap || d.cover || "",
                episodes: d.chapterCount ? `${d.chapterCount} Eps` : undefined,
                provider: "dramabox"
            }));
        }
        return [];
    } catch {
        return [];
    }
}
