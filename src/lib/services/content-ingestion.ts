/**
 * Content Ingestion Service
 * 
 * Responsible for syncing content from external APIs into local database.
 * Implements merge strategy to preserve data quality during upserts.
 */

import { db, contents, syncLogs, type NewContent, type Content, type ContentProvider, type FetchedFrom } from "@/lib/db";
import { eq, and } from "drizzle-orm";

// ============================================
// MERGE STRATEGY CONFIGURATION
// ============================================

/**
 * Merge rules for upsert operations
 * Controls how incoming data is merged with existing data
 */
const MERGE_RULES = {
    title: "prefer_longer" as const,
    description: "prefer_non_empty" as const,
    posterUrl: "prefer_non_empty" as const,
    bannerUrl: "prefer_non_empty" as const,
    episodeCount: "prefer_higher" as const,
    tags: "merge_unique" as const,
    rating: "prefer_non_empty" as const,
};

// ============================================
// TTL CONFIGURATION
// ============================================

export const TTL_CONFIG: Record<FetchedFrom, number | null> = {
    trending: 6 * 60 * 60 * 1000,   // 6 hours
    home: 12 * 60 * 60 * 1000,      // 12 hours
    foryou: 12 * 60 * 60 * 1000,    // 12 hours
    search: null,                    // no expiry
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse JSON array from text field
 */
function parseJsonArray(value: string | null): string[] {
    if (!value) return [];
    try {
        return JSON.parse(value);
    } catch {
        return [];
    }
}

/**
 * Merge two arrays, keeping unique values
 */
function mergeUniqueTags(existing: string | null, incoming: string[] | undefined): string {
    const existingTags = parseJsonArray(existing);
    const incomingTags = incoming || [];
    const merged = [...new Set([...existingTags, ...incomingTags])];
    return JSON.stringify(merged);
}

/**
 * Apply merge strategy when upserting content
 */
function mergeContent(existing: Content, incoming: Partial<NewContent>): Partial<NewContent> {
    return {
        // Always update timestamps
        lastSeenAt: new Date(),
        updatedAt: new Date(),

        // Apply merge rules
        title: (incoming.title?.length || 0) > (existing.title?.length || 0)
            ? incoming.title
            : existing.title,

        description: incoming.description || existing.description,
        posterUrl: incoming.posterUrl || existing.posterUrl,
        bannerUrl: incoming.bannerUrl || existing.bannerUrl,

        episodeCount: Math.max(
            existing.episodeCount || 0,
            incoming.episodeCount || 0
        ),

        tags: mergeUniqueTags(existing.tags, parseJsonArray(incoming.tags || null)),

        rating: incoming.rating || existing.rating,

        // Keep other fields as is, updating only if truly new
        year: incoming.year || existing.year,
        region: incoming.region || existing.region,
        isVip: incoming.isVip ?? existing.isVip,
    };
}

// ============================================
// CONTENT INGESTION SERVICE
// ============================================

export interface IngestionResult {
    processed: number;
    created: number;
    updated: number;
}

export interface ContentInput {
    providerContentId: string;
    title: string;
    description?: string | null;
    posterUrl?: string | null;
    bannerUrl?: string | null;
    year?: number | null;
    region?: string | null;
    tags?: string[] | null;
    rating?: number | null;
    episodeCount?: number | null;
    isVip?: boolean;
    isSeries?: boolean;
}

export const ContentIngestionService = {
    /**
     * Sync trending content from a provider
     * Sets status='active' and fetchedFrom='trending'
     */
    async syncTrending(
        provider: ContentProvider,
        items: ContentInput[]
    ): Promise<IngestionResult> {
        return this.ingestContent(provider, items, "trending", "active");
    },

    /**
     * Sync home/foryou content from a provider
     * Sets status='active' and fetchedFrom='home' or 'foryou'
     */
    async syncHome(
        provider: ContentProvider,
        items: ContentInput[],
        source: "home" | "foryou" = "home"
    ): Promise<IngestionResult> {
        return this.ingestContent(provider, items, source, "active");
    },

    /**
     * Ingest content from search results
     * Sets status='hidden' to prevent appearing in homepage
     */
    async ingestFromSearch(
        provider: ContentProvider,
        items: ContentInput[]
    ): Promise<IngestionResult> {
        return this.ingestContent(provider, items, "search", "hidden");
    },

    /**
     * Core ingestion function with merge strategy
     */
    async ingestContent(
        provider: ContentProvider,
        items: ContentInput[],
        fetchedFrom: FetchedFrom,
        status: "active" | "hidden"
    ): Promise<IngestionResult> {
        const startTime = Date.now();
        let created = 0;
        let updated = 0;

        for (const item of items) {
            try {
                // Check if content already exists
                const existing = await db
                    .select()
                    .from(contents)
                    .where(
                        and(
                            eq(contents.provider, provider),
                            eq(contents.providerContentId, item.providerContentId)
                        )
                    )
                    .limit(1);

                if (existing.length > 0) {
                    // Update with merge strategy
                    const merged = mergeContent(existing[0], {
                        title: item.title,
                        description: item.description,
                        posterUrl: item.posterUrl,
                        bannerUrl: item.bannerUrl,
                        year: item.year,
                        region: item.region,
                        tags: item.tags ? JSON.stringify(item.tags) : null,
                        rating: item.rating,
                        episodeCount: item.episodeCount,
                        isVip: item.isVip,
                    });

                    await db
                        .update(contents)
                        .set(merged)
                        .where(eq(contents.id, existing[0].id));
                    updated++;
                } else {
                    // Insert new content
                    await db.insert(contents).values({
                        provider,
                        providerContentId: item.providerContentId,
                        title: item.title,
                        description: item.description,
                        posterUrl: item.posterUrl,
                        bannerUrl: item.bannerUrl,
                        year: item.year,
                        region: item.region,
                        tags: item.tags ? JSON.stringify(item.tags) : null,
                        rating: item.rating,
                        episodeCount: item.episodeCount,
                        isSeries: item.isSeries ?? true,
                        isVip: item.isVip ?? false,
                        fetchedFrom,
                        status,
                        popularityScore: status === "active" ? 10 : 0,
                    });
                    created++;
                }
            } catch (error) {
                console.error(`[Ingestion] Failed to process ${item.providerContentId}:`, error);
            }
        }

        // Log sync result
        const durationMs = Date.now() - startTime;
        await this.logSync(provider, fetchedFrom, items.length, created, updated, durationMs);

        return { processed: items.length, created, updated };
    },

    /**
     * Update lastSeenAt timestamp for content that appears again in API results
     */
    async updateLastSeen(provider: ContentProvider, providerContentId: string): Promise<void> {
        await db
            .update(contents)
            .set({ lastSeenAt: new Date() })
            .where(
                and(
                    eq(contents.provider, provider),
                    eq(contents.providerContentId, providerContentId)
                )
            );
    },

    /**
     * Log sync operation
     */
    async logSync(
        provider: ContentProvider,
        syncType: FetchedFrom,
        itemsProcessed: number,
        itemsCreated: number,
        itemsUpdated: number,
        durationMs: number,
        error?: string
    ): Promise<void> {
        await db.insert(syncLogs).values({
            provider,
            syncType,
            itemsProcessed,
            itemsCreated,
            itemsUpdated,
            durationMs,
            status: error ? "failed" : "success",
            error,
        });
    },

    /**
     * Check if content is stale based on TTL
     */
    isStale(content: Content): boolean {
        const ttl = TTL_CONFIG[content.fetchedFrom as FetchedFrom];
        if (!ttl) return false;
        return Date.now() - new Date(content.fetchedAt!).getTime() > ttl;
    },
};
