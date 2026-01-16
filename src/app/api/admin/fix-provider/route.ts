import { NextRequest, NextResponse } from "next/server";
import { db, contents } from "@/lib/db";
import { eq, sql, inArray } from "drizzle-orm";
import { validateApiKey, authErrorResponse } from "@/lib/auth/api-utils";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/fix-provider
 * 
 * Fix provider tagging issue where FlickReels content was incorrectly labeled as "netshort".
 * This endpoint identifies FlickReels content (by providerContentId pattern) and updates the provider field.
 * Handles unique constraint by deleting duplicates first.
 */
export async function POST(request: NextRequest) {
    // Validate API key using centralized auth
    if (!validateApiKey(request)) {
        return NextResponse.json(authErrorResponse(), { status: 401 });
    }

    try {
        // Step 1: Get all netshort content IDs
        const netshortContent = await db
            .select({ id: contents.id, providerContentId: contents.providerContentId })
            .from(contents)
            .where(eq(contents.provider, "netshort"));

        console.log(`[Fix Provider] Found ${netshortContent.length} netshort records`);

        if (netshortContent.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No netshort records to fix",
                stats: { deleted: 0, updated: 0 }
            });
        }

        // Step 2: Get existing flickreels content IDs
        const flickreelsContentIds = await db
            .select({ providerContentId: contents.providerContentId })
            .from(contents)
            .where(eq(contents.provider, "flickreels"));

        const existingFlickreelsIds = new Set(flickreelsContentIds.map(c => c.providerContentId));

        // Step 3: Separate netshort into duplicates (already exist in flickreels) and unique
        const duplicateIds: string[] = [];
        const uniqueIds: string[] = [];

        for (const item of netshortContent) {
            if (existingFlickreelsIds.has(item.providerContentId)) {
                duplicateIds.push(item.id);
            } else {
                uniqueIds.push(item.id);
            }
        }

        console.log(`[Fix Provider] Duplicates to delete: ${duplicateIds.length}, Unique to update: ${uniqueIds.length}`);

        let deleted = 0;
        let updated = 0;

        // Step 4: Delete duplicates (netshort entries that already exist as flickreels)
        if (duplicateIds.length > 0) {
            await db
                .delete(contents)
                .where(inArray(contents.id, duplicateIds));
            deleted = duplicateIds.length;
            console.log(`[Fix Provider] Deleted ${deleted} duplicate records`);
        }

        // Step 5: Update unique netshort → flickreels
        if (uniqueIds.length > 0) {
            await db
                .update(contents)
                .set({
                    provider: "flickreels",
                    updatedAt: new Date()
                })
                .where(inArray(contents.id, uniqueIds));
            updated = uniqueIds.length;
            console.log(`[Fix Provider] Updated ${updated} records from netshort to flickreels`);
        }

        return NextResponse.json({
            success: true,
            message: `Fixed provider tagging. Deleted ${deleted} duplicates, updated ${updated} records.`,
            stats: { deleted, updated, total: deleted + updated }
        });
    } catch (error) {
        console.error("[Fix Provider] Error:", error);
        return NextResponse.json(
            { error: "Fix failed", details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/fix-provider
 * 
 * Check current provider distribution (admin only)
 */
export async function GET(request: NextRequest) {
    // Security: Validate API key for stats endpoint
    if (!validateApiKey(request)) {
        return NextResponse.json(authErrorResponse(), { status: 401 });
    }

    try {
        const stats = await db
            .select({
                provider: contents.provider,
                count: sql<number>`count(*)`
            })
            .from(contents)
            .groupBy(contents.provider);

        return NextResponse.json({
            message: "Provider distribution stats",
            stats,
            note: "Call POST to fix netshort → flickreels"
        });
    } catch (error) {
        console.error("[Fix Provider] Error:", error);
        return NextResponse.json(
            { error: "Stats failed", details: String(error) },
            { status: 500 }
        );
    }
}
