import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
    canAccessEpisode,
    unlockEpisodeWithCredits,
    getCreditCostPerEpisode
} from "@/lib/services/access-control-service";

/**
 * POST /api/credits/use
 * Unlock an episode using credits
 * Body: { contentId: string, episodeNumber: number }
 */
export async function POST(request: NextRequest) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { contentId, episodeNumber } = body;

        if (!contentId || episodeNumber === undefined) {
            return NextResponse.json(
                { error: "contentId and episodeNumber are required" },
                { status: 400 }
            );
        }

        // Get user from DB
        const userResults = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);

        const user = userResults[0];
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Check current access
        const accessCheck = await canAccessEpisode(user.id, contentId, episodeNumber);

        if (accessCheck.allowed) {
            // Already has access
            return NextResponse.json({
                success: true,
                alreadyUnlocked: true,
                reason: accessCheck.reason,
            });
        }

        // Try to unlock with credits
        const result = await unlockEpisodeWithCredits(user.id, contentId, episodeNumber);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: result.error || "Failed to unlock",
                    creditCost: getCreditCostPerEpisode(),
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            newBalance: result.newBalance,
            creditUsed: getCreditCostPerEpisode(),
        });
    } catch (error) {
        console.error("[API] credits/use POST error:", error);
        return NextResponse.json(
            { error: "Failed to use credits" },
            { status: 500 }
        );
    }
}
