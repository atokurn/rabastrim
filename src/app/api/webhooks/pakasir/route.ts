import { NextRequest, NextResponse } from "next/server";
import { completePayment, getPaymentOrder } from "@/lib/services/pakasir-service";
import { activateSubscription } from "@/lib/services/subscription-service";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/webhooks/pakasir
 * Handle Pakasir payment webhook
 * Body from Pakasir:
 * {
 *   amount: number,
 *   order_id: string,
 *   project: string,
 *   status: "SUKSES" | "completed" | etc,
 *   payment_method: string,
 *   completed_at?: string
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { order_id, amount, status, completed_at } = body;

        console.log("[Webhook] Pakasir payment received:", { order_id, amount, status });

        // Accept both Pakasir format ("SUKSES") and custom format ("completed")
        const isSuccessStatus = ["completed", "sukses", "SUKSES", "success", "SUCCESS"].includes(status);

        if (!isSuccessStatus) {
            console.log("[Webhook] Non-success status, skipping:", status);
            return NextResponse.json({ received: true, processed: false, reason: "non-success status" });
        }

        // Get payment order from DB
        const order = await getPaymentOrder(order_id);
        if (!order) {
            console.error("[Webhook] Order not found:", order_id);
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // Validate amount (use order.amount from DB, not totalPayment)
        if (order.amount !== amount) {
            console.error("[Webhook] Amount mismatch:", { expected: order.amount, received: amount });
            return NextResponse.json(
                { error: "Amount mismatch", expected: order.amount, received: amount },
                { status: 400 }
            );
        }

        // Mark payment as completed (use now if completed_at not provided)
        const completedDate = completed_at ? new Date(completed_at) : new Date();
        await completePayment(order_id, completedDate);

        // Process based on order type
        if (order.orderType === "subscription") {
            // Find subscription by payment reference
            const subscriptionResults = await db
                .select()
                .from(subscriptions)
                .where(eq(subscriptions.paymentReference, order_id))
                .limit(1);

            const subscription = subscriptionResults[0];
            if (subscription) {
                const result = await activateSubscription(subscription.id);
                console.log("[Webhook] Subscription activated:", {
                    subscriptionId: subscription.id,
                    bonusCredit: result.bonusCredit,
                });
            }
        } else if (order.orderType === "credit_topup") {
            // TODO: Add credits to user (when credit topup is implemented)
            console.log("[Webhook] Credit topup completed:", order_id);
        }

        return NextResponse.json({
            received: true,
            processed: true,
            orderId: order_id,
        });
    } catch (error) {
        console.error("[Webhook] Pakasir error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
