/**
 * Auto-Sync Utility
 * 
 * Provides functions to automatically sync content from explore sections
 * when content for a specific provider+language doesn't exist in database.
 */

import { ScraperItem } from "@/lib/services/content-ingestion";

// Track which provider+language combinations have been synced this session
const syncedCombinations = new Set<string>();

/**
 * Check if we've already attempted sync for this provider+language this session
 */
export function hasSyncedThisSession(provider: string, language: string): boolean {
    return syncedCombinations.has(`${provider}-${language}`);
}

/**
 * Mark a provider+language combination as synced for this session
 */
export function markAsSynced(provider: string, language: string): void {
    syncedCombinations.add(`${provider}-${language}`);
}

/**
 * Convert raw FlickReels API data to ScraperItem format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertFlickReelsItem(item: any): ScraperItem {
    return {
        bookId: String(item.playlet_id || item.id || ""),
        bookName: item.playlet_title || item.title || "",
        cover: item.cover || item.process_cover || "",
        totalEpisodes: item.chapter_num || item.upload_num || 0,
        introduction: item.introduce || "",
        tags: item.tag_list?.map((t: { tag_name: string }) => t.tag_name) || [],
    };
}

/**
 * Convert raw DramaBox API data to ScraperItem format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertDramaBoxItem(item: any): ScraperItem {
    return {
        bookId: String(item.bookId || item.id || item.book_id || ""),
        bookName: item.bookName || item.title || item.book_name || "",
        cover: item.coverWap || item.cover || item.thumb_url || item.poster || "",
        totalEpisodes: item.chapterCount || item.totalEpisodes || item.episodeCount || 0,
        introduction: item.introduction || item.description || "",
        tags: item.tags || item.tagNames || [],
    };
}

/**
 * Convert raw Melolo API data to ScraperItem format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertMeloloItem(item: any): ScraperItem {
    return {
        bookId: String(item.id || item.bookId || ""),
        bookName: item.name || item.title || item.bookName || "",
        cover: item.poster || item.cover || "",
        totalEpisodes: item.total_episode || item.totalEpisodes || 0,
        introduction: item.description || item.introduction || "",
        tags: item.genres || item.tags || [],
    };
}

/**
 * Convert raw API items to ScraperItem format based on provider
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertToScraperItems(provider: string, items: any[]): ScraperItem[] {
    switch (provider) {
        case "flickreels":
            return items.map(convertFlickReelsItem);
        case "dramabox":
            return items.map(convertDramaBoxItem);
        case "melolo":
            return items.map(convertMeloloItem);
        default:
            return items.map(convertDramaBoxItem); // Default to DramaBox format
    }
}

/**
 * Trigger background sync for explore section data
 * Only syncs if not already synced this session
 * 
 * @param provider Provider name (dramabox, flickreels, melolo)
 * @param language Language code (ko, th, etc.)
 * @param items Raw items from API (before normalization)
 */
export async function triggerBackgroundSync(
    provider: string,
    language: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: any[]
): Promise<void> {
    // Skip if already synced this session
    if (hasSyncedThisSession(provider, language)) {
        console.log(`[Auto-Sync] Skipped ${provider}/${language} - already synced this session`);
        return;
    }

    // Skip if no items to sync
    if (!items || items.length === 0) {
        return;
    }

    // Mark as synced immediately to prevent duplicate requests
    markAsSynced(provider, language);

    // Convert raw API items to ScraperItem format
    const scraperItems = convertToScraperItems(provider, items);

    try {
        // Fire and forget - don't wait for response
        fetch("/api/sync/background", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                provider,
                language,
                items: scraperItems,
            }),
        }).then(res => {
            if (!res.ok) {
                console.error(`[Auto-Sync] Failed for ${provider}/${language}:`, res.status);
            } else {
                console.log(`[Auto-Sync] Started for ${provider}/${language} with ${scraperItems.length} items`);
            }
        }).catch(err => {
            console.error(`[Auto-Sync] Error for ${provider}/${language}:`, err);
        });
    } catch (error) {
        console.error(`[Auto-Sync] Failed to trigger for ${provider}/${language}:`, error);
    }
}

/**
 * Check if provider supports multi-language sync
 */
export function isMultiLangProvider(provider: string): boolean {
    return ["dramabox", "flickreels", "melolo"].includes(provider);
}
