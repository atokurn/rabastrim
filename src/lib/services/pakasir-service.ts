import { db } from "@/lib/db";
import { paymentOrders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ============================================
// PAKASIR CONFIGURATION
// ============================================

const PAKASIR_API_URL = "https://app.pakasir.com/api";

// Get from environment
function getPakasirConfig() {
    const project = process.env.PAKASIR_PROJECT;
    const apiKey = process.env.PAKASIR_API_KEY;

    if (!project || !apiKey) {
        throw new Error("PAKASIR_PROJECT and PAKASIR_API_KEY must be set");
    }

    return { project, apiKey };
}

// ============================================
// TYPES
// ============================================

export interface CreatePaymentResult {
    success: boolean;
    orderId: string;
    paymentMethod: string;
    paymentNumber: string;
    amount: number;
    fee: number;
    totalPayment: number;
    expiredAt: string;
    error?: string;
}

export type PaymentMethod =
    | "qris"
    | "bni_va"
    | "bri_va"
    | "cimb_niaga_va"
    | "permata_va"
    | "atm_bersama_va";

// ============================================
// PAYMENT OPERATIONS
// ============================================

/**
 * Generate unique order ID
 */
function generateOrderId(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(2, 10).replace(/-/g, "");
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${dateStr}${random}`;
}

/**
 * Create a payment transaction via Pakasir
 */
export async function createPayment(
    userId: string,
    amount: number,
    orderType: "subscription" | "credit_topup",
    referenceId: string | null,
    method: PaymentMethod = "qris"
): Promise<CreatePaymentResult> {
    const { project, apiKey } = getPakasirConfig();
    const orderId = generateOrderId();

    try {
        const response = await fetch(`${PAKASIR_API_URL}/transactioncreate/${method}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                project,
                order_id: orderId,
                amount,
                api_key: apiKey,
            }),
        });

        if (!response.ok) {
            throw new Error(`Pakasir API error: ${response.status}`);
        }

        const data = await response.json();
        const payment = data.payment;

        // Save to database
        await db.insert(paymentOrders).values({
            userId,
            orderId,
            orderType,
            referenceId: referenceId || undefined,
            amount,
            fee: payment.fee,
            totalPayment: payment.total_payment,
            paymentMethod: payment.payment_method,
            paymentNumber: payment.payment_number,
            status: "pending",
            expiredAt: new Date(payment.expired_at),
        });

        return {
            success: true,
            orderId,
            paymentMethod: payment.payment_method,
            paymentNumber: payment.payment_number,
            amount,
            fee: payment.fee,
            totalPayment: payment.total_payment,
            expiredAt: payment.expired_at,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            success: false,
            orderId,
            paymentMethod: method,
            paymentNumber: "",
            amount,
            fee: 0,
            totalPayment: amount,
            expiredAt: "",
            error: message,
        };
    }
}

/**
 * Get payment order by order ID
 */
export async function getPaymentOrder(orderId: string) {
    const results = await db
        .select()
        .from(paymentOrders)
        .where(eq(paymentOrders.orderId, orderId))
        .limit(1);

    return results[0] || null;
}

/**
 * Mark payment as completed (called from webhook)
 */
export async function completePayment(orderId: string, completedAt: Date) {
    await db
        .update(paymentOrders)
        .set({
            status: "completed",
            completedAt,
        })
        .where(eq(paymentOrders.orderId, orderId));

    // Return the order for further processing
    return getPaymentOrder(orderId);
}

/**
 * Cancel a payment order
 */
export async function cancelPayment(orderId: string) {
    const { project, apiKey } = getPakasirConfig();
    const order = await getPaymentOrder(orderId);

    if (!order) throw new Error("Order not found");

    // Call Pakasir cancel API
    await fetch(`${PAKASIR_API_URL}/transactioncancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            project,
            order_id: orderId,
            amount: order.amount,
            api_key: apiKey,
        }),
    });

    // Update local status
    await db
        .update(paymentOrders)
        .set({ status: "canceled" })
        .where(eq(paymentOrders.orderId, orderId));
}

/**
 * Verify payment status with Pakasir API
 */
export async function verifyPayment(orderId: string, amount: number) {
    const { project, apiKey } = getPakasirConfig();

    const url = new URL(`${PAKASIR_API_URL}/transactiondetail`);
    url.searchParams.set("project", project);
    url.searchParams.set("amount", String(amount));
    url.searchParams.set("order_id", orderId);
    url.searchParams.set("api_key", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`Pakasir verify error: ${response.status}`);
    }

    const data = await response.json();
    return data.transaction;
}

/**
 * Simulate payment (sandbox mode only)
 */
export async function simulatePayment(orderId: string, amount: number) {
    const { project, apiKey } = getPakasirConfig();

    const response = await fetch(`${PAKASIR_API_URL}/paymentsimulation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            project,
            order_id: orderId,
            amount,
            api_key: apiKey,
        }),
    });

    return response.ok;
}
