import { NextRequest, NextResponse } from "next/server";
import { db, contents, telegramNotifications, type Content } from "@/lib/db";
import { sendDramaNotification } from "@/lib/services/telegram-service";
import { eq, and, notInArray } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 1 minute max

/**
 * CRON: Send Telegram Notifications for New Dramas
 * 
 * Usage:
 * - GET /api/cron/telegram-notify?key=CRON_SECRET
 * - GET /api/cron/telegram-notify?key=CRON_SECRET&limit=10
 * 
 * This endpoint finds all dramas that haven't been notified yet
 * and sends them to the configured Telegram channel.
 * 
 * Cron-job.org:
 * - URL: https://your-domain.com/api/cron/telegram-notify?key=YOUR_SECRET
 * - Schedule: Every 15 minutes or as needed
 */

// Validate CRON_SECRET
function validateApiKey(request: NextRequest): boolean {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        console.warn("[Telegram Cron] CRON_SECRET not set, allowing in dev mode");
        return process.env.NODE_ENV === "development";
    }

    // Check Vercel Cron header
    const vercelCron = request.headers.get("x-vercel-cron");
    if (vercelCron === "1") return true;

    // Check Authorization header (Bearer token)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ") && authHeader.substring(7) === cronSecret) {
        return true;
    }

    // Check query parameter (for cron-job.org)
    const keyParam = request.nextUrl.searchParams.get("key");
    if (keyParam === cronSecret) return true;

    return false;
}

export async function GET(request: NextRequest) {
    // Validate auth
    if (!validateApiKey(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");

    console.log(`[Telegram Cron] Starting notification sync, limit: ${limit}`);

    // Check required env vars
    if (!process.env.TELEGRAM_CHANNEL_BOT_TOKEN) {
        return NextResponse.json({
            error: "TELEGRAM_CHANNEL_BOT_TOKEN not configured"
        }, { status: 500 });
    }

    if (!process.env.TELEGRAM_CHANNEL_ID) {
        return NextResponse.json({
            error: "TELEGRAM_CHANNEL_ID not configured"
        }, { status: 500 });
    }

    const results = {
        found: 0,
        sent: 0,
        failed: 0,
        errors: [] as string[],
    };

    try {
        // Get all content IDs that have already been notified
        const notifiedIds = await db
            .select({ contentId: telegramNotifications.contentId })
            .from(telegramNotifications);

        const notifiedIdSet = notifiedIds.map(n => n.contentId);

        console.log(`[Telegram Cron] Already notified: ${notifiedIdSet.length} dramas`);

        // Find dramas that haven't been notified yet
        let dramasToNotify: Content[];

        if (notifiedIdSet.length > 0) {
            // Use notInArray to exclude already notified dramas at SQL level
            dramasToNotify = await db
                .select()
                .from(contents)
                .where(
                    and(
                        eq(contents.status, "active"),
                        notInArray(contents.id, notifiedIdSet)
                    )
                )
                .limit(limit);
        } else {
            // No notifications sent yet, get first batch
            dramasToNotify = await db
                .select()
                .from(contents)
                .where(eq(contents.status, "active"))
                .limit(limit);
        }

        results.found = dramasToNotify.length;
        console.log(`[Telegram Cron] Found ${results.found} dramas to notify`);

        // Send notifications
        for (const drama of dramasToNotify) {
            await sendNotificationForDrama(drama, results);
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        const duration = Date.now() - startTime;

        console.log(`[Telegram Cron] Completed in ${duration}ms: ${results.sent} sent, ${results.failed} failed`);

        return NextResponse.json({
            success: true,
            results,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error("[Telegram Cron] Fatal error:", error);
        return NextResponse.json({
            success: false,
            error: String(error),
            partialResults: results,
            duration: `${Date.now() - startTime}ms`,
        }, { status: 500 });
    }
}

async function sendNotificationForDrama(
    drama: Content,
    results: { sent: number; failed: number; errors: string[] }
) {
    try {
        console.log(`[Telegram Cron] Sending notification for: ${drama.title}`);

        const result = await sendDramaNotification({
            id: drama.id,
            provider: drama.provider,
            providerContentId: drama.providerContentId,
            title: drama.title,
            posterUrl: drama.posterUrl,
            episodeCount: drama.episodeCount,
            tags: drama.tags,
            contentType: drama.contentType,
        });

        // Record the notification attempt
        await db.insert(telegramNotifications).values({
            contentId: drama.id,
            provider: drama.provider,
            providerContentId: drama.providerContentId,
            messageId: result.messageId || null,
            status: result.success ? "sent" : "failed",
            error: result.error || null,
        });

        if (result.success) {
            results.sent++;
            console.log(`[Telegram Cron] ✓ Sent: ${drama.title} (msg_id: ${result.messageId})`);
        } else {
            results.failed++;
            results.errors.push(`${drama.title}: ${result.error}`);
            console.error(`[Telegram Cron] ✗ Failed: ${drama.title} - ${result.error}`);
        }

    } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        results.errors.push(`${drama.title}: ${errorMsg}`);
        console.error(`[Telegram Cron] ✗ Error: ${drama.title}`, error);

        // Still record the failed attempt
        await db.insert(telegramNotifications).values({
            contentId: drama.id,
            provider: drama.provider,
            providerContentId: drama.providerContentId,
            status: "failed",
            error: errorMsg,
        }).catch(() => { }); // Ignore if recording fails
    }
}

// Support POST for manual triggers
export async function POST(request: NextRequest) {
    return GET(request);
}
