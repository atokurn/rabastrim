-- Migration: Subscription + Credit System
-- Created: 2026-01-18
-- Description: Add tables for subscription plans, user subscriptions, credits, and unlocked episodes

-- ============================================
-- SUBSCRIPTION PLANS (dynamic pricing)
-- ============================================

CREATE TABLE "subscription_plans" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "slug" varchar(20) UNIQUE NOT NULL,
    "name" varchar(50) NOT NULL,
    "price" integer NOT NULL,
    "duration_days" integer NOT NULL,
    "bonus_credit" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp DEFAULT now()
);

-- Seed initial plans
INSERT INTO "subscription_plans" ("slug", "name", "price", "duration_days", "bonus_credit") VALUES
('1_day', 'Paket Harian', 2000, 1, 0),
('7_day', 'Paket Mingguan', 12000, 7, 10),
('30_day', 'Paket Bulanan', 39000, 30, 30),
('90_day', 'Paket 3 Bulan', 99000, 90, 80);

-- ============================================
-- USER SUBSCRIPTIONS
-- ============================================

CREATE TABLE "subscriptions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE NOT NULL,
    "plan_id" uuid REFERENCES "subscription_plans"("id"),
    "status" varchar(20) NOT NULL DEFAULT 'pending',
    "start_date" timestamp NOT NULL,
    "end_date" timestamp NOT NULL,
    "payment_reference" varchar(255),
    "payment_method" varchar(30),
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-->statement-breakpoint
CREATE INDEX "subs_user_idx" ON "subscriptions"("user_id");
-->statement-breakpoint
CREATE INDEX "subs_status_idx" ON "subscriptions"("status");

-- ============================================
-- USER CREDITS (1 row per user)
-- ============================================

CREATE TABLE "credits" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE NOT NULL UNIQUE,
    "balance" integer NOT NULL DEFAULT 0,
    "updated_at" timestamp DEFAULT now()
);

-->statement-breakpoint
CREATE INDEX "credits_user_idx" ON "credits"("user_id");

-- ============================================
-- CREDIT TRANSACTIONS (audit log)
-- ============================================

CREATE TABLE "credit_transactions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE NOT NULL,
    "type" varchar(30) NOT NULL,
    "amount" integer NOT NULL,
    "balance_after" integer NOT NULL,
    "reference" text,
    "created_at" timestamp DEFAULT now()
);

-->statement-breakpoint
CREATE INDEX "credit_tx_user_idx" ON "credit_transactions"("user_id");

-- ============================================
-- UNLOCKED EPISODES (track per-episode unlock)
-- ============================================

CREATE TABLE "unlocked_episodes" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE NOT NULL,
    "content_id" uuid REFERENCES "contents"("id") ON DELETE CASCADE NOT NULL,
    "episode_number" integer NOT NULL,
    "unlocked_at" timestamp DEFAULT now(),
    UNIQUE("user_id", "content_id", "episode_number")
);

-->statement-breakpoint
CREATE INDEX "unlocked_user_idx" ON "unlocked_episodes"("user_id");
-->statement-breakpoint
CREATE INDEX "unlocked_content_idx" ON "unlocked_episodes"("content_id");

-- ============================================
-- PAYMENT ORDERS (track Pakasir transactions)
-- ============================================

CREATE TABLE "payment_orders" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE NOT NULL,
    "order_id" varchar(50) UNIQUE NOT NULL,
    "order_type" varchar(30) NOT NULL,
    "reference_id" uuid,
    "amount" integer NOT NULL,
    "fee" integer DEFAULT 0,
    "total_payment" integer NOT NULL,
    "payment_method" varchar(30),
    "payment_number" text,
    "status" varchar(20) NOT NULL DEFAULT 'pending',
    "expired_at" timestamp,
    "completed_at" timestamp,
    "created_at" timestamp DEFAULT now()
);

-->statement-breakpoint
CREATE INDEX "payment_user_idx" ON "payment_orders"("user_id");
-->statement-breakpoint
CREATE INDEX "payment_order_idx" ON "payment_orders"("order_id");
-->statement-breakpoint
CREATE INDEX "payment_status_idx" ON "payment_orders"("status");
