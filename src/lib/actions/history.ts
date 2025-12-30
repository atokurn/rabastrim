"use server";

import { db, users, watchHistory } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { cache, cacheKeys } from "@/lib/cache";
import { shouldMarkComplete } from "@/lib/services/progress";

const DEVICE_ID_COOKIE = "rabastrim_device_id";

/**
 * Get or create anonymous user based on device ID
 */
export async function getOrCreateUser() {
    const cookieStore = await cookies();
    let deviceId = cookieStore.get(DEVICE_ID_COOKIE)?.value;

    if (!deviceId) {
        deviceId = uuidv4();
        cookieStore.set(DEVICE_ID_COOKIE, deviceId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 365, // 1 year
            path: "/",
        });
    }

    // Find or create user
    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.deviceId, deviceId))
        .limit(1);

    if (existingUser.length > 0) {
        return existingUser[0];
    }

    // Create new user
    const newUser = await db
        .insert(users)
        .values({ deviceId })
        .returning();

    return newUser[0];
}

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
    const user = await getOrCreateUser();
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
    const user = await getOrCreateUser();

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
    const user = await getOrCreateUser();

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
    const user = await getOrCreateUser();

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
    const user = await getOrCreateUser();

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
