/**
 * Content Repository
 * 
 * Data access layer for querying content from local database.
 * Provides methods for homepage, explore, and search operations.
 */

import { db, contents, type Content, type ContentProvider, type ContentStatus } from "@/lib/db";
import { eq, and, ilike, desc, sql, or } from "drizzle-orm";

// ============================================
// TYPES
// ============================================

export interface ExploreFilters {
    provider?: ContentProvider;
    status?: ContentStatus;
    tags?: string[];
    year?: number;
    region?: string;
    limit?: number;
    offset?: number;
}

export interface SearchSuggestResult {
    id: string;
    title: string;
    posterUrl: string | null;
    provider: string;
    providerContentId: string;
}

export interface HomepageGroupedContent {
    provider: ContentProvider;
    items: Content[];
}

// ============================================
// CONTENT REPOSITORY
// ============================================

export const ContentRepository = {
    /**
     * Get content for homepage
     * Returns active content sorted by popularity score
     */
    async getForHomepage(limit = 20): Promise<Content[]> {
        return db
            .select()
            .from(contents)
            .where(eq(contents.status, "active"))
            .orderBy(desc(contents.popularityScore), desc(contents.updatedAt))
            .limit(limit);
    },

    /**
     * Get content grouped by provider for homepage sections
     */
    async getForHomepageGrouped(itemsPerProvider = 12): Promise<HomepageGroupedContent[]> {
        const providers: ContentProvider[] = ["dramabox", "flickreels", "melolo"];
        const result: HomepageGroupedContent[] = [];

        for (const provider of providers) {
            const items = await db
                .select()
                .from(contents)
                .where(
                    and(
                        eq(contents.provider, provider),
                        eq(contents.status, "active")
                    )
                )
                .orderBy(desc(contents.popularityScore), desc(contents.updatedAt))
                .limit(itemsPerProvider);

            if (items.length > 0) {
                result.push({ provider, items });
            }
        }

        return result;
    },

    /**
     * Get content for explore page with filters and pagination
     */
    async getForExplore(filters: ExploreFilters = {}): Promise<Content[]> {
        const {
            provider,
            status = "active",
            limit = 20,
            offset = 0,
        } = filters;

        const conditions = [eq(contents.status, status)];

        if (provider) {
            conditions.push(eq(contents.provider, provider));
        }

        return db
            .select()
            .from(contents)
            .where(and(...conditions))
            .orderBy(desc(contents.popularityScore), desc(contents.updatedAt))
            .limit(limit)
            .offset(offset);
    },

    /**
     * Search suggest - fast ILIKE query on title
     * Includes both active and hidden content
     */
    async searchSuggest(query: string, limit = 8): Promise<SearchSuggestResult[]> {
        const normalizedQuery = query.toLowerCase().trim();

        if (normalizedQuery.length < 2) {
            return [];
        }

        const results = await db
            .select({
                id: contents.id,
                title: contents.title,
                posterUrl: contents.posterUrl,
                provider: contents.provider,
                providerContentId: contents.providerContentId,
            })
            .from(contents)
            .where(
                or(
                    ilike(contents.title, `${normalizedQuery}%`),
                    ilike(contents.title, `%${normalizedQuery}%`)
                )
            )
            .orderBy(
                // Prioritize exact prefix matches
                sql`CASE WHEN LOWER(${contents.title}) LIKE ${normalizedQuery + '%'} THEN 0 ELSE 1 END`,
                desc(contents.popularityScore)
            )
            .limit(limit);

        return results;
    },

    /**
     * Full search with more comprehensive matching
     */
    async searchFull(query: string, limit = 20, offset = 0): Promise<Content[]> {
        const normalizedQuery = query.toLowerCase().trim();

        if (normalizedQuery.length < 2) {
            return [];
        }

        return db
            .select()
            .from(contents)
            .where(
                or(
                    ilike(contents.title, `%${normalizedQuery}%`),
                    ilike(contents.description, `%${normalizedQuery}%`)
                )
            )
            .orderBy(
                sql`CASE WHEN LOWER(${contents.title}) LIKE ${normalizedQuery + '%'} THEN 0 ELSE 1 END`,
                desc(contents.popularityScore)
            )
            .limit(limit)
            .offset(offset);
    },

    /**
     * Get content by provider and provider content ID
     */
    async getByProviderId(provider: ContentProvider, providerContentId: string): Promise<Content | null> {
        const result = await db
            .select()
            .from(contents)
            .where(
                and(
                    eq(contents.provider, provider),
                    eq(contents.providerContentId, providerContentId)
                )
            )
            .limit(1);

        return result[0] || null;
    },

    /**
     * Get content by internal ID
     */
    async getById(id: string): Promise<Content | null> {
        const result = await db
            .select()
            .from(contents)
            .where(eq(contents.id, id))
            .limit(1);

        return result[0] || null;
    },

    /**
     * Increment popularity score based on event
     */
    async incrementPopularity(
        provider: ContentProvider,
        providerContentId: string,
        event: "view" | "favorite" | "search" | "trending"
    ): Promise<void> {
        const scoreMap = {
            trending: 10,
            favorite: 5,
            view: 3,
            search: 1,
        };

        const increment = scoreMap[event];

        await db
            .update(contents)
            .set({
                popularityScore: sql`${contents.popularityScore} + ${increment}`,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(contents.provider, provider),
                    eq(contents.providerContentId, providerContentId)
                )
            );
    },

    /**
     * Promote content from hidden to active if score meets threshold
     */
    async promoteByScore(threshold = 10): Promise<number> {
        const result = await db
            .update(contents)
            .set({ status: "active", updatedAt: new Date() })
            .where(
                and(
                    eq(contents.status, "hidden"),
                    sql`${contents.popularityScore} >= ${threshold}`
                )
            );

        return result.rowCount || 0;
    },

    /**
     * Count total active content
     */
    async countActive(): Promise<number> {
        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(contents)
            .where(eq(contents.status, "active"));

        return Number(result[0]?.count) || 0;
    },

    /**
     * Count content by provider
     */
    async countByProvider(): Promise<Record<string, number>> {
        const result = await db
            .select({
                provider: contents.provider,
                count: sql<number>`count(*)`,
            })
            .from(contents)
            .groupBy(contents.provider);

        return Object.fromEntries(
            result.map(r => [r.provider, Number(r.count)])
        );
    },
};
