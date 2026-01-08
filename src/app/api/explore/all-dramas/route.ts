import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contents } from "@/lib/db/schema";
import { desc, lt, eq, and, or, sql } from "drizzle-orm";

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
    releaseDate?: string;
    releaseStatus?: string;
    createdAt?: string;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Composite cursor format: releaseDate|createdAt|uuid
    const cursor = searchParams.get("cursor");
    const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 40); // Max 40
    const provider = searchParams.get("provider") || "all";
    const category = searchParams.get("category"); // Optional category filter

    try {
        // Build WHERE conditions
        const conditions = [eq(contents.status, "active")];

        // Composite cursor: sortValue|uuid (where sortValue is COALESCE(releaseDate, createdAt) as ISO timestamp)
        if (cursor) {
            const [cursorSortValue, cursorId] = cursor.split("|");

            // Build proper comparison matching ORDER BY: COALESCE(releaseDate, createdAt) DESC, id DESC
            // IMPORTANT: Must match ORDER BY exactly for consistent pagination
            if (cursorSortValue && cursorId) {
                // Use ISO string directly to avoid Date object serialization issues
                conditions.push(
                    or(
                        // Match ORDER BY exactly: COALESCE(releaseDate, createdAt)
                        sql`COALESCE(${contents.releaseDate}, ${contents.createdAt}) < ${cursorSortValue}::timestamp`,
                        and(
                            sql`COALESCE(${contents.releaseDate}, ${contents.createdAt}) = ${cursorSortValue}::timestamp`,
                            sql`${contents.id}::text < ${cursorId}`
                        )
                    )!
                );
            }
        }


        // Provider filter
        if (provider && provider !== "all") {
            conditions.push(eq(contents.provider, provider));
        }

        // Category-based filtering
        if (category === "Short Drama") {
            // Only short drama providers or contentType
            conditions.push(
                or(
                    eq(contents.contentType, "short_drama"),
                    eq(contents.provider, "dramabox"),
                    eq(contents.provider, "flickreels"),
                    eq(contents.provider, "melolo")
                )!
            );
        } else if (category === "Drama China") {
            // Chinese dramas from DramaQueen only (exclude donghua/anime)
            conditions.push(eq(contents.provider, "dramaqueen"));
            conditions.push(eq(contents.region, "CN"));
            // Exclude donghua by checking tags and poster URL
            conditions.push(sql`NOT (${contents.posterUrl}::text ILIKE '%donghua%')`);
        } else if (category === "Drama Korea") {
            // Korean dramas from DramaQueen only
            conditions.push(eq(contents.provider, "dramaqueen"));
            conditions.push(eq(contents.region, "KR"));
        } else if (category === "Drama Jepang") {
            // Japanese dramas from DramaQueen only
            conditions.push(eq(contents.provider, "dramaqueen"));
            conditions.push(eq(contents.region, "JP"));
        } else if (category === "Drama Thailand") {
            // Thai dramas from DramaQueen only
            conditions.push(eq(contents.provider, "dramaqueen"));
            conditions.push(eq(contents.region, "TH"));
        } else if (category === "Anime") {
            // Anime/Donghua - now stored with provider='donghua'
            conditions.push(eq(contents.provider, "donghua"));
        }

        // Query database - composite sort with id tiebreaker
        const items = await db.select({
            uuid: contents.id,  // Primary key for cursor tiebreaker
            id: contents.providerContentId,
            title: contents.title,
            image: contents.posterUrl,
            episodes: contents.episodeCount,
            provider: contents.provider,
            releaseDate: contents.releaseDate,
            releaseStatus: contents.releaseStatus,
            createdAt: contents.createdAt,
        })
            .from(contents)
            .where(and(...conditions))
            .orderBy(
                desc(sql`COALESCE(${contents.releaseDate}, ${contents.createdAt})`),
                desc(contents.id)  // Tiebreaker for stable pagination
            )
            .limit(limit + 1); // Fetch one extra to check hasMore

        // Determine if there are more items
        const hasMore = items.length > limit;
        const resultItems = hasMore ? items.slice(0, limit) : items;

        // Build composite next cursor: sortValue|uuid (sortValue = releaseDate as date or createdAt as full timestamp)
        const lastItem = resultItems[resultItems.length - 1];
        const nextCursor = lastItem
            ? `${lastItem.releaseDate || lastItem.createdAt?.toISOString() || ''}|${lastItem.uuid}`
            : null;

        // Normalize response with release info
        const data: NormalizedItem[] = resultItems.map(item => ({
            id: item.id,
            title: item.title,
            image: item.image || "",
            episodes: item.episodes ? `${item.episodes} Eps` : undefined,
            provider: item.provider,
            releaseDate: item.releaseDate || undefined,
            releaseStatus: item.releaseStatus || undefined,
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
