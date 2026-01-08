/**
 * Language Ingestion Service
 * 
 * Handles upserting language data for content.
 * Supports idempotent operations and provider-specific defaults.
 */

import { db, contentLanguages, contents, type ContentProvider } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { normalizeLanguage } from "@/lib/utils/language-utils";

/**
 * Default language configuration per provider
 * Based on realistic primary content language
 */
export const DEFAULT_PROVIDER_LANG: Record<ContentProvider, { code: string; type: "subtitle" | "dubbing" }> = {
    dramabox: { code: "id", type: "subtitle" },
    flickreels: { code: "id", type: "subtitle" },
    melolo: { code: "id", type: "subtitle" },
    dramaqueen: { code: "zh", type: "subtitle" }, // CN original content
    netshort: { code: "id", type: "subtitle" },
};

export type LanguageInput = {
    languageCode: string;
    providerLanguageId?: string;
    isDefault?: boolean;
    type?: "subtitle" | "dubbing";
    source?: "default" | "playback" | "admin" | "api";
};

/**
 * Upsert language for a content - idempotent operation
 * Uses onConflictDoNothing to prevent duplicates and preserve existing data
 */
export async function upsertContentLanguage(
    contentId: string,
    provider: ContentProvider,
    input: LanguageInput
) {
    const normalizedCode = normalizeLanguage(input.languageCode);
    const type = input.type || "subtitle";
    const source = input.source || "default";

    try {
        await db
            .insert(contentLanguages)
            .values({
                contentId,
                provider,
                languageCode: normalizedCode !== "unknown" ? normalizedCode : input.languageCode,
                providerLanguageId: input.providerLanguageId,
                isDefault: input.isDefault ?? false,
                type,
                source,
            })
            .onConflictDoNothing({
                target: [
                    contentLanguages.contentId,
                    contentLanguages.provider,
                    contentLanguages.languageCode,
                    contentLanguages.type
                ],
            });

        return { success: true };
    } catch (error) {
        console.error("[Language Ingestion] Error:", error);
        return { success: false, error: String(error) };
    }
}

/**
 * Set default language for a content after sync
 * Only inserts if no language exists for this content
 */
export async function setDefaultLanguageForContent(
    contentId: string,
    provider: ContentProvider
) {
    // Check if content already has language data
    const existing = await db
        .select({ id: contentLanguages.id })
        .from(contentLanguages)
        .where(eq(contentLanguages.contentId, contentId))
        .limit(1);

    if (existing.length > 0) {
        // Already has language data, skip
        return { skipped: true };
    }

    // Get default for this provider
    const defaultLang = DEFAULT_PROVIDER_LANG[provider] || { code: "id", type: "subtitle" as const };

    return upsertContentLanguage(contentId, provider, {
        languageCode: defaultLang.code,
        type: defaultLang.type,
        isDefault: true,
        source: "default",
    });
}

/**
 * Batch set default languages for multiple contents
 */
export async function batchSetDefaultLanguages(
    contentIds: string[],
    provider: ContentProvider
) {
    let processed = 0;
    let skipped = 0;

    for (const contentId of contentIds) {
        const result = await setDefaultLanguageForContent(contentId, provider);
        if (result && 'skipped' in result && result.skipped) {
            skipped++;
        } else {
            processed++;
        }
    }

    return { processed, skipped };
}

/**
 * Get languages for a content
 */
export async function getContentLanguages(contentId: string) {
    return db
        .select()
        .from(contentLanguages)
        .where(eq(contentLanguages.contentId, contentId));
}
