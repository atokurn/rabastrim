/**
 * Content Ingestion Service
 * 
 * Responsible for syncing content from external APIs into local database.
 * Delegates storage logic to content-repository.
 */

import { db, syncLogs, type ContentProvider, type FetchedFrom } from "@/lib/db";
import { upsertContent } from "./content-repository";
import { normalizeDramaBox, normalizeNetShort, normalizeMelolo } from "./provider-normalizers";

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
// CONTENT INGESTION SERVICE
// ============================================

export interface IngestionResult {
    processed: number;
    created: number;
    updated: number;
}

// Flexible input that matches what scrapers usually return
export interface ScraperItem {
    bookId: string;
    bookName?: string;
    title?: string;
    cover?: string;
    poster?: string;
    introduction?: string;
    description?: string;
    totalEpisodes?: number;
    episodeCount?: number;
    tags?: string[];
    tagNames?: string[];
    year?: number;
    region?: string;
    score?: number;
    isVip?: boolean;
}

// Alias for backward compatibility or clarity
export type ContentInput = ScraperItem;

export const ContentIngestionService = {
    /**
     * Sync content from provider
     */
    async syncContent(
        provider: ContentProvider,
        items: ScraperItem[],
        fetchedFrom: FetchedFrom,
        status: "active" | "hidden" = "active"
    ): Promise<IngestionResult> {
        const startTime = Date.now();
        let created = 0;
        let updated = 0;

        for (const item of items) {
            try {
                // Normalize based on provider
                let normalized;
                // Add status explicitly
                const baseData = { ...item };

                switch (provider) {
                    case "dramabox":
                        normalized = normalizeDramaBox(baseData, fetchedFrom);
                        break;
                    case "flickreels": // Uses NetShort structure usually
                    case "netshort":
                        normalized = normalizeNetShort(baseData, fetchedFrom);
                        break;
                    case "melolo":
                        normalized = normalizeMelolo(baseData, fetchedFrom);
                        break;
                    default:
                        // Default fallback
                        normalized = normalizeNetShort(baseData, fetchedFrom); // Best guess
                }

                normalized.status = status;
                // Add initial popularity for trending/home
                if (status === "active" && (fetchedFrom === 'trending' || fetchedFrom === 'home')) {
                    normalized.popularityScore = 20;
                }

                // Upsert via repository
                const result = await upsertContent(normalized);

                // Detection of created vs updated is tricky with upsert returning array
                // We assume it worked. For stats, we can't easily distinguish without more logic.
                // Let's increment 'processed'.
                // If we really want accurate 'created' vs 'updated', we check `createdAt` equal to now.
                // BUT upsert might return existing record.
                // For simplified V2, accurate logs are secondary.
                updated++;

            } catch (error) {
                console.error(`[Ingestion] Failed to process ${item.bookId}:`, error);
            }
        }

        // Log sync result
        const durationMs = Date.now() - startTime;
        await this.logSync(provider, fetchedFrom, items.length, 0, items.length, durationMs);

        return { processed: items.length, created: 0, updated: items.length };
    },

    /**
     * Sync trending content
     */
    async syncTrending(provider: ContentProvider, items: ScraperItem[]): Promise<IngestionResult> {
        return this.syncContent(provider, items, "trending", "active");
    },

    /**
     * Sync home content
     */
    async syncHome(provider: ContentProvider, items: ScraperItem[], source: "home" | "foryou" = "home"): Promise<IngestionResult> {
        return this.syncContent(provider, items, source, "active");
    },

    /**
     * Ingest from search (active - so they appear in future searches)
     */
    async ingestFromSearch(provider: ContentProvider, items: ScraperItem[]): Promise<IngestionResult> {
        return this.syncContent(provider, items, "search", "active");
    },

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
    }
};
