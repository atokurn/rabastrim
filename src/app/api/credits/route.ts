import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getUserCredits } from "@/lib/services/subscription-service";
import { getCreditCostPerEpisode } from "@/lib/services/access-control-service";

/**
 * GET /api/credits
 * Returns user's credit balance
 */
export async function GET() {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
                balance: 0,
                costPerEpisode: getCreditCostPerEpisode(),
            });
        }

        const balance = await getUserCredits(user.id);

        return NextResponse.json({
            balance,
            costPerEpisode: getCreditCostPerEpisode(),
        });
    } catch (error) {
        console.error("[API] credits GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch credits" },
            { status: 500 }
        );
    }
}
