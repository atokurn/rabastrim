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
                    case "dramabox": {
                        // DramaBox supports 16 languages
                        // IMPORTANT: "id" (Indonesian) is synced LAST to ensure Indonesian titles are preserved
                        const languages = [
                            "en", "ja", "ko", "es", "fr", "pt", "th",
                            "ar", "de", "pl", "vi", "it", "tr", "zh-TW", "zh", "id"
                        ];

                        for (const lang of languages) {
                            try {
                                let data;
                                if (syncType === "trending" || syncType === "home") {
                                    data = await DramaBoxApi.getHome(lang);
                                } else {
                                    data = await DramaBoxApi.getRecommend(lang);
                                }

                                const langItems = data.map(adaptDramaBox);
                                const validItems = langItems.filter(item => item.bookId);

                                if (validItems.length > 0) {
                                    // Use language-aware sync to save language association
                                    await ContentIngestionService.syncContentWithLanguage(
                                        "dramabox",
                                        validItems,
                                        lang,
                                        syncType === "foryou" ? "foryou" : "home"
                                    );
                                    console.log(`[Sync] DramaBox lang=${lang}: synced ${validItems.length} items`);
                                }
                            } catch (error) {
                                console.error(`[Sync] DramaBox lang=${lang} failed:`, error);
                            }
                        }
                        // Skip normal processing since we handled it above
                        items = [];
                        break;
                    }

                    case "flickreels": {
                        // FlickReels supports 11 languages
                        // IMPORTANT: "id" (Indonesian) is synced LAST to ensure Indonesian titles are preserved
                        const flickreelsLangs = [
                            "en", "ja", "ko", "zh-TW", "es", "th",
                            "de", "pt", "fr", "ar", "id"
                        ];

                        for (const lang of flickreelsLangs) {
                            try {
                                let data;
                                if (syncType === "trending" || syncType === "home") {
                                    data = await FlickReelsApi.getHome(lang);
                                } else {
                                    data = await FlickReelsApi.getForYou(lang);
                                }

                                const langItems = data.map(adaptFlickReels);
                                const validItems = langItems.filter(item => item.bookId);

                                if (validItems.length > 0) {
                                    await ContentIngestionService.syncContentWithLanguage(
                                        "flickreels",
                                        validItems,
                                        lang,
                                        syncType === "foryou" ? "foryou" : "home"
                                    );
                                    console.log(`[Sync] FlickReels lang=${lang}: synced ${validItems.length} items`);
                                }
                            } catch (error) {
                                console.error(`[Sync] FlickReels lang=${lang} failed:`, error);
                            }
                        }
                        // Skip normal processing since we handled it above
                        items = [];
                        break;
                    }

                    case "melolo": {
                        // Melolo supports 14 languages
                        // en, id, th, pt, es, vi, my (Burmese), km (Khmer), ms (Malay), ja, ko, fr, de, it
                        const meloloLangs = [
                            "en", "id", "th", "pt", "es", "vi", "my", "km",
                            "ms", "ja", "ko", "fr", "de", "it"
                        ];

                        for (const lang of meloloLangs) {
                            try {
                                let data;
                                if (syncType === "trending") {
                                    data = await MeloloApi.getTrending(lang);
                                } else {
                                    data = await MeloloApi.getLatest(lang);
                                }

                                const langItems = data.map(adaptMelolo);
                                const validItems = langItems.filter(item => item.bookId);

                                if (validItems.length > 0) {
                                    await ContentIngestionService.syncContentWithLanguage(
                                        "melolo",
                                        validItems,
                                        lang,
                                        syncType === "trending" ? "home" : "foryou"
                                    );
                                    console.log(`[Sync] Melolo lang=${lang}: synced ${validItems.length} items`);
                                }
                            } catch (error) {
                                console.error(`[Sync] Melolo lang=${lang} failed:`, error);
                            }
                        }
                        // Skip normal processing since we handled it above
                        items = [];
                        break;
                    }

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
                    case "dramabox": {
                        // DramaBox supports 16 languages
                        // IMPORTANT: "id" (Indonesian) is synced LAST to ensure Indonesian titles are preserved
                        const languages = [
                            "en", "ja", "ko", "es", "fr", "pt", "th",
                            "ar", "de", "pl", "vi", "it", "tr", "zh-TW", "zh", "id"
                        ];

                        for (const lang of languages) {
                            try {
                                let data;
                                if (syncType === "trending" || syncType === "home") {
                                    data = await DramaBoxApi.getHome(lang);
                                } else {
                                    data = await DramaBoxApi.getRecommend(lang);
                                }

                                const langItems = data.map(adaptDramaBox);
                                const validItems = langItems.filter(item => item.bookId);

                                if (validItems.length > 0) {
                                    await ContentIngestionService.syncContentWithLanguage(
                                        "dramabox",
                                        validItems,
                                        lang,
                                        syncType === "foryou" ? "foryou" : "home"
                                    );
                                }
                            } catch (error) {
                                console.error(`[Sync GET] DramaBox lang=${lang} failed:`, error);
                            }
                        }
                        items = [];
                        break;
                    }

                    case "flickreels": {
                        // FlickReels supports 11 languages
                        // IMPORTANT: "id" (Indonesian) is synced LAST to ensure Indonesian titles are preserved
                        const flickreelsLangs = [
                            "en", "ja", "ko", "zh-TW", "es", "th",
                            "de", "pt", "fr", "ar", "id"
                        ];

                        for (const lang of flickreelsLangs) {
                            try {
                                let data;
                                if (syncType === "trending" || syncType === "home") {
                                    data = await FlickReelsApi.getHome(lang);
                                } else {
                                    data = await FlickReelsApi.getForYou(lang);
                                }

                                const langItems = data.map(adaptFlickReels);
                                const validItems = langItems.filter(item => item.bookId);

                                if (validItems.length > 0) {
                                    await ContentIngestionService.syncContentWithLanguage(
                                        "flickreels",
                                        validItems,
                                        lang,
                                        syncType === "foryou" ? "foryou" : "home"
                                    );
                                }
                            } catch (error) {
                                console.error(`[Sync GET] FlickReels lang=${lang} failed:`, error);
                            }
                        }
                        items = [];
                        break;
                    }

                    case "melolo": {
                        // Melolo supports 14 languages
                        const meloloLangs = [
                            "en", "id", "th", "pt", "es", "vi", "my", "km",
                            "ms", "ja", "ko", "fr", "de", "it"
                        ];

                        for (const lang of meloloLangs) {
                            try {
                                let data;
                                if (syncType === "trending") {
                                    data = await MeloloApi.getTrending(lang);
                                } else {
                                    data = await MeloloApi.getLatest(lang);
                                }

                                const langItems = data.map(adaptMelolo);
                                const validItems = langItems.filter(item => item.bookId);

                                if (validItems.length > 0) {
                                    await ContentIngestionService.syncContentWithLanguage(
                                        "melolo",
                                        validItems,
                                        lang,
                                        syncType === "trending" ? "home" : "foryou"
                                    );
                                }
                            } catch (error) {
                                console.error(`[Sync GET] Melolo lang=${lang} failed:`, error);
                            }
                        }
                        items = [];
                        break;
                    }

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
