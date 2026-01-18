/**
 * Admin Cleanup API
 * 
 * Endpoint for cleaning up bad data from database
 * 
 * DELETE /api/admin/cleanup
 * Query params: 
 *   - provider: Provider to clean (required)
 *   - type: Type of cleanup - "unknown_title" | "no_cover" (required)
 */

import { NextRequest, NextResponse } from "next/server";
import { db, contents, contentLanguages } from "@/lib/db";
import { eq, and, or, sql } from "drizzle-orm";

// Validate admin access
function validateAuth(request: NextRequest): boolean {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const cronSecret = process.env.CRON_SECRET;

    return !!(cronSecret && token === cronSecret);
}

export async function DELETE(request: NextRequest) {
    // Validate auth
    if (!validateAuth(request)) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider");
    const cleanupType = searchParams.get("type");

    if (!provider) {
        return NextResponse.json(
            { success: false, error: "Missing provider parameter" },
            { status: 400 }
        );
    }

    try {
        // Type: all - Delete ALL content for a provider (for complete resync)
        if (cleanupType === "all") {
            const allContent = await db
                .select({ id: contents.id })
                .from(contents)
                .where(eq(contents.provider, provider));

            const allIds = allContent.map(c => c.id);

            if (allIds.length === 0) {
                return NextResponse.json({
                    success: true,
                    message: `No content found for provider: ${provider}`,
                    deleted: 0
                });
            }

            console.log(`[Cleanup] Deleting ALL ${allIds.length} items for ${provider}`);

            // Delete language associations first
            for (const id of allIds) {
                await db.delete(contentLanguages).where(eq(contentLanguages.contentId, id));
            }

            // Delete the content
            for (const id of allIds) {
                await db.delete(contents).where(eq(contents.id, id));
            }

            return NextResponse.json({
                success: true,
                message: `Deleted ALL ${allIds.length} content items from ${provider}`,
                deleted: allIds.length
            });
        }

        if (cleanupType === "unknown_title") {
            // Find and delete content with empty/unknown titles
            const badContent = await db
                .select({ id: contents.id })
                .from(contents)
                .where(
                    and(
                        eq(contents.provider, provider),
                        or(
                            eq(contents.title, "Unknown Title"),
                            eq(contents.title, ""),
                            sql`${contents.title} IS NULL`
                        )
                    )
                );

            const badIds = badContent.map(c => c.id);

            if (badIds.length === 0) {
                return NextResponse.json({
                    success: true,
                    message: `No bad content found for provider: ${provider}`,
                    deleted: 0
                });
            }

            // Delete language associations first (foreign key constraint)
            for (const id of badIds) {
                await db.delete(contentLanguages).where(eq(contentLanguages.contentId, id));
            }

            // Delete the content
            for (const id of badIds) {
                await db.delete(contents).where(eq(contents.id, id));
            }

            return NextResponse.json({
                success: true,
                message: `Deleted ${badIds.length} bad content items from ${provider}`,
                deleted: badIds.length,
                ids: badIds
            });
        }

        if (cleanupType === "no_cover") {
            // Find and delete content without cover images
            const badContent = await db
                .select({ id: contents.id, title: contents.title })
                .from(contents)
                .where(
                    and(
                        eq(contents.provider, provider),
                        or(
                            eq(contents.posterUrl, ""),
                            sql`${contents.posterUrl} IS NULL`
                        )
                    )
                );

            const badIds = badContent.map(c => c.id);

            if (badIds.length === 0) {
                return NextResponse.json({
                    success: true,
                    message: `No content without cover found for provider: ${provider}`,
                    deleted: 0
                });
            }

            console.log(`[Cleanup] Found ${badIds.length} items without cover for ${provider}`);

            // Delete language associations first (foreign key constraint)
            for (const id of badIds) {
                await db.delete(contentLanguages).where(eq(contentLanguages.contentId, id));
            }

            // Delete the content
            for (const id of badIds) {
                await db.delete(contents).where(eq(contents.id, id));
            }

            return NextResponse.json({
                success: true,
                message: `Deleted ${badIds.length} content items without cover from ${provider}`,
                deleted: badIds.length,
                sample: badContent.slice(0, 10).map(c => c.title)
            });
        }

        if (cleanupType === "no_language") {
            // Find content WITHOUT any language associations (legacy content)
            // These were synced before multi-language feature was implemented
            const allProviderContent = await db
                .select({ id: contents.id, title: contents.title, providerContentId: contents.providerContentId })
                .from(contents)
                .where(eq(contents.provider, provider));

            // Get content IDs that HAVE language associations
            const contentWithLanguages = await db
                .select({ contentId: contentLanguages.contentId })
                .from(contentLanguages)
                .where(eq(contentLanguages.provider, provider));

            const idsWithLanguage = new Set(contentWithLanguages.map(c => c.contentId));

            // Filter to content WITHOUT language associations
            const legacyContent = allProviderContent.filter(c => !idsWithLanguage.has(c.id));

            if (legacyContent.length === 0) {
                return NextResponse.json({
                    success: true,
                    message: `No legacy content (without language) found for provider: ${provider}`,
                    deleted: 0
                });
            }

            console.log(`[Cleanup] Found ${legacyContent.length} legacy items without language for ${provider}`);

            // Delete the content (cascade will handle language associations if any)
            const legacyIds = legacyContent.map(c => c.id);
            for (const id of legacyIds) {
                await db.delete(contents).where(eq(contents.id, id));
            }

            return NextResponse.json({
                success: true,
                message: `Deleted ${legacyIds.length} legacy content items (no language) from ${provider}`,
                deleted: legacyIds.length,
                sample: legacyContent.slice(0, 20).map(c => ({ id: c.providerContentId, title: c.title }))
            });
        }

        return NextResponse.json(
            { success: false, error: `Unknown cleanup type: ${cleanupType}. Supported: unknown_title, no_cover, no_language` },
            { status: 400 }
        );

    } catch (error) {
        console.error("[Cleanup] Error:", error);
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        );
    }
}

