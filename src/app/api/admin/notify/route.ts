import { NextRequest, NextResponse } from "next/server";
import { db, contents, telegramNotifications } from "@/lib/db";
import { sendDramaNotification } from "@/lib/services/telegram-service";
import { eq, and } from "drizzle-orm";
import { validateApiKey, authErrorResponse } from "@/lib/auth/api-utils";

export const dynamic = "force-dynamic";

/**
 * Admin Endpoint: Test Telegram Notification
 * 
 * POST /api/admin/notify
 * Body: { contentId: string } OR { provider: string, providerContentId: string }
 * 
 * Sends a notification for a specific drama (for testing purposes)
 */

export async function POST(request: NextRequest) {
    if (!validateApiKey(request)) {
        return NextResponse.json(authErrorResponse(), { status: 401 });
    }

    try {
        const body = await request.json();
        const { contentId, provider, providerContentId } = body;

        let drama;

        if (contentId) {
            // Find by content ID
            const result = await db
                .select()
                .from(contents)
                .where(eq(contents.id, contentId))
                .limit(1);

            drama = result[0];
        } else if (provider && providerContentId) {
            // Find by provider + provider content ID
            const result = await db
                .select()
                .from(contents)
                .where(and(
                    eq(contents.provider, provider),
                    eq(contents.providerContentId, providerContentId)
                ))
                .limit(1);

            drama = result[0];
        } else {
            return NextResponse.json({
                error: "Must provide either contentId OR both provider and providerContentId"
            }, { status: 400 });
        }

        if (!drama) {
            return NextResponse.json({ error: "Content not found" }, { status: 404 });
        }

        // Check if already notified
        const existing = await db
            .select()
            .from(telegramNotifications)
            .where(eq(telegramNotifications.contentId, drama.id))
            .limit(1);

        if (existing.length > 0) {
            return NextResponse.json({
                success: false,
                error: "Already notified",
                notification: existing[0],
            });
        }

        // Send notification
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

        // Record the notification
        await db.insert(telegramNotifications).values({
            contentId: drama.id,
            provider: drama.provider,
            providerContentId: drama.providerContentId,
            messageId: result.messageId || null,
            status: result.success ? "sent" : "failed",
            error: result.error || null,
        });

        return NextResponse.json({
            success: result.success,
            drama: {
                id: drama.id,
                title: drama.title,
                provider: drama.provider,
            },
            telegram: result,
        });

    } catch (error) {
        console.error("[Admin Notify] Error:", error);
        return NextResponse.json({
            error: String(error),
        }, { status: 500 });
    }
}

// GET: Preview notification without sending
export async function GET(request: NextRequest) {
    if (!validateApiKey(request)) {
        return NextResponse.json(authErrorResponse(), { status: 401 });
    }

    const provider = request.nextUrl.searchParams.get("provider");
    const providerContentId = request.nextUrl.searchParams.get("providerContentId");

    if (!provider || !providerContentId) {
        return NextResponse.json({
            error: "Provide provider and providerContentId query params"
        }, { status: 400 });
    }

    const result = await db
        .select()
        .from(contents)
        .where(and(
            eq(contents.provider, provider),
            eq(contents.providerContentId, providerContentId)
        ))
        .limit(1);

    if (!result[0]) {
        return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const drama = result[0];
    const { formatDramaCaption } = await import("@/lib/services/telegram-service");

    const caption = formatDramaCaption({
        id: drama.id,
        provider: drama.provider,
        providerContentId: drama.providerContentId,
        title: drama.title,
        posterUrl: drama.posterUrl,
        episodeCount: drama.episodeCount,
        tags: drama.tags,
        contentType: drama.contentType,
    });

    return NextResponse.json({
        drama: {
            id: drama.id,
            title: drama.title,
            provider: drama.provider,
            posterUrl: drama.posterUrl,
            episodeCount: drama.episodeCount,
        },
        preview: {
            caption,
            captionLength: caption.length,
        },
    });
}
