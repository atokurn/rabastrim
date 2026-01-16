import { NextRequest, NextResponse } from "next/server";
import { ContentIngestionService, type ContentInput } from "@/lib/services/content-ingestion";
import { DramaBoxApi } from "@/lib/api/dramabox";
import { FlickReelsApi } from "@/lib/api/flickreels";
import { MeloloApi } from "@/lib/api/melolo";
import { DramaQueenApi } from "@/lib/api/dramaqueen";
import { adaptDramaBox, adaptFlickReels, adaptMelolo, adaptDramaQueen } from "@/lib/services/provider-adapters";
import { validateApiKey } from "@/lib/auth/api-utils";
import type { ContentProvider } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/sync?type=trending&provider=dramabox
 * 
 * Manual sync endpoint for triggering content ingestion.
 * Can be called by cron jobs or manually.
 * 
 * Query params:
 * - type: trending | home | foryou (required)
 * - provider: dramabox | flickreels | melolo | dramaqueen (optional, syncs all if not specified)
 */
export async function POST(request: NextRequest) {
    // Validate API key
    if (!validateApiKey(request)) {
        return NextResponse.json(
            { error: "Unauthorized. Invalid or missing API key." },
            { status: 401 }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const syncType = searchParams.get("type") as "trending" | "home" | "foryou";
    const provider = searchParams.get("provider") as ContentProvider | null;

    if (!syncType || !["trending", "home", "foryou", "list"].includes(syncType)) {
        return NextResponse.json(
            { error: "Invalid sync type. Use: trending, home, foryou, or list" },
            { status: 400 }
        );
    }

    const results: Record<string, { processed: number; created: number; updated: number }> = {};

    try {
        // Sync all supported providers
        const providers: ContentProvider[] = provider
            ? [provider]
            : ["dramabox", "flickreels", "melolo", "dramaqueen"];

        for (const p of providers) {
            try {
                console.log(`!!! [Sync] Processing provider: ${p}, type: ${syncType} !!!`);
                let items: ContentInput[] = [];

                switch (p) {
                    case "dramabox":
                        if (syncType === "trending") {
                            const data = await DramaBoxApi.getTrending();
                            items = data.map(adaptDramaBox);
                        } else if (syncType === "home") {
                            const data = await DramaBoxApi.getHome();
                            items = data.map(adaptDramaBox);
                        } else {
                            const data = await DramaBoxApi.getForYou();
                            items = data.map(adaptDramaBox);
                        }
                        break;

                    case "flickreels":
                        if (syncType === "trending" || syncType === "home") {
                            const data = await FlickReelsApi.getHome();
                            items = data.map(adaptFlickReels);
                        } else {
                            const data = await FlickReelsApi.getForYou();
                            items = data.map(adaptFlickReels);
                        }
                        break;

                    case "melolo":
                        if (syncType === "trending") {
                            const data = await MeloloApi.getTrending();
                            items = data.map(adaptMelolo);
                        } else {
                            const data = await MeloloApi.getLatest();
                            items = data.map(adaptMelolo);
                        }
                        break;

                    case "dramaqueen":
                        // Use getList which returns complete data including negara/tahun_rilis
                        if (syncType !== "foryou") {
                            const data = await DramaQueenApi.getList(51, 100);
                            items = data.map(item => adaptDramaQueen(item, "drama"));
                        } else {
                            const data = await DramaQueenApi.getLatest();
                            items = data.map(item => adaptDramaQueen(item, "drama"));
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
 * GET /api/sync?type=trending&key=YOUR_SECRET
 * 
 * Performs content sync via GET request (for cron-job.org compatibility).
 * Requires API key via ?key= query parameter.
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const syncType = searchParams.get("type") as "trending" | "home" | "foryou" | null;
    const provider = searchParams.get("provider") as ContentProvider | null;

    // If no type, return usage info (no auth required)
    if (!syncType) {
        return NextResponse.json({
            message: "Content sync endpoint",
            usage: "GET /api/sync?type=trending&key=YOUR_CRON_SECRET",
            types: ["trending", "home", "foryou"],
            providers: ["dramabox", "flickreels", "melolo", "dramaqueen"],
            note: "Set CRON_SECRET env variable and pass it as ?key= parameter",
        });
    }

    // Validate API key when triggering sync
    if (!validateApiKey(request)) {
        return NextResponse.json(
            { error: "Unauthorized. Invalid or missing API key." },
            { status: 401 }
        );
    }

    if (!["trending", "home", "foryou"].includes(syncType)) {
        return NextResponse.json(
            { error: "Invalid sync type. Use: trending, home, or foryou" },
            { status: 400 }
        );
    }

    const results: Record<string, { processed: number; created: number; updated: number }> = {};

    try {
        const providers: ContentProvider[] = provider
            ? [provider]
            : ["dramabox", "flickreels", "melolo", "dramaqueen"];

        for (const p of providers) {
            try {
                let items: ContentInput[] = [];

                switch (p) {
                    case "dramabox":
                        if (syncType === "trending") {
                            const data = await DramaBoxApi.getTrending();
                            items = data.map(adaptDramaBox);
                        } else if (syncType === "home") {
                            const data = await DramaBoxApi.getHome();
                            items = data.map(adaptDramaBox);
                        } else {
                            const data = await DramaBoxApi.getForYou();
                            items = data.map(adaptDramaBox);
                        }
                        break;

                    case "flickreels":
                        if (syncType === "trending" || syncType === "home") {
                            const data = await FlickReelsApi.getHome();
                            items = data.map(adaptFlickReels);
                        } else {
                            const data = await FlickReelsApi.getForYou();
                            items = data.map(adaptFlickReels);
                        }
                        break;

                    case "melolo":
                        if (syncType === "trending") {
                            const data = await MeloloApi.getTrending();
                            items = data.map(adaptMelolo);
                        } else {
                            const data = await MeloloApi.getLatest();
                            items = data.map(adaptMelolo);
                        }
                        break;

                    case "dramaqueen":
                        if (syncType === "trending") {
                            const data = await DramaQueenApi.getTrending();
                            items = data.map(item => adaptDramaQueen(item, "drama"));
                        } else if (syncType === "home") {
                            const data = await DramaQueenApi.getHome();
                            items = data.map(item => adaptDramaQueen(item, "drama"));
                        } else {
                            const data = await DramaQueenApi.getLatest();
                            items = data.map(item => adaptDramaQueen(item, "drama"));
                        }
                        break;
                }

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
