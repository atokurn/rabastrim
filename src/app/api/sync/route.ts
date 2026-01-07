import { NextRequest, NextResponse } from "next/server";
import { ContentIngestionService, type ContentInput } from "@/lib/services/content-ingestion";
import { DramaBoxApi } from "@/lib/api/dramabox";
import { FlickReelsApi } from "@/lib/api/flickreels";
import { MeloloApi } from "@/lib/api/melolo";
import type { ContentProvider } from "@/lib/db";

export const dynamic = "force-dynamic";

// Normalize provider data to ContentInput format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDramaBox(item: any): ContentInput {
    return {
        bookId: item.bookId || item.book_id || "",
        title: item.bookName || item.book_name || item.title || "Untitled",
        description: item.introduction || item.desc,
        poster: item.coverWap || item.cover,
        episodeCount: item.chapterCount,
        tags: item.tags,
        isVip: item.isVip,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeFlickReels(item: any): ContentInput {
    return {
        bookId: String(item.playlet_id || ""),
        title: item.playlet_title || item.title || "Untitled",
        description: item.introduce,
        poster: item.cover || item.process_cover,
        episodeCount: item.chapter_num || item.upload_num,
        tags: item.tag_list?.map((t: { tag_name: string }) => t.tag_name),
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMelolo(item: any): ContentInput {
    // Melolo trending/latest API uses: abstract, book_id, book_name, thumb_url, serial_count
    const rawImage = item.thumb_url || item.cover || "";
    const poster = rawImage && rawImage.includes(".heic")
        ? `https://wsrv.nl/?url=${encodeURIComponent(rawImage)}&output=webp&q=85`
        : rawImage;

    return {
        bookId: item.book_id || item.id || "",
        title: item.book_name || item.title || "Untitled",
        description: item.abstract || item.introduction || null,
        poster,
        episodeCount: item.serial_count || null,
    };
}

/**
 * POST /api/sync?type=trending&provider=dramabox
 * 
 * Manual sync endpoint for triggering content ingestion.
 * Can be called by cron jobs or manually.
 * 
 * Query params:
 * - type: trending | home | foryou (required)
 * - provider: dramabox | flickreels | melolo (optional, syncs all if not specified)
 */
export async function POST(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const syncType = searchParams.get("type") as "trending" | "home" | "foryou";
    const provider = searchParams.get("provider") as ContentProvider | null;

    if (!syncType || !["trending", "home", "foryou"].includes(syncType)) {
        return NextResponse.json(
            { error: "Invalid sync type. Use: trending, home, or foryou" },
            { status: 400 }
        );
    }

    const results: Record<string, { processed: number; created: number; updated: number }> = {};

    try {
        // Only sync dramabox, flickreels, melolo (removed netshort)
        const providers: ContentProvider[] = provider
            ? [provider]
            : ["dramabox", "flickreels", "melolo"];

        for (const p of providers) {
            try {
                let items: ContentInput[] = [];

                switch (p) {
                    case "dramabox":
                        if (syncType === "trending") {
                            const data = await DramaBoxApi.getTrending();
                            items = data.map(normalizeDramaBox);
                        } else if (syncType === "home") {
                            const data = await DramaBoxApi.getHome();
                            items = data.map(normalizeDramaBox);
                        } else {
                            const data = await DramaBoxApi.getForYou();
                            items = data.map(normalizeDramaBox);
                        }
                        break;

                    case "flickreels":
                        if (syncType === "trending" || syncType === "home") {
                            const data = await FlickReelsApi.getHome();
                            items = data.map(normalizeFlickReels);
                        } else {
                            const data = await FlickReelsApi.getForYou();
                            items = data.map(normalizeFlickReels);
                        }
                        break;

                    case "melolo":
                        if (syncType === "trending") {
                            const data = await MeloloApi.getTrending();
                            items = data.map(normalizeMelolo);
                        } else {
                            const data = await MeloloApi.getLatest();
                            items = data.map(normalizeMelolo);
                        }
                        break;
                }

                // Filter out items without valid IDs
                items = items.filter(item => item.bookId);

                if (items.length > 0) {
                    const result = syncType === "trending"
                        ? await ContentIngestionService.syncTrending(p, items)
                        : await ContentIngestionService.syncHome(p, items, syncType);

                    results[p] = result;
                }
            } catch (error) {
                console.error(`[Sync] Failed to sync ${p}:`, error);
                results[p] = { processed: 0, created: 0, updated: 0 };
            }
        }

        return NextResponse.json({
            success: true,
            syncType,
            results,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Sync] Error:", error);
        return NextResponse.json(
            { error: "Sync failed", details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * GET /api/sync
 * Returns sync status and instructions
 */
export async function GET() {
    return NextResponse.json({
        message: "Content sync endpoint",
        usage: "POST /api/sync?type=trending&provider=dramabox",
        types: ["trending", "home", "foryou"],
        providers: ["dramabox", "flickreels", "melolo"],
    });
}
