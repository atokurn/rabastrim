/**
 * Centralized API Input Validation Schemas
 * 
 * Security: All user inputs are validated with Zod to prevent:
 * - Type confusion attacks
 * - Excessively long strings (DB bloat)
 * - Invalid data formats
 */

import { z } from "zod";

// ============================================
// COMMON SCHEMAS
// ============================================

/**
 * Provider enum - only allow known content providers
 */
export const ProviderSchema = z.enum([
    "dramaqueen",
    "dramabox",
    "flickreels",
    "melolo",
    "sapimu",
    "shortmax",
]);

export type Provider = z.infer<typeof ProviderSchema>;

/**
 * Pagination query parameters
 */
export const PaginationSchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

// ============================================
// FAVORITES SCHEMAS
// ============================================

export const ToggleFavoriteSchema = z.object({
    dramaId: z.string().min(1).max(100),
    dramaTitle: z.string().max(500).optional().default(""),
    dramaCover: z.string().max(2000).optional().default(""),
    provider: ProviderSchema,
    description: z.string().max(5000).optional(),
});

export type ToggleFavoriteInput = z.infer<typeof ToggleFavoriteSchema>;

// ============================================
// LIKES SCHEMAS
// ============================================

export const ToggleLikeSchema = z.object({
    dramaId: z.string().min(1).max(100),
    dramaTitle: z.string().max(500).optional().default(""),
    dramaCover: z.string().max(2000).optional().default(""),
    provider: ProviderSchema,
    episodeNumber: z.coerce.number().int().min(0).max(10000),
});

export type ToggleLikeInput = z.infer<typeof ToggleLikeSchema>;

// ============================================
// PROGRESS / WATCH HISTORY SCHEMAS
// ============================================

export const UpdateProgressSchema = z.object({
    dramaId: z.string().min(1).max(100),
    dramaTitle: z.string().max(500).optional().default(""),
    dramaCover: z.string().max(2000).optional().default(""),
    provider: ProviderSchema,
    episodeId: z.string().max(100).optional(),
    episodeNumber: z.coerce.number().int().min(0).max(10000).optional(),
    position: z.coerce.number().min(0).max(86400).optional().default(0), // Max 24 hours
    duration: z.coerce.number().min(0).max(86400).optional().default(0),
});

export type UpdateProgressInput = z.infer<typeof UpdateProgressSchema>;

// ============================================
// CONTINUE WATCHING SCHEMAS
// ============================================

export const ContinueWatchingSchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

// ============================================
// HISTORY BULK SYNC SCHEMA
// ============================================

export const BulkHistoryItemSchema = z.object({
    dramaId: z.string().min(1).max(100),
    dramaTitle: z.string().max(500).optional(),
    dramaCover: z.string().max(2000).optional(),
    provider: ProviderSchema,
    episodeId: z.string().max(100).optional(),
    episodeNumber: z.coerce.number().int().min(0).max(10000).optional(),
    lastPosition: z.coerce.number().min(0).max(86400).optional(),
    duration: z.coerce.number().min(0).max(86400).optional(),
    progress: z.coerce.number().min(0).max(100).optional(),
    isCompleted: z.boolean().optional(),
    watchedAt: z.string().datetime().optional(),
});

export const BulkHistorySyncSchema = z.object({
    items: z.array(BulkHistoryItemSchema).max(100), // Max 100 items per sync
});

export type BulkHistoryItem = z.infer<typeof BulkHistoryItemSchema>;
export type BulkHistorySyncInput = z.infer<typeof BulkHistorySyncSchema>;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse and validate input, returning either parsed data or error response
 */
export function parseBody<T extends z.ZodType>(
    schema: T,
    data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    // Format error message
    const errors = result.error.issues.map(issue =>
        `${issue.path.join(".")}: ${issue.message}`
    ).join(", ");

    return { success: false, error: `Validation failed: ${errors}` };
}

/**
 * Parse query params from URLSearchParams
 */
export function parseQueryParams<T extends z.ZodType>(
    schema: T,
    searchParams: URLSearchParams
): { success: true; data: z.infer<T> } | { success: false; error: string } {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        params[key] = value;
    });

    return parseBody(schema, params);
}
