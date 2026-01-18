import { db } from "@/lib/db";
import { subscriptionPlans, subscriptions, credits, creditTransactions, users } from "@/lib/db/schema";
import { eq, and, gt, lt, desc } from "drizzle-orm";

// ============================================
// SUBSCRIPTION PLAN QUERIES
// ============================================

/**
 * Get all active subscription plans
 */
export async function getSubscriptionPlans() {
    return db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.isActive, true))
        .orderBy(subscriptionPlans.price);
}

/**
 * Get a subscription plan by slug
 */
export async function getSubscriptionPlanBySlug(slug: string) {
    const results = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.slug, slug))
        .limit(1);
    return results[0] || null;
}

/**
 * Get a subscription plan by ID
 */
export async function getSubscriptionPlanById(planId: string) {
    const results = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, planId))
        .limit(1);
    return results[0] || null;
}

// ============================================
// USER SUBSCRIPTION QUERIES
// ============================================

/**
 * Get user's active subscription
 */
export async function getUserActiveSubscription(userId: string) {
    const now = new Date();
    const results = await db
        .select({
            subscription: subscriptions,
            plan: subscriptionPlans,
        })
        .from(subscriptions)
        .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
        .where(
            and(
                eq(subscriptions.userId, userId),
                eq(subscriptions.status, "active"),
                gt(subscriptions.endDate, now)
            )
        )
        .orderBy(desc(subscriptions.endDate))
        .limit(1);

    return results[0] || null;
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await getUserActiveSubscription(userId);
    return subscription !== null;
}

/**
 * Create a new subscription (pending payment)
 */
export async function createSubscription(
    userId: string,
    planId: string,
    paymentReference: string,
    paymentMethod: string
) {
    const plan = await getSubscriptionPlanById(planId);
    if (!plan) throw new Error("Plan not found");

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const result = await db
        .insert(subscriptions)
        .values({
            userId,
            planId,
            status: "pending",
            startDate: now,
            endDate,
            paymentReference,
            paymentMethod,
        })
        .returning();

    return result[0];
}

/**
 * Activate a subscription after successful payment
 */
export async function activateSubscription(subscriptionId: string) {
    // Get subscription with plan info
    const results = await db
        .select({
            subscription: subscriptions,
            plan: subscriptionPlans,
        })
        .from(subscriptions)
        .leftJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
        .where(eq(subscriptions.id, subscriptionId))
        .limit(1);

    const record = results[0];
    if (!record) throw new Error("Subscription not found");

    // Update subscription status
    await db
        .update(subscriptions)
        .set({ status: "active", updatedAt: new Date() })
        .where(eq(subscriptions.id, subscriptionId));

    // Update user's isVip flag
    await db
        .update(users)
        .set({ isVip: true })
        .where(eq(users.id, record.subscription.userId));

    // Add bonus credit if applicable
    if (record.plan && (record.plan.bonusCredit ?? 0) > 0) {
        await addCredits(
            record.subscription.userId,
            record.plan.bonusCredit!,
            "bonus",
            `Bonus from ${record.plan.name}`
        );
    }

    return { success: true, bonusCredit: record.plan?.bonusCredit ?? 0 };
}

/**
 * Cancel a subscription (user-initiated)
 */
export async function cancelSubscription(subscriptionId: string) {
    await db
        .update(subscriptions)
        .set({ status: "canceled", updatedAt: new Date() })
        .where(eq(subscriptions.id, subscriptionId));
}

/**
 * Expire subscriptions that have passed their end date
 * Should be called by cron job
 */
export async function expireSubscriptions() {
    const now = new Date();
    const result = await db
        .update(subscriptions)
        .set({ status: "expired", updatedAt: now })
        .where(
            and(
                eq(subscriptions.status, "active"),
                lt(subscriptions.endDate, now)
            )
        )
        .returning();

    return { expired: result.length };
}

// ============================================
// CREDIT BALANCE OPERATIONS
// ============================================

/**
 * Get user's credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
    const results = await db
        .select()
        .from(credits)
        .where(eq(credits.userId, userId))
        .limit(1);

    return results[0]?.balance ?? 0;
}

/**
 * Ensure user has a credit record (create if not exists)
 */
async function ensureCreditRecord(userId: string) {
    const existing = await db
        .select()
        .from(credits)
        .where(eq(credits.userId, userId))
        .limit(1);

    if (existing.length === 0) {
        await db.insert(credits).values({ userId, balance: 0 });
    }
}

/**
 * Add credits to user balance
 */
export async function addCredits(
    userId: string,
    amount: number,
    type: string,
    reference: string
): Promise<number> {
    await ensureCreditRecord(userId);

    // Get current balance
    const currentBalance = await getUserCredits(userId);
    const newBalance = currentBalance + amount;

    // Update balance
    await db
        .update(credits)
        .set({ balance: newBalance, updatedAt: new Date() })
        .where(eq(credits.userId, userId));

    // Log transaction
    await db.insert(creditTransactions).values({
        userId,
        type,
        amount,
        balanceAfter: newBalance,
        reference,
    });

    return newBalance;
}

/**
 * Spend credits (deduct from balance)
 * Returns new balance or throws if insufficient
 */
export async function spendCredits(
    userId: string,
    amount: number,
    reference: string
): Promise<number> {
    const currentBalance = await getUserCredits(userId);

    if (currentBalance < amount) {
        throw new Error("Insufficient credits");
    }

    const newBalance = currentBalance - amount;

    // Update balance
    await db
        .update(credits)
        .set({ balance: newBalance, updatedAt: new Date() })
        .where(eq(credits.userId, userId));

    // Log transaction
    await db.insert(creditTransactions).values({
        userId,
        type: "use",
        amount: -amount,
        balanceAfter: newBalance,
        reference,
    });

    return newBalance;
}

/**
 * Get credit transaction history
 */
export async function getCreditHistory(userId: string, limit = 50) {
    return db
        .select()
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, userId))
        .orderBy(desc(creditTransactions.createdAt))
        .limit(limit);
}
