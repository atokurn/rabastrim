import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCreditHistory } from "@/lib/services/subscription-service";

/**
 * GET /api/credits/transactions
 * Returns user's credit transaction history
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
            return NextResponse.json({ transactions: [] });
        }

        const transactions = await getCreditHistory(user.id, 50);

        return NextResponse.json({
            transactions: transactions.map(tx => ({
                id: tx.id,
                type: tx.type,
                amount: tx.amount,
                balanceAfter: tx.balanceAfter,
                reference: tx.reference,
                createdAt: tx.createdAt,
            })),
        });
    } catch (error) {
        console.error("[API] credits/transactions GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch transactions" },
            { status: 500 }
        );
    }
}
