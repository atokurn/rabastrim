import { NextRequest, NextResponse } from "next/server";
import { getPaymentOrder } from "@/lib/services/pakasir-service";
import { getCurrentUser } from "@/lib/actions/user";

/**
 * GET /api/vip/status?orderId=xxx
 * Check payment status for a specific order
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || user.isGuest) {
            return NextResponse.json(
                { error: "Login required" },
                { status: 401 }
            );
        }

        const orderId = request.nextUrl.searchParams.get("orderId");
        if (!orderId) {
            return NextResponse.json(
                { error: "orderId is required" },
                { status: 400 }
            );
        }

        const order = await getPaymentOrder(orderId);

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // Verify order belongs to this user
        if (order.userId !== user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            orderId: order.orderId,
            status: order.status,
            amount: order.amount,
            completedAt: order.completedAt,
        });
    } catch (error) {
        console.error("[API] payment status error:", error);
        return NextResponse.json(
            { error: "Failed to check payment status" },
            { status: 500 }
        );
    }
}
