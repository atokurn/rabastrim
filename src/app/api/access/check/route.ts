import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { canAccessEpisode } from "@/lib/services/access-control-service";

/**
 * GET /api/access/check?contentId=xxx&episodeNumber=1
 * Check if user can access specific episode
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const contentId = searchParams.get("contentId");
        const episodeNumber = searchParams.get("episodeNumber");

        if (!contentId || !episodeNumber) {
            return NextResponse.json(
                { error: "contentId and episodeNumber are required" },
                { status: 400 }
            );
        }

        const { userId: clerkId } = await auth();

        // If not logged in, check if content is free
        if (!clerkId) {
            // For guest, only free content is accessible
            return NextResponse.json({
                allowed: false,
                reason: "login_required",
                message: "Please login to access this content",
            });
        }

        // Get user from DB
        const userResults = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);

        const user = userResults[0];
        if (!user) {
            return NextResponse.json({
                allowed: false,
                reason: "user_not_found",
            });
        }

        // Check access
        const accessResult = await canAccessEpisode(
            user.id,
            contentId,
            parseInt(episodeNumber)
        );

        return NextResponse.json({
            allowed: accessResult.allowed,
            reason: accessResult.reason,
            creditCost: accessResult.creditCost,
            creditBalance: accessResult.creditBalance,
        });
    } catch (error) {
        console.error("[API] access/check error:", error);
        return NextResponse.json(
            { error: "Failed to check access" },
            { status: 500 }
        );
    }
}
