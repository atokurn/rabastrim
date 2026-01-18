import {
    pgTable,
    text,
    timestamp,
    date,
    integer,
    varchar,
    boolean,
    uuid,
    uniqueIndex,
    index,
    real,
} from "drizzle-orm/pg-core";

/**
 * User table - stores basic user info
 * Supports both guest (device-based) and logged-in (Clerk) users
 */
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    deviceId: varchar("device_id", { length: 255 }).unique(),
    clerkId: varchar("clerk_id", { length: 255 }).unique(), // Clerk user ID for logged-in users
    isGuest: boolean("is_guest").default(true), // false when linked to Clerk account
    email: varchar("email", { length: 255 }).unique(),
    name: varchar("name", { length: 255 }),
    avatar: text("avatar"),
    isVip: boolean("is_vip").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("users_clerk_idx").on(table.clerkId),
    index("users_guest_idx").on(table.isGuest),
]);

/**
 * Watch history - tracks user viewing progress
 */
export const watchHistory = pgTable("watch_history", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    dramaId: varchar("drama_id", { length: 100 }).notNull(),
    dramaTitle: varchar("drama_title", { length: 500 }),
    dramaCover: text("drama_cover"),
    provider: varchar("provider", { length: 50 }), // dramabox, netshort, melolo
    episodeId: varchar("episode_id", { length: 100 }),
    episodeNumber: integer("episode_number"),
    lastPosition: integer("last_position").default(0), // seconds
    duration: integer("duration").default(0), // total duration in seconds
    progress: integer("progress").default(0), // 0-100 percentage
    isCompleted: boolean("is_completed").default(false), // episode fully watched
    watchedAt: timestamp("watched_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    uniqueIndex("user_drama_idx").on(table.userId, table.dramaId),
]);

/**
 * Favorites / Watchlist
 */
export const favorites = pgTable("favorites", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    dramaId: varchar("drama_id", { length: 100 }).notNull(),
    dramaTitle: varchar("drama_title", { length: 500 }),
    dramaCover: text("drama_cover"),
    provider: varchar("provider", { length: 50 }),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    uniqueIndex("user_favorite_idx").on(table.userId, table.dramaId),
]);

/**
 * Likes - Episode-level likes
 */
export const likes = pgTable("likes", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    dramaId: varchar("drama_id", { length: 100 }).notNull(),
    dramaTitle: varchar("drama_title", { length: 500 }),
    dramaCover: text("drama_cover"),
    provider: varchar("provider", { length: 50 }),
    episodeNumber: integer("episode_number").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    uniqueIndex("user_like_idx").on(table.userId, table.dramaId, table.episodeNumber),
    index("likes_user_idx").on(table.userId),
]);

/**
 * Drama Cache - cached metadata from external APIs
 */
