import { db } from "@/lib/db";
import { unlockedEpisodes, contents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { hasActiveSubscription, getUserCredits, spendCredits } from "./subscription-service";

const CREDIT_COST_PER_EPISODE = 10;

// ============================================
// ACCESS CHECK
// ============================================

export interface AccessCheckResult {
    allowed: boolean;
    reason: "subscription" | "unlocked" | "free" | "denied";
    creditCost?: number;
    creditBalance?: number;
}

/**
 * Check if user can access a specific episode
 */
export async function canAccessEpisode(
    userId: string,
    contentId: string,
    episodeNumber: number
): Promise<AccessCheckResult> {
    // 1. Check subscription
    if (await hasActiveSubscription(userId)) {
        return { allowed: true, reason: "subscription" };
    }

    // 2. Check if already unlocked
    const unlocked = await isEpisodeUnlocked(userId, contentId, episodeNumber);
    if (unlocked) {
        return { allowed: true, reason: "unlocked" };
    }

    // 3. Check if content is VIP
    const content = await db
        .select({ isVip: contents.isVip })
        .from(contents)
        .where(eq(contents.id, contentId))
        .limit(1);

    // If content is not VIP or not found, allow access
    if (!content[0] || !content[0].isVip) {
        return { allowed: true, reason: "free" };
    }

    // 4. Denied - return credit info for UI
    const creditBalance = await getUserCredits(userId);
    return {
        allowed: false,
        reason: "denied",
        creditCost: CREDIT_COST_PER_EPISODE,
        creditBalance,
    };
}

/**
 * Check if episode is already unlocked by user
 */
export async function isEpisodeUnlocked(
    userId: string,
    contentId: string,
    episodeNumber: number
): Promise<boolean> {
    const results = await db
        .select()
        .from(unlockedEpisodes)
        .where(
            and(
                eq(unlockedEpisodes.userId, userId),
                eq(unlockedEpisodes.contentId, contentId),
                eq(unlockedEpisodes.episodeNumber, episodeNumber)
            )
        )
        .limit(1);

    return results.length > 0;
}

// ============================================
// UNLOCK OPERATIONS
// ============================================

export interface UnlockResult {
    success: boolean;
    newBalance?: number;
    error?: string;
}

/**
 * Unlock an episode using credits
 */
export async function unlockEpisodeWithCredits(
    userId: string,
    contentId: string,
    episodeNumber: number
): Promise<UnlockResult> {
    // Check if already unlocked
    if (await isEpisodeUnlocked(userId, contentId, episodeNumber)) {
        const balance = await getUserCredits(userId);
        return { success: true, newBalance: balance };
    }

    // Check and spend credits
    try {
        const reference = `episode:${contentId}:${episodeNumber}`;
        const newBalance = await spendCredits(userId, CREDIT_COST_PER_EPISODE, reference);

        // Record unlock
        await db.insert(unlockedEpisodes).values({
            userId,
            contentId,
            episodeNumber,
        });

        return { success: true, newBalance };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return { success: false, error: message };
    }
}

/**
 * Get all unlocked episodes for a specific content
 */
export async function getUnlockedEpisodes(userId: string, contentId: string) {
    return db
        .select()
        .from(unlockedEpisodes)
        .where(
            and(
                eq(unlockedEpisodes.userId, userId),
                eq(unlockedEpisodes.contentId, contentId)
            )
        );
}

/**
 * Get all unlocked content IDs for a user
 */
export async function getAllUnlockedContentIds(userId: string): Promise<string[]> {
    const results = await db
        .select({ contentId: unlockedEpisodes.contentId })
        .from(unlockedEpisodes)
        .where(eq(unlockedEpisodes.userId, userId));

    return [...new Set(results.map(r => r.contentId))];
}

// ============================================
// CONSTANTS
// ============================================

export function getCreditCostPerEpisode(): number {
    return CREDIT_COST_PER_EPISODE;
}
