"use server";

import { db, users, watchHistory, favorites, likes, syncLogs } from "@/lib/db";
import { eq, and, or, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";

const DEVICE_ID_COOKIE = "rabastrim_device_id";

/**
 * Get current device ID from cookie (for guest identification)
 */
export async function getDeviceId(): Promise<string> {
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

    return deviceId;
}

/**
 * Get or create user based on current session
 * Prioritizes Clerk user, falls back to device ID for guests
 */
export async function getCurrentUser() {
    const { userId: clerkUserId } = await auth();
    const deviceId = await getDeviceId();

    // If logged in with Clerk, find/create user by clerkId
    if (clerkUserId) {
        const existingClerkUser = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkUserId))
            .limit(1);

        if (existingClerkUser.length > 0) {
            return existingClerkUser[0];
        }

        // Create new user with clerkId
        const newUser = await db
            .insert(users)
            .values({
                clerkId: clerkUserId,
                isGuest: false,
                deviceId: deviceId, // Also store deviceId for reference
            })
            .returning();

        return newUser[0];
    }

    // Guest user flow - use device ID
    const existingGuestUser = await db
        .select()
        .from(users)
        .where(eq(users.deviceId, deviceId))
        .limit(1);

    if (existingGuestUser.length > 0) {
        return existingGuestUser[0];
    }

    // Create new guest user
    const newGuestUser = await db
        .insert(users)
        .values({
            deviceId,
            isGuest: true,
        })
        .returning();

    return newGuestUser[0];
}

/**
 * Sync Clerk user with database
 * Called when user logs in with Clerk
 */
export async function syncClerkUser(data?: {
    email?: string;
    name?: string;
    avatar?: string;
}) {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
        return { success: false, error: "Not authenticated" };
    }

    const deviceId = await getDeviceId();

    // Check if user already exists with this clerkId
    const existingClerkUser = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId))
        .limit(1);

    if (existingClerkUser.length > 0) {
        // Update existing user
        const updated = await db
            .update(users)
            .set({
                email: data?.email,
                name: data?.name,
                avatar: data?.avatar,
                updatedAt: new Date(),
            })
            .where(eq(users.id, existingClerkUser[0].id))
            .returning();

        return { success: true, user: updated[0], isNew: false };
    }

    // Create new user linked to Clerk
    const newUser = await db
        .insert(users)
        .values({
            clerkId: clerkUserId,
            deviceId: deviceId,
            isGuest: false,
            email: data?.email,
            name: data?.name,
            avatar: data?.avatar,
        })
        .returning();

    return { success: true, user: newUser[0], isNew: true };
}

/**
 * Merge guest data to logged-in user
 * Called after login to transfer watch history, favorites, likes
 */
export async function mergeGuestData() {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
        return { success: false, error: "Not authenticated" };
    }

    const deviceId = await getDeviceId();

    // Find guest user by deviceId
    const guestUser = await db
        .select()
        .from(users)
        .where(and(
            eq(users.deviceId, deviceId),
            eq(users.isGuest, true)
        ))
        .limit(1);

    if (guestUser.length === 0) {
        return { success: true, message: "No guest data to merge", merged: { history: 0, favorites: 0, likes: 0 } };
    }

    // Find or create Clerk user
    let clerkUser = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId))
        .limit(1);

    if (clerkUser.length === 0) {
        const newClerkUser = await db
            .insert(users)
            .values({
                clerkId: clerkUserId,
                isGuest: false,
            })
            .returning();
        clerkUser = newClerkUser;
    }

    const guestUserId = guestUser[0].id;
    const clerkUserDbId = clerkUser[0].id;

    // Count items to merge
    let mergedHistory = 0;
    let mergedFavorites = 0;
    let mergedLikes = 0;

    // Merge watch history - update user_id, on conflict keep latest
    const guestHistory = await db
        .select()
        .from(watchHistory)
        .where(eq(watchHistory.userId, guestUserId));

    for (const entry of guestHistory) {
        // Check if already exists for Clerk user
        const existing = await db
            .select()
            .from(watchHistory)
            .where(and(
                eq(watchHistory.userId, clerkUserDbId),
                eq(watchHistory.dramaId, entry.dramaId)
            ))
            .limit(1);

        if (existing.length > 0) {
            // Keep the one with later updated_at
            if (entry.updatedAt && existing[0].updatedAt && entry.updatedAt > existing[0].updatedAt) {
                await db
                    .update(watchHistory)
                    .set({
                        episodeId: entry.episodeId,
                        episodeNumber: entry.episodeNumber,
                        lastPosition: entry.lastPosition,
                        duration: entry.duration,
                        progress: entry.progress,
                        isCompleted: entry.isCompleted,
                        updatedAt: entry.updatedAt,
                    })
                    .where(eq(watchHistory.id, existing[0].id));
                mergedHistory++;
            }
        } else {
            // Move to Clerk user
            await db
                .update(watchHistory)
                .set({ userId: clerkUserDbId })
                .where(eq(watchHistory.id, entry.id));
            mergedHistory++;
        }
    }

    // Merge favorites
    const guestFavorites = await db
        .select()
        .from(favorites)
        .where(eq(favorites.userId, guestUserId));

    for (const fav of guestFavorites) {
        const existing = await db
            .select()
            .from(favorites)
            .where(and(
                eq(favorites.userId, clerkUserDbId),
                eq(favorites.dramaId, fav.dramaId)
            ))
            .limit(1);

        if (existing.length === 0) {
            await db
                .update(favorites)
                .set({ userId: clerkUserDbId })
                .where(eq(favorites.id, fav.id));
            mergedFavorites++;
        }
    }

    // Merge likes
    const guestLikes = await db
        .select()
        .from(likes)
        .where(eq(likes.userId, guestUserId));

    for (const like of guestLikes) {
        const existing = await db
            .select()
            .from(likes)
            .where(and(
                eq(likes.userId, clerkUserDbId),
                eq(likes.dramaId, like.dramaId),
                eq(likes.episodeNumber, like.episodeNumber)
            ))
            .limit(1);

        if (existing.length === 0) {
            await db
                .update(likes)
                .set({ userId: clerkUserDbId })
                .where(eq(likes.id, like.id));
            mergedLikes++;
        }
    }

    // Log the merge
    await db.insert(syncLogs).values({
        provider: "user_system",
        syncType: "guest_merge",
        itemsProcessed: guestHistory.length + guestFavorites.length + guestLikes.length,
        itemsCreated: 0,
        itemsUpdated: mergedHistory + mergedFavorites + mergedLikes,
        status: "success",
        error: JSON.stringify({
            oldUser: guestUserId,
            newUser: clerkUserDbId,
            merged: { history: mergedHistory, favorites: mergedFavorites, likes: mergedLikes }
        }),
    });

    // Delete guest user (cascade will clean up any remaining linked data)
    await db.delete(users).where(eq(users.id, guestUserId));

    return {
        success: true,
        merged: {
            history: mergedHistory,
            favorites: mergedFavorites,
            likes: mergedLikes,
        }
    };
}

/**
 * Get current user profile
 */
export async function getUserProfile() {
    const user = await getCurrentUser();

    return {
        id: user.id,
        isGuest: user.isGuest,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isVip: user.isVip,
    };
}

/**
 * Check if current user is logged in (not guest)
 */
export async function isLoggedIn(): Promise<boolean> {
    const { userId: clerkUserId } = await auth();
    return !!clerkUserId;
}