export const dramaCache = pgTable("drama_cache", {
    id: uuid("id").defaultRandom().primaryKey(),
    externalId: varchar("external_id", { length: 100 }).notNull(),
    provider: varchar("provider", { length: 50 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    posterUrl: text("poster_url"),
    bannerUrl: text("banner_url"),
    year: integer("year"),
    rating: real("rating"),
    isVip: boolean("is_vip").default(false),
    totalEpisode: integer("total_episode"),
    isCompleted: boolean("is_completed").default(false), // drama finished airing
    lastFetched: timestamp("last_fetched").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    uniqueIndex("drama_provider_idx").on(table.externalId, table.provider),
]);

/**
 * Episode Cache - cached episode data with premium info
 */
export const episodeCache = pgTable("episode_cache", {
    id: uuid("id").defaultRandom().primaryKey(),
    externalId: varchar("external_id", { length: 100 }).notNull(),
    dramaExternalId: varchar("drama_external_id", { length: 100 }).notNull(),
    provider: varchar("provider", { length: 50 }).notNull(),
    title: varchar("title", { length: 500 }),
    episodeNumber: integer("episode_number"),
    sortOrder: integer("sort_order"), // stable ordering for auto-next
    duration: integer("duration"),
    isFree: boolean("is_free").default(true), // premium episode check
    lastFetched: timestamp("last_fetched").defaultNow(),
}, (table) => [
    uniqueIndex("episode_provider_idx").on(table.externalId, table.provider),
]);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type WatchHistory = typeof watchHistory.$inferSelect;
export type NewWatchHistory = typeof watchHistory.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;
export type DramaCache = typeof dramaCache.$inferSelect;
export type NewDramaCache = typeof dramaCache.$inferInsert;
export type EpisodeCache = typeof episodeCache.$inferSelect;
export type NewEpisodeCache = typeof episodeCache.$inferInsert;

// ============================================
// LOCAL METADATA STORAGE TABLES
// ============================================

/**
 * Provider type for content sources
 */
export type ContentProvider = "dramabox" | "flickreels" | "melolo" | "dramaqueen" | "netshort" | "donghua";

/**
 * Source where content was fetched from
 */
export type FetchedFrom = "trending" | "home" | "search" | "foryou";

/**
 * Content visibility status
 */
export type ContentStatus = "active" | "hidden";

/**
 * Contents - Main metadata table with freshness control
 * This is the source of truth for all content metadata
 */
export const contents = pgTable("contents", {
    id: uuid("id").defaultRandom().primaryKey(),

    // Provider identification (WAJIB - provider ID discipline)
    provider: varchar("provider", { length: 50 }).notNull(),
    providerContentId: varchar("provider_content_id", { length: 100 }).notNull(),

    // Core metadata
    title: varchar("title", { length: 500 }).notNull(),
    altTitles: text("alt_titles"), // JSON array
    description: text("description"),
    posterUrl: text("poster_url"),
    bannerUrl: text("banner_url"),

    // Additional metadata
    year: integer("year"),
    releaseDate: date("release_date"),                    // Actual release date from provider
    releaseYear: integer("release_year"),                 // Year fallback if full date unavailable
    releaseStatus: varchar("release_status", { length: 20 }).default("unknown"), // released, ongoing, upcoming, unknown
    releaseSource: varchar("release_source", { length: 20 }).default("unknown"), // api_detail, inferred, ingestion, unknown
    region: varchar("region", { length: 50 }),
    tags: text("tags"), // JSON array
    rating: real("rating"),

    // Content info
    isSeries: boolean("is_series").default(true),
    contentType: varchar("content_type", { length: 20 }), // drama, anime, short_drama, movie
    episodeCount: integer("episode_count"),
    isVip: boolean("is_vip").default(false),

    // Source & Freshness Control (WAJIB)
    fetchedFrom: varchar("fetched_from", { length: 50 }).notNull(), // trending, home, search, foryou
    fetchedAt: timestamp("fetched_at").defaultNow(),
    lastSeenAt: timestamp("last_seen_at").defaultNow(),
    status: varchar("status", { length: 20 }).default("active"), // hidden, active

    // Scoring
    popularityScore: integer("popularity_score").default(0),
    viewCount: integer("view_count").default(0),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    uniqueIndex("content_provider_idx").on(table.provider, table.providerContentId),
]);

/**
 * Episodes Metadata - Lightweight episode info (no video URLs)
 * Video URLs should be fetched real-time from provider API
 */
export const episodesMetadata = pgTable("episodes_metadata", {
    id: uuid("id").defaultRandom().primaryKey(),
    contentId: uuid("content_id").references(() => contents.id, { onDelete: "cascade" }).notNull(),
    providerEpisodeId: varchar("provider_episode_id", { length: 100 }), // WAJIB simpan
    episodeNumber: integer("episode_number").notNull(),
    title: varchar("title", { length: 255 }),
    duration: integer("duration"), // seconds
    isFree: boolean("is_free").default(true),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    uniqueIndex("episode_content_idx").on(table.contentId, table.episodeNumber),
]);

/**
 * Sync Logs - Track background sync jobs
 */
export const syncLogs = pgTable("sync_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: varchar("provider", { length: 50 }).notNull(),
    syncType: varchar("sync_type", { length: 50 }).notNull(), // trending, home, foryou
    itemsProcessed: integer("items_processed").default(0),
    itemsCreated: integer("items_created").default(0),
    itemsUpdated: integer("items_updated").default(0),
    status: varchar("status", { length: 20 }).default("success"), // success, failed, partial
    error: text("error"),
    durationMs: integer("duration_ms"),
    completedAt: timestamp("completed_at").defaultNow(),
});

// ============================================
// LANGUAGE SUPPORT TABLES
// ============================================

/**
 * Language type for content
 */
export type LanguageType = "subtitle" | "dubbing";

/**
 * Source of language data
 */
export type LanguageSource = "default" | "playback" | "admin" | "api";

/**
 * Content Languages - Available languages for each content
 * Supports both subtitle and dubbing per provider
 */
export const contentLanguages = pgTable("content_languages", {
    id: uuid("id").defaultRandom().primaryKey(),
    contentId: uuid("content_id").references(() => contents.id, { onDelete: "cascade" }).notNull(),
    provider: varchar("provider", { length: 50 }).notNull(),
    languageCode: varchar("language_code", { length: 10 }).notNull(), // id, en, zh, ja, ko
    providerLanguageId: varchar("provider_language_id", { length: 20 }), // "4", "6", "id-ID"
    isDefault: boolean("is_default").default(false),
    type: varchar("type", { length: 20 }).default("subtitle"), // subtitle | dubbing
    source: varchar("source", { length: 20 }).default("default"), // default | playback | admin | api
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    uniqueIndex("content_lang_idx").on(table.contentId, table.provider, table.languageCode, table.type),
]);

// New type exports for local metadata storage
export type Content = typeof contents.$inferSelect;
export type NewContent = typeof contents.$inferInsert;
export type EpisodeMetadata = typeof episodesMetadata.$inferSelect;
export type NewEpisodeMetadata = typeof episodesMetadata.$inferInsert;
export type SyncLog = typeof syncLogs.$inferSelect;
export type NewSyncLog = typeof syncLogs.$inferInsert;
export type ContentLanguage = typeof contentLanguages.$inferSelect;
export type NewContentLanguage = typeof contentLanguages.$inferInsert;

// ============================================
// TELEGRAM NOTIFICATION TRACKING
// ============================================

/**
 * Telegram Notifications - Tracks which dramas have been notified to channel
 */
export const telegramNotifications = pgTable("telegram_notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    contentId: uuid("content_id").references(() => contents.id, { onDelete: "cascade" }).notNull(),
    provider: varchar("provider", { length: 50 }).notNull(),
    providerContentId: varchar("provider_content_id", { length: 100 }).notNull(),
    messageId: integer("message_id"), // Telegram message ID
    sentAt: timestamp("sent_at").defaultNow(),
    status: varchar("status", { length: 20 }).default("sent"), // sent, failed, pending
    error: text("error"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    uniqueIndex("notif_content_idx").on(table.contentId),
    index("notif_provider_idx").on(table.provider),
    index("notif_status_idx").on(table.status),
]);

export type TelegramNotification = typeof telegramNotifications.$inferSelect;
export type NewTelegramNotification = typeof telegramNotifications.$inferInsert;

// ============================================
// SUBSCRIPTION & CREDIT SYSTEM
// ============================================

/**
 * Subscription Plans - Dynamic pricing configuration
 */
export const subscriptionPlans = pgTable("subscription_plans", {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 20 }).unique().notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    price: integer("price").notNull(),
    durationDays: integer("duration_days").notNull(),
    bonusCredit: integer("bonus_credit").default(0),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Subscriptions - User subscription records
 */
export const subscriptions = pgTable("subscriptions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    planId: uuid("plan_id").references(() => subscriptionPlans.id),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, active, expired, canceled
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    paymentReference: varchar("payment_reference", { length: 255 }),
    paymentMethod: varchar("payment_method", { length: 30 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("subs_user_idx").on(table.userId),
    index("subs_status_idx").on(table.status),
]);

/**
 * Credits - User credit balance (1 row per user)
 */
export const credits = pgTable("credits", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
    balance: integer("balance").notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Credit Transactions - Audit log for all credit changes
 */
export const creditTransactions = pgTable("credit_transactions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    type: varchar("type", { length: 30 }).notNull(), // bonus, purchase, use, refund
    amount: integer("amount").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    reference: text("reference"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    index("credit_tx_user_idx").on(table.userId),
]);

/**
 * Unlocked Episodes - Track per-episode unlock via credits
 */
export const unlockedEpisodes = pgTable("unlocked_episodes", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    contentId: uuid("content_id").references(() => contents.id, { onDelete: "cascade" }).notNull(),
    episodeNumber: integer("episode_number").notNull(),
    unlockedAt: timestamp("unlocked_at").defaultNow(),
}, (table) => [
    uniqueIndex("unlocked_user_content_ep_idx").on(table.userId, table.contentId, table.episodeNumber),
    index("unlocked_user_idx").on(table.userId),
]);

/**
 * Payment Orders - Track Pakasir payment transactions
 */
export const paymentOrders = pgTable("payment_orders", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    orderId: varchar("order_id", { length: 50 }).unique().notNull(),
    orderType: varchar("order_type", { length: 30 }).notNull(), // subscription, credit_topup
    referenceId: uuid("reference_id"),
    amount: integer("amount").notNull(),
    fee: integer("fee").default(0),
    totalPayment: integer("total_payment").notNull(),
    paymentMethod: varchar("payment_method", { length: 30 }),
    paymentNumber: text("payment_number"),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, completed, expired, canceled
    expiredAt: timestamp("expired_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    index("payment_user_idx").on(table.userId),
    index("payment_status_idx").on(table.status),
]);

// Type exports for subscription & credit system
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Credit = typeof credits.$inferSelect;
export type NewCredit = typeof credits.$inferInsert;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;
export type UnlockedEpisode = typeof unlockedEpisodes.$inferSelect;
export type NewUnlockedEpisode = typeof unlockedEpisodes.$inferInsert;
export type PaymentOrder = typeof paymentOrders.$inferSelect;
export type NewPaymentOrder = typeof paymentOrders.$inferInsert;
