import { NextRequest, NextResponse } from "next/server";
import { db, watchHistory } from "@/lib/db";
import { getCurrentUser } from "@/lib/actions/user";
import { eq, and } from "drizzle-orm";

interface HistoryItem {
    dramaId: string;
    dramaTitle: string;
    dramaCover: string;
    provider: string;
    episodeNumber?: number;
    lastPosition?: number;
    duration?: number;
    progress?: number;
    updatedAt?: number;
}

/**
 * POST /api/history/bulk
 * Bulk insert/update history from localStorage to database
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        const body = await request.json();
        const items: HistoryItem[] = body.items;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "No items provided" }, { status: 400 });
        }

        // Limit to prevent abuse
        const maxItems = 200;
        const itemsToProcess = items.slice(0, maxItems);

        let inserted = 0;
        let updated = 0;
        let skipped = 0;

        for (const item of itemsToProcess) {
            if (!item.dramaId || !item.provider) {
                skipped++;
                continue;
            }

            try {
                // Check if exists
                const existing = await db
                    .select()
                    .from(watchHistory)
                    .where(
                        and(
                            eq(watchHistory.userId, user.id),
                            eq(watchHistory.dramaId, item.dramaId)
                        )
                    )
                    .limit(1);

                const progress = item.progress || (
                    item.duration && item.duration > 0
                        ? Math.round(((item.lastPosition || 0) / item.duration) * 100)
                        : 0
                );

                if (existing.length > 0) {
                    // Only update if local data is newer
                    const existingTime = existing[0].updatedAt?.getTime() || 0;
                    const localTime = item.updatedAt || Date.now();

                    if (localTime > existingTime) {
                        await db
                            .update(watchHistory)
                            .set({
                                episodeNumber: item.episodeNumber,
                                lastPosition: item.lastPosition || 0,
                                duration: item.duration || 0,
                                progress,
                                updatedAt: new Date(localTime),
                                watchedAt: new Date(localTime),
                            })
                            .where(eq(watchHistory.id, existing[0].id));
                        updated++;
                    } else {
                        skipped++;
                    }
                } else {
                    // Insert new
                    await db.insert(watchHistory).values({
                        userId: user.id,
                        dramaId: item.dramaId,
                        dramaTitle: item.dramaTitle || "Untitled",
                        dramaCover: item.dramaCover || "",
                        provider: item.provider,
                        episodeNumber: item.episodeNumber,
                        lastPosition: item.lastPosition || 0,
                        duration: item.duration || 0,
                        progress,
                        watchedAt: new Date(item.updatedAt || Date.now()),
                    });
                    inserted++;
                }
            } catch (error) {
                console.error(`[BulkSync] Failed for ${item.dramaId}:`, error);
                skipped++;
            }
        }

        console.log(`[BulkSync] Inserted: ${inserted}, Updated: ${updated}, Skipped: ${skipped}`);

        return NextResponse.json({
            success: true,
            inserted,
            updated,
            skipped,
            total: itemsToProcess.length,
        });
    } catch (error) {
        console.error("Bulk history sync error:", error);
        return NextResponse.json(
            { error: "Failed to bulk sync history" },
            { status: 500 }
        );
    }
}
