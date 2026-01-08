/**
 * Playback Language Sync Service
 * 
 * Syncs detected language data during video playback.
 * Updates content_languages table with source="playback".
 */

import { type ContentProvider } from "@/lib/db";
import { upsertContentLanguage } from "./language-ingestion";

/**
 * Sync language detected during playback
 * 
 * This is called when a video is played and language is detected from:
 * - URL patterns
 * - API field names used to get the video
 * 
 * Uses source="playback" to distinguish from default/admin sources.
 */
export async function syncLanguageFromPlayback(
    contentId: string,
    provider: ContentProvider,
    detectedLanguage: string,
    options?: {
        type?: "subtitle" | "dubbing";
        providerLanguageId?: string;
    }
) {
    if (!detectedLanguage || !contentId) {
        return { success: false, reason: "Missing required fields" };
    }

    return upsertContentLanguage(contentId, provider, {
        languageCode: detectedLanguage,
        type: options?.type || "subtitle",
        source: "playback",
        providerLanguageId: options?.providerLanguageId,
        isDefault: false, // Playback-detected is never default
    });
}

/**
 * Batch sync multiple languages detected during playback
 */
export async function batchSyncLanguagesFromPlayback(
    contentId: string,
    provider: ContentProvider,
    languages: Array<{
        code: string;
        type?: "subtitle" | "dubbing";
        providerLanguageId?: string;
    }>
) {
    const results = await Promise.all(
        languages.map(lang =>
            syncLanguageFromPlayback(contentId, provider, lang.code, {
                type: lang.type,
                providerLanguageId: lang.providerLanguageId,
            })
        )
    );

    return {
        total: languages.length,
        successful: results.filter(r => r.success).length,
    };
}
