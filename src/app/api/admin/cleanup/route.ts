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

        return NextResponse.json(
            { success: false, error: `Unknown cleanup type: ${cleanupType}. Supported: unknown_title, no_cover` },
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
