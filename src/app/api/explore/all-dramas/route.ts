import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contents, contentLanguages } from "@/lib/db/schema";
import { desc, lt, eq, and, or, sql, inArray } from "drizzle-orm";

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
    const lang = searchParams.get("lang"); // Optional language filter

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


        // Provider filter - ALWAYS applied if specified
        if (provider && provider !== "all") {
            conditions.push(eq(contents.provider, provider));
        }

        // Language filter - only for short drama providers (dramabox, flickreels, melolo)
        // DramaQueen is always shown regardless of language (scraped content, fixed lang)
        if (lang) {
            const isShortDramaProvider = ["dramabox", "flickreels", "melolo"].includes(provider);

            if (isShortDramaProvider) {
                // For specific provider: check if THIS provider has content with the language
                const providerContentWithLang = await db
                    .select({ contentId: contentLanguages.contentId })
                    .from(contentLanguages)
                    .innerJoin(contents, eq(contentLanguages.contentId, contents.id))
                    .where(
                        and(
                            eq(contentLanguages.languageCode, lang),
                            eq(contents.provider, provider)
                        )
                    );

                const providerContentIds = providerContentWithLang.map(c => c.contentId);

                // Debug logging
                console.log(`[all-dramas] Provider: ${provider}, Lang: ${lang}, Content count: ${providerContentIds.length}`);

                // STRICT: Only show content that matches the language
                // If no content exists for this language, return empty result immediately
                if (providerContentIds.length > 0) {
                    conditions.push(inArray(contents.id, providerContentIds));
                } else {
                    // No content for this language - return empty immediately
                    return NextResponse.json({
                        success: true,
                        data: [],
                        nextCursor: null,
                        hasMore: false,
                        source: "database",
                        message: `No ${provider} content available for language: ${lang}`
                    });
                }
            } else if (provider === "all") {
                // For "all" providers: get content with matching language from short drama providers
                const contentWithLanguage = await db
                    .select({ contentId: contentLanguages.contentId })
                    .from(contentLanguages)
                    .where(eq(contentLanguages.languageCode, lang));

                const contentIdsWithLang = contentWithLanguage.map(c => c.contentId);

                // Include content with matching language OR DramaQueen (always shown)
                if (contentIdsWithLang.length > 0) {
                    conditions.push(
                        or(
                            inArray(contents.id, contentIdsWithLang),
                            eq(contents.provider, "dramaqueen"),
                            eq(contents.provider, "donghua")
                        )!
                    );
                } else {
                    // No content with this language, only show DramaQueen/donghua
                    conditions.push(
                        or(
                            eq(contents.provider, "dramaqueen"),
                            eq(contents.provider, "donghua")
                        )!
                    );
                }
            }
            // DramaQueen/donghua provider: no language filter needed
        }

        // Category-based filtering (support both keys like 'short_drama' and display names like 'Short Drama')
        const categoryLower = category?.toLowerCase().replace(/\s+/g, '_');

        if (categoryLower === "short_drama") {
            // Short drama: ONLY dramabox, flickreels, melolo - explicitly EXCLUDE dramaqueen and donghua
            conditions.push(
                or(
                    eq(contents.provider, "dramabox"),
                    eq(contents.provider, "flickreels"),
                    eq(contents.provider, "melolo")
                )!
            );
        } else if (categoryLower === "drama_china") {
            // Chinese dramas from DramaQueen only (exclude donghua/anime)
            conditions.push(eq(contents.provider, "dramaqueen"));
            conditions.push(eq(contents.region, "CN"));
            conditions.push(sql`${contents.contentType} != 'anime'`);
        } else if (categoryLower === "drama_korea") {
            // Korean dramas from DramaQueen only
            conditions.push(eq(contents.provider, "dramaqueen"));
            conditions.push(eq(contents.region, "KR"));
        } else if (categoryLower === "drama_japan") {
            // Japanese dramas from DramaQueen only
            conditions.push(eq(contents.provider, "dramaqueen"));
            conditions.push(eq(contents.region, "JP"));
        } else if (categoryLower === "drama_thailand") {
            // Thai dramas from DramaQueen only
            conditions.push(eq(contents.provider, "dramaqueen"));
            conditions.push(eq(contents.region, "TH"));
        } else if (categoryLower === "anime") {
            // Anime/Donghua - filter by content_type or provider
            conditions.push(
                or(
                    eq(contents.contentType, "anime"),
                    eq(contents.provider, "donghua")
                )!
            );
        }
        // If category is 'all' or undefined, no additional filtering (show all)

        // Query database - composite sort with id tiebreaker
        const items = await db.select({
            uuid: contents.id,  // Primary key for cursor tiebreaker
            id: contents.providerContentId,
            title: contents.title,
            image: contents.posterUrl,
            episodes: contents.episodeCount,
            provider: contents.provider,
            contentType: contents.contentType, // Need this to determine correct provider for watch page
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
        // For anime/donghua content, use provider="donghua" so watch page calls correct endpoint
        const data: NormalizedItem[] = resultItems.map(item => ({
            id: item.id,
            title: item.title,
            image: item.image || "",
            episodes: item.episodes ? `${item.episodes} Eps` : undefined,
            // Use "donghua" provider for anime content so watch page calls getDonghuaDetail
            provider: item.contentType === "anime" ? "donghua" : item.provider,
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
