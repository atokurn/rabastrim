"use server";

import { db, favorites } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentUser } from "./user";

/**
 * Add drama to favorites
 */
export async function addToFavorites(data: {
    dramaId: string;
    dramaTitle: string;
    dramaCover: string;
    provider: string;
    description?: string;
}) {
    const user = await getCurrentUser();

    // Check if already exists
    const existing = await db
        .select()
        .from(favorites)
        .where(
            and(
                eq(favorites.userId, user.id),
                eq(favorites.dramaId, data.dramaId)
            )
        )
        .limit(1);

    if (existing.length > 0) {
        return { success: true, message: "Already in favorites" };
    }

    await db.insert(favorites).values({
        userId: user.id,
        dramaId: data.dramaId,
        dramaTitle: data.dramaTitle,
        dramaCover: data.dramaCover,
        provider: data.provider,
        description: data.description,
    });

    return { success: true, message: "Added to favorites" };
}

/**
 * Remove drama from favorites
 */
export async function removeFromFavorites(dramaId: string) {
    const user = await getCurrentUser();

    await db
        .delete(favorites)
        .where(
            and(
                eq(favorites.userId, user.id),
                eq(favorites.dramaId, dramaId)
            )
        );

    return { success: true };
}

/**
 * Get user's favorites
 */
export async function getFavorites(limit: number = 50) {
    const user = await getCurrentUser();

    const favs = await db
        .select()
        .from(favorites)
        .where(eq(favorites.userId, user.id))
        .orderBy(desc(favorites.createdAt))
        .limit(limit);

    return favs;
}

/**
 * Check if drama is in favorites
 */
export async function isFavorite(dramaId: string): Promise<boolean> {
    const user = await getCurrentUser();

    const existing = await db
        .select()
        .from(favorites)
        .where(
            and(
                eq(favorites.userId, user.id),
                eq(favorites.dramaId, dramaId)
            )
        )
        .limit(1);

    return existing.length > 0;
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(data: {
    dramaId: string;
    dramaTitle: string;
    dramaCover: string;
    provider: string;
}) {
    const isFav = await isFavorite(data.dramaId);

    if (isFav) {
        await removeFromFavorites(data.dramaId);
        return { isFavorite: false };
    } else {
        await addToFavorites(data);
        return { isFavorite: true };
    }
}
