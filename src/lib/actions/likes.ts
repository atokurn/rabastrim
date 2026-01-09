"use server";

import { db, likes } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentUser } from "./user";

/**
 * Add like to an episode
 */
export async function addLike(data: {
    dramaId: string;
    dramaTitle: string;
    dramaCover: string;
    provider: string;
    episodeNumber: number;
}) {
    const user = await getCurrentUser();

    // Check if already exists
    const existing = await db
        .select()
        .from(likes)
        .where(
            and(
                eq(likes.userId, user.id),
                eq(likes.dramaId, data.dramaId),
                eq(likes.episodeNumber, data.episodeNumber)
            )
        )
        .limit(1);

    if (existing.length > 0) {
        return { success: true, message: "Already liked" };
    }

    await db.insert(likes).values({
        userId: user.id,
        dramaId: data.dramaId,
        dramaTitle: data.dramaTitle,
        dramaCover: data.dramaCover,
        provider: data.provider,
        episodeNumber: data.episodeNumber,
    });

    return { success: true, message: "Liked" };
}

/**
 * Remove like from an episode
 */
export async function removeLike(dramaId: string, episodeNumber: number) {
    const user = await getCurrentUser();

    await db
        .delete(likes)
        .where(
            and(
                eq(likes.userId, user.id),
                eq(likes.dramaId, dramaId),
                eq(likes.episodeNumber, episodeNumber)
            )
        );

    return { success: true };
}

/**
 * Get user's likes
 */
export async function getLikes(limit: number = 50) {
    const user = await getCurrentUser();

    const userLikes = await db
        .select()
        .from(likes)
        .where(eq(likes.userId, user.id))
        .orderBy(desc(likes.createdAt))
        .limit(limit);

    return userLikes;
}

/**
 * Check if episode is liked
 */
export async function isLiked(dramaId: string, episodeNumber: number): Promise<boolean> {
    const user = await getCurrentUser();

    const existing = await db
        .select()
        .from(likes)
        .where(
            and(
                eq(likes.userId, user.id),
                eq(likes.dramaId, dramaId),
                eq(likes.episodeNumber, episodeNumber)
            )
        )
        .limit(1);

    return existing.length > 0;
}

/**
 * Toggle like status for an episode
 */
export async function toggleLike(data: {
    dramaId: string;
    dramaTitle: string;
    dramaCover: string;
    provider: string;
    episodeNumber: number;
}) {
    const liked = await isLiked(data.dramaId, data.episodeNumber);

    if (liked) {
        await removeLike(data.dramaId, data.episodeNumber);
        return { isLiked: false };
    } else {
        await addLike(data);
        return { isLiked: true };
    }
}
