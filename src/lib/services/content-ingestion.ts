/**
 * Content Ingestion Service
 * 
 * Responsible for syncing content from external APIs into local database.
 * Delegates storage logic to content-repository.
 */

import { db, syncLogs, type ContentProvider, type FetchedFrom } from "@/lib/db";
import { upsertContent } from "./content-repository";
import { normalizeDramaBox, normalizeNetShort, normalizeFlickReels, normalizeMelolo, normalizeDramaQueen, normalizeDonghua } from "./provider-normalizers";
import { setDefaultLanguageForContent, upsertContentLanguage } from "./language-ingestion";
import { titleMatchesLanguage } from "@/lib/utils/title-language-detector";

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
    contentType?: string;
    releaseDate?: Date | null;
    releaseYear?: number | null;
    releaseStatus?: string;
    releaseSource?: string;  // api_detail, inferred, ingestion, unknown
    // Raw API fields for release info extraction
    tahun_rilis?: string;  // DramaQueen: full date "2025-12-22"
    release_date?: string; // Other providers: various formats
    is_finish?: boolean;   // DramaQueen: completed status
    is_coming?: boolean;   // DramaQueen: upcoming status
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
                    case "flickreels":
                        normalized = normalizeFlickReels(baseData, fetchedFrom);
                        break;
                    case "netshort":
                        normalized = normalizeNetShort(baseData, fetchedFrom);
                        break;
                    case "melolo":
                        normalized = normalizeMelolo(baseData, fetchedFrom);
                        break;
                    case "dramaqueen":
                        normalized = normalizeDramaQueen(baseData, fetchedFrom);
                        break;
                    case "donghua":
                        normalized = normalizeDonghua(baseData, fetchedFrom);
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

                // Set default language for newly synced content (idempotent)
                if (result && result.length > 0) {
                    await setDefaultLanguageForContent(result[0].id, provider);
                }

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

    /**
     * Sync content with explicit language association
     * Used when fetching from APIs that support language parameter (e.g. DramaBox ?lang=id)
     * 
     * @param provider - Content provider
     * @param items - Items to sync
     * @param languageCode - ISO 639-1 language code (e.g. "id", "en")
     * @param fetchedFrom - Source type (trending, home, foryou)
     */
    async syncContentWithLanguage(
        provider: ContentProvider,
        items: ScraperItem[],
        languageCode: string,
        fetchedFrom: FetchedFrom = "home"
    ): Promise<IngestionResult> {
        const startTime = Date.now();
        let updated = 0;

        for (const item of items) {
            try {
                // Normalize based on provider
                let normalized;
                const baseData = { ...item };

                switch (provider) {
                    case "dramabox":
                        normalized = normalizeDramaBox(baseData, fetchedFrom);
                        break;
                    case "flickreels":
                        normalized = normalizeFlickReels(baseData, fetchedFrom);
                        break;
                    case "melolo":
                        normalized = normalizeMelolo(baseData, fetchedFrom);
                        break;
                    default:
                        normalized = normalizeDramaBox(baseData, fetchedFrom);
                }

                normalized.status = "active";
                normalized.popularityScore = 20;

                // Upsert content
                const result = await upsertContent(normalized);

                // Explicitly set language for this content
                // BUT only if the title actually matches the target language
                // This prevents adding "id" association to dramas with English titles
                if (result && result.length > 0) {
                    const title = normalized.title || item.bookName || item.title || "";

                    // For Indonesian, check if title is actually Indonesian
                    // For other languages, always add (API is source of truth)
                    const shouldAddLanguage = languageCode === "id"
                        ? titleMatchesLanguage(title, "id")
                        : true;

                    if (shouldAddLanguage) {
                        await upsertContentLanguage(result[0].id, provider, {
                            languageCode,
                            type: "subtitle",
                            source: "api",
                            isDefault: languageCode === "id",
                        });
                    } else {
                        console.log(`[Ingestion] Skipped lang=${languageCode} for "${title}" (title doesn't match)`);
                    }
                }

                updated++;
            } catch (error) {
                console.error(`[Ingestion] Failed to process ${item.bookId} with lang ${languageCode}:`, error);
            }
        }

        const durationMs = Date.now() - startTime;
        console.log(`[Ingestion] Synced ${updated} items with language=${languageCode} in ${durationMs}ms`);

        return { processed: items.length, created: 0, updated };
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
