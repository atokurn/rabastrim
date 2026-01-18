import { NextResponse } from "next/server";
import { getSubscriptionPlans } from "@/lib/services/subscription-service";

/**
 * GET /api/vip/plans
 * Returns all active subscription plans
 */
export async function GET() {
    try {
        const plans = await getSubscriptionPlans();

        return NextResponse.json({
            plans: plans.map(plan => ({
                id: plan.id,
                slug: plan.slug,
                name: plan.name,
                price: plan.price,
                priceFormatted: `Rp${plan.price.toLocaleString("id-ID")}`,
                durationDays: plan.durationDays,
                bonusCredit: plan.bonusCredit,
            })),
        });
    } catch (error) {
        console.error("[API] subscription/plans error:", error);
        return NextResponse.json(
            { error: "Failed to fetch plans" },
            { status: 500 }
        );
    }
}
