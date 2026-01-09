"use server";

import { db, watchHistory } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { cache } from "@/lib/cache";
import { shouldMarkComplete } from "@/lib/services/progress";
import { getCurrentUser } from "./user";

/**
 * Update or create watch history entry
 */
export async function updateWatchHistory(data: {
    dramaId: string;
    dramaTitle: string;
    dramaCover: string;
    provider: string;
    episodeId?: string;
    episodeNumber?: number;
    lastPosition: number;
    duration: number;
}) {
    const user = await getCurrentUser();
    const progress = data.duration > 0
        ? Math.round((data.lastPosition / data.duration) * 100)
        : 0;
    const isCompleted = shouldMarkComplete(data.lastPosition, data.duration);

    // Check if entry exists
    const existing = await db
        .select()
        .from(watchHistory)
        .where(
            and(
                eq(watchHistory.userId, user.id),
                eq(watchHistory.dramaId, data.dramaId)
            )
        )
        .limit(1);

    if (existing.length > 0) {
        // Update existing
        await db
            .update(watchHistory)
            .set({
                episodeId: data.episodeId,
                episodeNumber: data.episodeNumber,
                lastPosition: data.lastPosition,
                duration: data.duration,
                provider: data.provider,
                progress,
                isCompleted,
                updatedAt: new Date(),
                watchedAt: new Date(),
            })
            .where(eq(watchHistory.id, existing[0].id));
    } else {
        // Create new
        await db.insert(watchHistory).values({
            userId: user.id,
            dramaId: data.dramaId,
            dramaTitle: data.dramaTitle,
            dramaCover: data.dramaCover,
            provider: data.provider,
            episodeId: data.episodeId,
            episodeNumber: data.episodeNumber,
            lastPosition: data.lastPosition,
            duration: data.duration,
            progress,
            isCompleted,
        });
    }

    // Invalidate user's cache
    await cache.invalidateUserCache(user.id);

    return { isCompleted, progress };
}

/**
 * Mark episode as completed
 */
export async function markEpisodeComplete(dramaId: string) {
    const user = await getCurrentUser();

    await db
        .update(watchHistory)
        .set({
            isCompleted: true,
            progress: 100,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(watchHistory.userId, user.id),
                eq(watchHistory.dramaId, dramaId)
            )
        );

    await cache.invalidateUserCache(user.id);
}

/**
 * Get user's watch history (continue watching)
 */
export async function getWatchHistory(limit: number = 10) {
    const user = await getCurrentUser();

    const history = await db
        .select()
        .from(watchHistory)
        .where(
            and(
                eq(watchHistory.userId, user.id),
                eq(watchHistory.isCompleted, false) // Only not completed
            )
        )
        .orderBy(desc(watchHistory.watchedAt))
        .limit(limit);

    return history;
}

/**
 * Get all watch history including completed
 */
export async function getAllWatchHistory(limit: number = 50) {
    const user = await getCurrentUser();

    const history = await db
        .select()
        .from(watchHistory)
        .where(eq(watchHistory.userId, user.id))
        .orderBy(desc(watchHistory.watchedAt))
        .limit(limit);

    return history;
}

/**
 * Get resume position for a specific drama
 */
export async function getResumePosition(dramaId: string) {
    const user = await getCurrentUser();

    const entry = await db
        .select()
        .from(watchHistory)
        .where(
            and(
                eq(watchHistory.userId, user.id),
                eq(watchHistory.dramaId, dramaId)
            )
        )
        .limit(1);

    if (entry.length > 0) {
        return {
            episodeId: entry[0].episodeId,
            episodeNumber: entry[0].episodeNumber,
            lastPosition: entry[0].lastPosition,
            progress: entry[0].progress,
            isCompleted: entry[0].isCompleted,
        };
    }

    return null;
}
