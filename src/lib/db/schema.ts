import {
    pgTable,
    text,
    timestamp,
    integer,
    varchar,
    boolean,
    uuid,
    uniqueIndex,
    real,
} from "drizzle-orm/pg-core";

/**
 * User table - stores basic user info
 * For anonymous users, we can use a device-based ID
 */
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    deviceId: varchar("device_id", { length: 255 }).unique(),
    email: varchar("email", { length: 255 }).unique(),
    name: varchar("name", { length: 255 }),
    avatar: text("avatar"),
    isVip: boolean("is_vip").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

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
    userId: uuid("user_id").references(() => users.id).notNull(),
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
export type DramaCache = typeof dramaCache.$inferSelect;
export type NewDramaCache = typeof dramaCache.$inferInsert;
export type EpisodeCache = typeof episodeCache.$inferSelect;
export type NewEpisodeCache = typeof episodeCache.$inferInsert;
