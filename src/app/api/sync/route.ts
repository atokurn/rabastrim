import { NextRequest, NextResponse } from "next/server";
import { ContentIngestionService, type ContentInput } from "@/lib/services/content-ingestion";
import { DramaBoxApi } from "@/lib/api/dramabox";
import { FlickReelsApi } from "@/lib/api/flickreels";
import { MeloloApi } from "@/lib/api/melolo";
import { DramaQueenApi } from "@/lib/api/dramaqueen";
import type { ContentProvider } from "@/lib/db";

export const dynamic = "force-dynamic";

// API Key validation
function validateApiKey(request: NextRequest): boolean {
    const cronSecret = process.env.CRON_SECRET;

    // If no secret is set, allow requests (development mode)
    if (!cronSecret) {
        console.warn("[Sync] CRON_SECRET not set, allowing unauthenticated access");
        return true;
    }

    // Check Authorization header (Bearer token)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        if (token === cronSecret) return true;
    }

    // Check query parameter (for cron-job.org compatibility)
    const keyParam = request.nextUrl.searchParams.get("key");
    if (keyParam === cronSecret) return true;

    return false;
}

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

// Normalize country names to standard codes
function normalizeCountry(country?: string | null): string | null {
    if (!country) return null;
    const lower = country.toLowerCase();
    if (lower.includes("china") || lower === "tiongkok") return "CN";
    if (lower.includes("korea")) return "KR";
    if (lower.includes("japan") || lower === "jepang") return "JP";
    if (lower.includes("thailand")) return "TH";
    if (lower.includes("taiwan")) return "TW";
    return country; // Keep original if no match
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDramaQueen(item: any): ContentInput {
    // DramaQueenApi normalizes negara → country
    const contentType = item.type === "donghua" ? "donghua" : "drama";

    // Extract year from tahun_rilis if available (format: "2025-12-22")
    const tahunRilis = item.tahun_rilis;
    const year = tahunRilis ? parseInt(String(tahunRilis).slice(0, 4)) : (item.year ? parseInt(item.year) : undefined);

    return {
        bookId: String(item.id || ""),
        title: item.title || item.name || "Untitled",
        description: item.description || item.desc || undefined,
        poster: item.cover || item.landscapeCover || undefined,
        episodeCount: item.episodes || item.totalEpisodes || undefined,
        region: normalizeCountry(item.country) || undefined,
        contentType,
        tags: item.type ? [item.type] : undefined,
        // Release date fields for normalizeReleaseInfo
        year,
        tahun_rilis: tahunRilis,  // Full date: "2025-12-22"
        is_finish: item.is_finish ?? (item.status === "Completed"),
        is_coming: item.is_coming ?? (item.status === "Coming Soon"),
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

                    case "dramaqueen":
                        // Use getList which returns complete data including negara/tahun_rilis
                        if (syncType !== "foryou") {
                            // getList returns full data with negara (country), tahun_rilis
                            const data = await DramaQueenApi.getList(51, 100);
                            console.log(`[Sync DramaQueen] Got ${data.length} items from /drama/list`);

                            // Log first item to verify data
                            if (data.length > 0) {
                                console.log("[Sync DramaQueen] First item raw:", JSON.stringify({
                                    id: data[0].id,
                                    title: data[0].title,
                                    country: data[0].country,
                                    tahun_rilis: data[0].tahun_rilis,
                                    is_finish: data[0].is_finish,
                                }, null, 2));
                            }

                            items = data.map(item => normalizeDramaQueen({
                                bookId: item.id,
                                title: item.title,
                                description: item.description,
                                cover: item.cover,
                                region: normalizeCountry(item.country) || undefined,
                                contentType: item.type === "donghua" ? "donghua" : "drama",
                                tags: item.type ? [item.type] : undefined,
                                year: item.tahun_rilis ? parseInt(String(item.tahun_rilis).slice(0, 4)) : undefined,
                                tahun_rilis: item.tahun_rilis,
                                is_finish: item.is_finish,
                                is_coming: item.is_coming,
                                episodeCount: item.episodes,
                            }));

                            if (items.length > 0) {
                                console.log("[Sync DramaQueen] First normalized item:", JSON.stringify({
                                    title: items[0].title,
                                    region: items[0].region,
                                    tahun_rilis: items[0].tahun_rilis,
                                }, null, 2));
                            }
                        } else {
                            const data = await DramaQueenApi.getLatest();
                            items = data.map(normalizeDramaQueen);
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

                    case "dramaqueen":
                        if (syncType === "trending") {
                            const data = await DramaQueenApi.getTrending();
                            items = data.map(normalizeDramaQueen);
                        } else if (syncType === "home") {
                            const data = await DramaQueenApi.getHome();
                            items = data.map(normalizeDramaQueen);
                        } else {
                            const data = await DramaQueenApi.getLatest();
                            items = data.map(normalizeDramaQueen);
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
