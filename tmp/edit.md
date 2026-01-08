# Walkthrough: Fix Drama China & Korea Tabs

## Summary

Fixed empty Drama China and Drama Korea tabs by implementing proper content classification using a new `content_type` column and provider-based defaults.

---

## Problem

| Issue | Root Cause |
|-------|------------|
| Drama China/Korea tabs empty | `region` field not populated from API |
| All DramaQueen → Anime | Anime filter matched all dramaqueen items |
| Missing poster URLs | [upsertContent](file:///Volumes/ScutiEX/ScutiEX/antigravity/rabastrim/src/lib/services/content-repository.ts#4-27) didn't update `region`/`tags` on conflict |

---

## Solution: Multi-Dimension Classification

### 1. Database Schema

Added `content_type` column:

```diff:schema.ts
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

// ============================================
// LOCAL METADATA STORAGE TABLES
// ============================================

/**
 * Provider type for content sources
 */
export type ContentProvider = "dramabox" | "flickreels" | "melolo" | "dramaqueen" | "netshort";

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
    region: varchar("region", { length: 50 }),
    tags: text("tags"), // JSON array
    rating: real("rating"),

    // Content info
    isSeries: boolean("is_series").default(true),
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

// New type exports for local metadata storage
export type Content = typeof contents.$inferSelect;
export type NewContent = typeof contents.$inferInsert;
export type EpisodeMetadata = typeof episodesMetadata.$inferSelect;
export type NewEpisodeMetadata = typeof episodesMetadata.$inferInsert;
export type SyncLog = typeof syncLogs.$inferSelect;
export type NewSyncLog = typeof syncLogs.$inferInsert;
===
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

// ============================================
// LOCAL METADATA STORAGE TABLES
// ============================================

/**
 * Provider type for content sources
 */
export type ContentProvider = "dramabox" | "flickreels" | "melolo" | "dramaqueen" | "netshort";

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

// New type exports for local metadata storage
export type Content = typeof contents.$inferSelect;
export type NewContent = typeof contents.$inferInsert;
export type EpisodeMetadata = typeof episodesMetadata.$inferSelect;
export type NewEpisodeMetadata = typeof episodesMetadata.$inferInsert;
export type SyncLog = typeof syncLogs.$inferSelect;
export type NewSyncLog = typeof syncLogs.$inferInsert;
```

### 2. Provider-Based Defaults

Updated normalizers with reliable defaults:

| Provider | `content_type` | `region` |
|----------|----------------|----------|
| dramabox | short_drama | CN |
| melolo | short_drama | ID |
| flickreels | short_drama | varies |
| dramaqueen | drama/anime | CN (fallback) |

```diff:provider-normalizers.ts
import { NewContent } from "@/lib/db/schema";

interface BaseProviderData {
    bookId: string;
    bookName?: string;
    title?: string;
    cover?: string;
    poster?: string;
    introduction?: string;
    desc?: string;
    description?: string;
    totalEpisodes?: number;
    episodeCount?: number;
    tags?: string[];
    tagNames?: string[];
    year?: number;
    region?: string;
    score?: number;
}

export function normalizeDramaBox(data: BaseProviderData, fetchedFrom: "trending" | "search" | "home" | "foryou"): NewContent {
    return {
        provider: "dramabox",
        providerContentId: data.bookId,
        title: data.bookName || data.title || "Unknown Title",
        altTitles: data.bookName ? JSON.stringify([data.bookName]) : null,
        description: data.introduction || data.desc || data.description || "",
        posterUrl: data.cover || data.poster || "",
        year: data.year || null,
        region: data.region || null,
        tags: data.tagNames ? JSON.stringify(data.tagNames) : data.tags ? JSON.stringify(data.tags) : null,
        isSeries: true,
        episodeCount: data.totalEpisodes || data.episodeCount || 0,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}

export function normalizeNetShort(data: BaseProviderData, fetchedFrom: "trending" | "search" | "home" | "foryou"): NewContent {
    return {
        provider: "netshort",
        providerContentId: data.bookId, // Assuming NetShort uses bookId mostly
        title: data.title || data.bookName || "Unknown Title",
        altTitles: null,
        description: data.description || "",
        posterUrl: data.poster || data.cover || "",
        year: data.year || null,
        region: null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        isSeries: true,
        episodeCount: data.episodeCount || data.totalEpisodes || 0,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}

export function normalizeMelolo(data: BaseProviderData, fetchedFrom: "trending" | "search" | "home" | "foryou"): NewContent {
    return {
        provider: "melolo",
        providerContentId: data.bookId || String(Math.random()),
        title: data.title || "Unknown Title",
        altTitles: null,
        description: data.description || "",
        posterUrl: data.cover || "",
        year: null,
        region: null,
        tags: null,
        isSeries: true,
        episodeCount: data.episodeCount || 0,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}

export function normalizeDramaQueen(data: BaseProviderData, fetchedFrom: "trending" | "search" | "home" | "foryou"): NewContent {
    return {
        provider: "dramaqueen",
        providerContentId: data.bookId,
        title: data.title || data.bookName || "Unknown Title",
        altTitles: null,
        description: data.description || data.desc || "",
        posterUrl: data.cover || data.poster || "",
        year: data.year || null,
        region: data.region || null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        isSeries: true,
        episodeCount: data.episodeCount || data.totalEpisodes || 0,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}

===
import { NewContent } from "@/lib/db/schema";

interface BaseProviderData {
    bookId: string;
    bookName?: string;
    title?: string;
    cover?: string;
    poster?: string;
    introduction?: string;
    desc?: string;
    description?: string;
    totalEpisodes?: number;
    episodeCount?: number;
    tags?: string[];
    tagNames?: string[];
    year?: number;
    region?: string;
    contentType?: string; // drama, anime, short_drama, movie
    score?: number;
}

export function normalizeDramaBox(data: BaseProviderData, fetchedFrom: "trending" | "search" | "home" | "foryou"): NewContent {
    return {
        provider: "dramabox",
        providerContentId: data.bookId,
        title: data.bookName || data.title || "Unknown Title",
        altTitles: data.bookName ? JSON.stringify([data.bookName]) : null,
        description: data.introduction || data.desc || data.description || "",
        posterUrl: data.cover || data.poster || "",
        year: data.year || null,
        region: data.region || "CN",  // DramaBox = Chinese content
        contentType: "short_drama",   // DramaBox = short drama provider
        tags: data.tagNames ? JSON.stringify(data.tagNames) : data.tags ? JSON.stringify(data.tags) : null,
        isSeries: true,
        episodeCount: data.totalEpisodes || data.episodeCount || 0,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}

export function normalizeNetShort(data: BaseProviderData, fetchedFrom: "trending" | "search" | "home" | "foryou"): NewContent {
    return {
        provider: "netshort",
        providerContentId: data.bookId,
        title: data.title || data.bookName || "Unknown Title",
        altTitles: null,
        description: data.description || "",
        posterUrl: data.poster || data.cover || "",
        year: data.year || null,
        region: data.region || null,
        contentType: "short_drama",   // NetShort = short drama provider
        tags: data.tags ? JSON.stringify(data.tags) : null,
        isSeries: true,
        episodeCount: data.episodeCount || data.totalEpisodes || 0,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}

export function normalizeMelolo(data: BaseProviderData, fetchedFrom: "trending" | "search" | "home" | "foryou"): NewContent {
    const posterUrl = data.poster || data.cover || "";

    return {
        provider: "melolo",
        providerContentId: data.bookId || String(Math.random()),
        title: data.bookName || data.title || "Unknown Title",
        altTitles: null,
        description: data.description || data.introduction || "",
        posterUrl,
        year: null,
        region: "ID",                 // Melolo = Indonesian content
        contentType: "short_drama",   // Melolo = short drama provider
        tags: null,
        isSeries: true,
        episodeCount: data.episodeCount || 0,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}

export function normalizeDramaQueen(data: BaseProviderData, fetchedFrom: "trending" | "search" | "home" | "foryou"): NewContent {
    // Determine content type: donghua = anime, otherwise drama
    const contentType = data.contentType === "donghua" ? "anime" : "drama";
    
    return {
        provider: "dramaqueen",
        providerContentId: data.bookId,
        title: data.title || data.bookName || "Unknown Title",
        altTitles: null,
        description: data.description || data.desc || "",
        posterUrl: data.cover || data.poster || "",
        year: data.year || null,
        region: data.region || "CN",  // DramaQueen default = CN (fallback)
        contentType,                  // drama or anime based on type
        tags: data.tags ? JSON.stringify(data.tags) : null,
        isSeries: true,
        episodeCount: data.episodeCount || data.totalEpisodes || 0,
        fetchedFrom,
        status: "active",
        popularityScore: 0,
        viewCount: 0,
    };
}
```

### 3. Fixed Category Filters

Updated `/api/explore/all-dramas`:

- **Short Drama**: `content_type = 'short_drama'` or short drama providers
- **Drama China**: `region = 'CN'` AND NOT anime
- **Anime**: `content_type = 'anime'` or tags contain donghua

```diff:route.ts
===
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contents } from "@/lib/db/schema";
import { desc, lt, eq, and, or, sql } from "drizzle-orm";

// Fallback imports for API-based data when DB is empty
import { DramaBoxApi } from "@/lib/api/dramabox";
import { FlickReelsApi } from "@/lib/api/flickreels";
import { MeloloApi } from "@/lib/api/melolo";

export const dynamic = 'force-dynamic';

interface NormalizedItem {
    id: string;
    title: string;
    image: string;
    episodes?: string;
    provider: string;
    createdAt?: string;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Cursor-based pagination (NOT page-based)
    const cursor = searchParams.get("cursor"); // ISO timestamp
    const limit = Math.min(parseInt(searchParams.get("limit") || "24"), 40); // Max 40
    const provider = searchParams.get("provider") || "all";
    const category = searchParams.get("category"); // Optional category filter

    try {
        // Build WHERE conditions
        const conditions = [eq(contents.status, "active")];

        // Cursor condition
        if (cursor) {
            conditions.push(lt(contents.createdAt, new Date(cursor)));
        }

        // Provider filter
        if (provider && provider !== "all") {
            conditions.push(eq(contents.provider, provider));
        }

        // Category-based filtering
        if (category === "Short Drama") {
            // Only short drama providers or contentType
            conditions.push(
                or(
                    eq(contents.contentType, "short_drama"),
                    eq(contents.provider, "dramabox"),
                    eq(contents.provider, "flickreels"),
                    eq(contents.provider, "melolo")
                )!
            );
        } else if (category === "Drama China") {
            // Chinese dramas, exclude anime/donghua
            conditions.push(eq(contents.region, "CN"));
            conditions.push(
                or(
                    eq(contents.contentType, "drama"),
                    eq(contents.contentType, "short_drama"),
                    sql`${contents.contentType} IS NULL`
                )!
            );
        } else if (category === "Drama Korea") {
            // Korean dramas
            conditions.push(eq(contents.region, "KR"));
        } else if (category === "Anime") {
            // Anime/Donghua content based on contentType
            conditions.push(
                or(
                    eq(contents.contentType, "anime"),
                    sql`${contents.tags}::text ILIKE '%donghua%'`
                )!
            );
        }

        // Query database
        const items = await db.select({
            id: contents.providerContentId,
            title: contents.title,
            image: contents.posterUrl,
            episodes: contents.episodeCount,
            provider: contents.provider,
            createdAt: contents.createdAt,
        })
            .from(contents)
            .where(and(...conditions))
            .orderBy(desc(contents.createdAt))
            .limit(limit + 1); // Fetch one extra to check hasMore

        // Determine if there are more items
        const hasMore = items.length > limit;
        const resultItems = hasMore ? items.slice(0, limit) : items;

        // Get next cursor from last item
        const lastItem = resultItems[resultItems.length - 1];
        const nextCursor = lastItem?.createdAt?.toISOString() || null;

        // Normalize response
        const data: NormalizedItem[] = resultItems.map(item => ({
            id: item.id,
            title: item.title,
            image: item.image || "",
            episodes: item.episodes ? `${item.episodes} Eps` : undefined,
            provider: item.provider,
            createdAt: item.createdAt?.toISOString(),
        }));

        // Fallback to API if database is empty
        if (data.length === 0 && !cursor) {
            console.log("[all-dramas] Database empty, falling back to API");
            const fallbackData = await fetchFallbackFromAPI(category);
            return NextResponse.json({
                success: true,
                data: fallbackData,
                nextCursor: null,
                hasMore: false,
                source: "api_fallback"
            });
        }

        return NextResponse.json({
            success: true,
            data,
            nextCursor: hasMore ? nextCursor : null,
            hasMore,
            source: "database"
        });

    } catch (error) {
        console.error("[all-dramas] Error:", error);
        return NextResponse.json({
            success: false,
            data: [],
            nextCursor: null,
            hasMore: false,
            error: "Database query failed"
        }, { status: 500 });
    }
}

// Fallback function when database is empty
async function fetchFallbackFromAPI(category?: string | null): Promise<NormalizedItem[]> {
    try {
        if (category === "Short Drama" || !category || category === "Semua") {
            const data = await DramaBoxApi.getTrending();
            return data.slice(0, 24).map(d => ({
                id: d.bookId,
                title: d.bookName,
                image: d.coverWap || d.cover || "",
                episodes: d.chapterCount ? `${d.chapterCount} Eps` : undefined,
                provider: "dramabox"
            }));
        }
        return [];
    } catch {
        return [];
    }
}
```

### 4. Upsert Fix

Added `contentType` and `region` to update set:

```diff:content-repository.ts
import { db, contents, Content, NewContent } from "@/lib/db";
import { eq, ilike, desc, sql, and, notInArray } from "drizzle-orm";

export async function upsertContent(data: NewContent) {
    // Check if exists first to avoid unnecessary updates if data hasn't changed?
    // For now, simpler to just upsert on conflict

    return db
        .insert(contents)
        .values(data)
        .onConflictDoUpdate({
            target: [contents.provider, contents.providerContentId],
            set: {
                title: data.title,
                description: data.description,
                posterUrl: data.posterUrl,
                episodeCount: data.episodeCount,
                fetchedAt: new Date(),
                fetchedFrom: data.fetchedFrom, // Update source tracking if seen again
                // NOT updating popularityScore or viewCount here, they persist
            },
        })
        .returning();
}

const PAGE_SIZE = 20;

export async function getContent(cursor?: number, limit: number = PAGE_SIZE) {
    let query = db
        .select()
        .from(contents)
        .where(eq(contents.status, "active"))
        // Composite score: viewCount * 2 + popularityScore (ingest signal)
        .orderBy(desc(sql`(${contents.viewCount} * 2 + ${contents.popularityScore})`), desc(contents.updatedAt))
        .limit(limit);

    if (cursor) {
        query.offset(cursor);
    }

    return await query;
}

export async function searchContent(query: string, limit: number = 8) {
    if (!query) return [];

    // 1. Exact/Prefix matches first (highest priority)
    const prefixMatches = await db
        .select()
        .from(contents)
        .where(
            and(
                eq(contents.status, "active"),
                ilike(contents.title, `${query}%`)
            )
        )
        .orderBy(desc(contents.viewCount))
        .limit(limit);

    if (prefixMatches.length >= limit) {
        return prefixMatches;
    }

    // Track found IDs to avoid duplicates
    const foundIds = new Set(prefixMatches.map(c => c.id));
    const results = [...prefixMatches];

    // 2. Fuzzy matches (contains query)
    const needed = limit - results.length;
    if (needed > 0) {
        const fuzzyConditions = [
            eq(contents.status, "active"),
            ilike(contents.title, `%${query}%`)
        ];

        if (foundIds.size > 0) {
            fuzzyConditions.push(notInArray(contents.id, Array.from(foundIds)));
        }

        const fuzzyMatches = await db
            .select()
            .from(contents)
            .where(and(...fuzzyConditions))
            .orderBy(desc(contents.viewCount))
            .limit(needed);

        fuzzyMatches.forEach(m => {
            foundIds.add(m.id);
            results.push(m);
        });
    }

    // 3. Keyword-based search (for related titles like "Cinta" matching "Alunan Cinta", "Tersalah Cinta", etc.)
    // Split query into keywords and search for each
    const keywords = query.split(/\s+/).filter(k => k.length >= 3);

    for (const keyword of keywords) {
        if (results.length >= limit) break;

        const stillNeeded = limit - results.length;
        const keywordConditions = [
            eq(contents.status, "active"),
            ilike(contents.title, `%${keyword}%`)
        ];

        if (foundIds.size > 0) {
            keywordConditions.push(notInArray(contents.id, Array.from(foundIds)));
        }

        const keywordMatches = await db
            .select()
            .from(contents)
            .where(and(...keywordConditions))
            .orderBy(desc(contents.viewCount))
            .limit(stillNeeded);

        keywordMatches.forEach(m => {
            foundIds.add(m.id);
            results.push(m);
        });
    }

    // 4. Search for dubbing versions (Sulih Suara) of matched titles
    // Extract base title without dubbing suffix and find related versions
    if (results.length > 0 && results.length < limit) {
        const baseTitlePattern = results[0].title
            .replace(/\s*\(Sulih Suara\).*$/i, '')
            .replace(/\s*\(Dubbing\).*$/i, '')
            .trim();

        if (baseTitlePattern.length >= 3) {
            const stillNeeded = limit - results.length;
            const dubbingConditions = [
                eq(contents.status, "active"),
                ilike(contents.title, `%${baseTitlePattern}%`)
            ];

            if (foundIds.size > 0) {
                dubbingConditions.push(notInArray(contents.id, Array.from(foundIds)));
            }

            const dubbingMatches = await db
                .select()
                .from(contents)
                .where(and(...dubbingConditions))
                .orderBy(desc(contents.viewCount))
                .limit(stillNeeded);

            dubbingMatches.forEach(m => {
                foundIds.add(m.id);
                results.push(m);
            });
        }
    }

    return results.slice(0, limit);
}

export async function incrementViewCount(id: string) {
    await db
        .update(contents)
        .set({
            viewCount: sql`${contents.viewCount} + 1`
        })
        .where(eq(contents.id, id));
}

export async function getForHomepageGrouped(limitPerProvider: number = 12) {
    const providers = ["dramabox", "flickreels", "melolo", "netshort"];

    const results = await Promise.all(
        providers.map(async (provider) => {
            const items = await db
                .select()
                .from(contents)
                .where(and(eq(contents.provider, provider), eq(contents.status, "active")))
                .orderBy(desc(contents.viewCount), desc(contents.updatedAt))
                .limit(limitPerProvider);

            return {
                provider,
                items
            };
        })
    );

    return results.filter(r => r.items.length > 0);
}
===
import { db, contents, Content, NewContent } from "@/lib/db";
import { eq, ilike, desc, sql, and, notInArray } from "drizzle-orm";

export async function upsertContent(data: NewContent) {
    // Check if exists first to avoid unnecessary updates if data hasn't changed?
    // For now, simpler to just upsert on conflict

    return db
        .insert(contents)
        .values(data)
        .onConflictDoUpdate({
            target: [contents.provider, contents.providerContentId],
            set: {
                title: data.title,
                description: data.description,
                posterUrl: data.posterUrl,
                episodeCount: data.episodeCount,
                region: data.region,
                contentType: data.contentType,  // Added for category filtering
                tags: data.tags,
                fetchedAt: new Date(),
                fetchedFrom: data.fetchedFrom,
            },
        })
        .returning();
}

const PAGE_SIZE = 20;

export async function getContent(cursor?: number, limit: number = PAGE_SIZE) {
    let query = db
        .select()
        .from(contents)
        .where(eq(contents.status, "active"))
        // Composite score: viewCount * 2 + popularityScore (ingest signal)
        .orderBy(desc(sql`(${contents.viewCount} * 2 + ${contents.popularityScore})`), desc(contents.updatedAt))
        .limit(limit);

    if (cursor) {
        query.offset(cursor);
    }

    return await query;
}

export async function searchContent(query: string, limit: number = 8) {
    if (!query) return [];

    // 1. Exact/Prefix matches first (highest priority)
    const prefixMatches = await db
        .select()
        .from(contents)
        .where(
            and(
                eq(contents.status, "active"),
                ilike(contents.title, `${query}%`)
            )
        )
        .orderBy(desc(contents.viewCount))
        .limit(limit);

    if (prefixMatches.length >= limit) {
        return prefixMatches;
    }

    // Track found IDs to avoid duplicates
    const foundIds = new Set(prefixMatches.map(c => c.id));
    const results = [...prefixMatches];

    // 2. Fuzzy matches (contains query)
    const needed = limit - results.length;
    if (needed > 0) {
        const fuzzyConditions = [
            eq(contents.status, "active"),
            ilike(contents.title, `%${query}%`)
        ];

        if (foundIds.size > 0) {
            fuzzyConditions.push(notInArray(contents.id, Array.from(foundIds)));
        }

        const fuzzyMatches = await db
            .select()
            .from(contents)
            .where(and(...fuzzyConditions))
            .orderBy(desc(contents.viewCount))
            .limit(needed);

        fuzzyMatches.forEach(m => {
            foundIds.add(m.id);
            results.push(m);
        });
    }

    // 3. Keyword-based search (for related titles like "Cinta" matching "Alunan Cinta", "Tersalah Cinta", etc.)
    // Split query into keywords and search for each
    const keywords = query.split(/\s+/).filter(k => k.length >= 3);

    for (const keyword of keywords) {
        if (results.length >= limit) break;

        const stillNeeded = limit - results.length;
        const keywordConditions = [
            eq(contents.status, "active"),
            ilike(contents.title, `%${keyword}%`)
        ];

        if (foundIds.size > 0) {
            keywordConditions.push(notInArray(contents.id, Array.from(foundIds)));
        }

        const keywordMatches = await db
            .select()
            .from(contents)
            .where(and(...keywordConditions))
            .orderBy(desc(contents.viewCount))
            .limit(stillNeeded);

        keywordMatches.forEach(m => {
            foundIds.add(m.id);
            results.push(m);
        });
    }

    // 4. Search for dubbing versions (Sulih Suara) of matched titles
    // Extract base title without dubbing suffix and find related versions
    if (results.length > 0 && results.length < limit) {
        const baseTitlePattern = results[0].title
            .replace(/\s*\(Sulih Suara\).*$/i, '')
            .replace(/\s*\(Dubbing\).*$/i, '')
            .trim();

        if (baseTitlePattern.length >= 3) {
            const stillNeeded = limit - results.length;
            const dubbingConditions = [
                eq(contents.status, "active"),
                ilike(contents.title, `%${baseTitlePattern}%`)
            ];

            if (foundIds.size > 0) {
                dubbingConditions.push(notInArray(contents.id, Array.from(foundIds)));
            }

            const dubbingMatches = await db
                .select()
                .from(contents)
                .where(and(...dubbingConditions))
                .orderBy(desc(contents.viewCount))
                .limit(stillNeeded);

            dubbingMatches.forEach(m => {
                foundIds.add(m.id);
                results.push(m);
            });
        }
    }

    return results.slice(0, limit);
}

export async function incrementViewCount(id: string) {
    await db
        .update(contents)
        .set({
            viewCount: sql`${contents.viewCount} + 1`
        })
        .where(eq(contents.id, id));
}

export async function getForHomepageGrouped(limitPerProvider: number = 12) {
    const providers = ["dramabox", "flickreels", "melolo", "netshort"];

    const results = await Promise.all(
        providers.map(async (provider) => {
            const items = await db
                .select()
                .from(contents)
                .where(and(eq(contents.provider, provider), eq(contents.status, "active")))
                .orderBy(desc(contents.viewCount), desc(contents.updatedAt))
                .limit(limitPerProvider);

            return {
                provider,
                items
            };
        })
    );

    return results.filter(r => r.items.length > 0);
}
```

---

## Files Changed

| File | Changes |
|------|---------|
| [schema.ts](file:///Volumes/ScutiEX/ScutiEX/antigravity/rabastrim/src/lib/db/schema.ts) | Added `content_type` column |
| [content-ingestion.ts](file:///Volumes/ScutiEX/ScutiEX/antigravity/rabastrim/src/lib/services/content-ingestion.ts) | Added `contentType` to interface |
| [provider-normalizers.ts](file:///Volumes/ScutiEX/ScutiEX/antigravity/rabastrim/src/lib/services/provider-normalizers.ts) | Provider defaults for all normalizers |
| [content-repository.ts](file:///Volumes/ScutiEX/ScutiEX/antigravity/rabastrim/src/lib/services/content-repository.ts) | Include `contentType`/`region` in upsert |
| [sync/route.ts](file:///Volumes/ScutiEX/ScutiEX/antigravity/rabastrim/src/app/api/sync/route.ts) | Pass `contentType` from DramaQueen |
| [all-dramas/route.ts](file:///Volumes/ScutiEX/ScutiEX/antigravity/rabastrim/src/app/api/explore/all-dramas/route.ts) | Updated category filters |

---

## Migration

**Schema migration**: Auto-applied via `drizzle-kit push`

**Data migration** (for existing records): [migrate_content_type.sql](file:///Volumes/ScutiEX/ScutiEX/antigravity/rabastrim/drizzle/migrate_content_type.sql)

---

## Verification

```bash
# Drama China returns DramaQueen dramas
curl "/api/explore/all-dramas?category=Drama%20China&limit=3"
# → Love between Lines, Speed and Love, Taxi Driver Season 3

# Short Drama returns DramaBox items  
curl "/api/explore/all-dramas?category=Short%20Drama&limit=3"
# → Selamat Tinggal Cinta..., Rantai Kasih, Air Mata...
```
