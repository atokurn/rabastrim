/**
 * Progress Service - Business logic for watch progress
 */

import { DramaBoxApi } from "@/lib/api/dramabox";
import { SansekaiApi } from "@/lib/api/sansekai";

const COMPLETION_THRESHOLD = 0.9; // 90%

/**
 * Check if position meets completion threshold
 */
export function shouldMarkComplete(position: number, duration: number): boolean {
    if (duration <= 0) return false;
    return position >= duration * COMPLETION_THRESHOLD;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(position: number, duration: number): number {
    if (duration <= 0) return 0;
    return Math.min(100, Math.round((position / duration) * 100));
}

/**
 * Get next episode for a drama
 */
export async function getNextEpisode(
    dramaId: string,
    currentEpisodeNumber: number,
    provider: string
): Promise<{ episodeId: string; episodeNumber: number } | null> {
    try {
        let episodes: { id?: string; episodeId?: string; episodeNumber?: number; number?: number }[] = [];

        if (provider === "dramabox") {
            episodes = await DramaBoxApi.getEpisodes(dramaId);
        } else if (provider === "netshort") {
            episodes = await SansekaiApi.netshort.getAllEpisodes(dramaId);
        }

        if (!episodes || episodes.length === 0) return null;

        // Find next episode
        const nextEp = episodes.find(
            (ep) => (ep.episodeNumber || ep.number || 0) === currentEpisodeNumber + 1
        );

        if (nextEp) {
            return {
                episodeId: nextEp.id || nextEp.episodeId || "",
                episodeNumber: nextEp.episodeNumber || nextEp.number || currentEpisodeNumber + 1,
            };
        }

        return null;
    } catch (error) {
        console.error("Error getting next episode:", error);
        return null;
    }
}

/**
 * Format watch time display
 */
export function formatWatchTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
