import { NextRequest, NextResponse } from "next/server";
import {
    getUserActiveSubscription,
    getSubscriptionPlanBySlug,
    createSubscription,
} from "@/lib/services/subscription-service";
import { createPayment, PaymentMethod } from "@/lib/services/pakasir-service";
import { getCurrentUser } from "@/lib/actions/user";

/**
 * GET /api/vip
 * Returns user's current subscription status
 */
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || user.isGuest) {
            return NextResponse.json(
                { error: "Login required to view subscription" },
                { status: 401 }
            );
        }

        // Get active subscription
        const subscription = await getUserActiveSubscription(user.id);

        if (!subscription) {
            return NextResponse.json({
                active: false,
                subscription: null,
            });
        }

        return NextResponse.json({
            active: true,
            subscription: {
                id: subscription.subscription.id,
                plan: subscription.plan?.name,
                planSlug: subscription.plan?.slug,
                status: subscription.subscription.status,
                startDate: subscription.subscription.startDate,
                endDate: subscription.subscription.endDate,
                daysRemaining: Math.ceil(
                    (subscription.subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                ),
            },
        });
    } catch (error) {
        console.error("[API] subscription GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscription" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/vip
 * Create a new subscription order
 * Body: { planSlug: string, paymentMethod?: string }
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || user.isGuest) {
            return NextResponse.json(
                { error: "Login required to purchase subscription" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { planSlug, paymentMethod = "qris" } = body;

        if (!planSlug) {
            return NextResponse.json(
                { error: "planSlug is required" },
                { status: 400 }
            );
        }

        // Get plan
        const plan = await getSubscriptionPlanBySlug(planSlug);
        if (!plan) {
            return NextResponse.json(
                { error: "Invalid plan" },
                { status: 400 }
            );
        }

        // Create payment via Pakasir
        const payment = await createPayment(
            user.id,
            plan.price,
            "subscription",
            plan.id,
            paymentMethod as PaymentMethod
        );

        if (!payment.success) {
            return NextResponse.json(
                { error: payment.error || "Payment creation failed" },
                { status: 500 }
            );
        }

        // Create subscription record (pending)
        const subscription = await createSubscription(
            user.id,
            plan.id,
            payment.orderId,
            paymentMethod
        );

        return NextResponse.json({
            success: true,
            subscription: {
                id: subscription.id,
                plan: plan.name,
                status: subscription.status,
            },
            payment: {
                orderId: payment.orderId,
                method: payment.paymentMethod,
                paymentNumber: payment.paymentNumber,
                amount: payment.amount,
                fee: payment.fee,
                totalPayment: payment.totalPayment,
                expiredAt: payment.expiredAt,
            },
        });
    } catch (error) {
        console.error("[API] subscription POST error:", error);
        return NextResponse.json(
            { error: "Failed to create subscription" },
            { status: 500 }
        );
    }
}
