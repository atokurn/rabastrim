import { NextRequest, NextResponse } from "next/server";
import { ContentIngestionService, type ContentInput } from "@/lib/services/content-ingestion";
import { DramaQueenApi } from "@/lib/api/dramaqueen";
import type { ContentProvider } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for full sync

// API Key validation
function validateApiKey(request: NextRequest): boolean {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) return true;
    const keyParam = request.nextUrl.searchParams.get("key");
    return keyParam === cronSecret;
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
    return country;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDramaQueen(item: any, contentType: "drama" | "anime" = "drama"): ContentInput {
    const tahunRilis = item.tahun_rilis;
    const year = tahunRilis ? parseInt(String(tahunRilis).slice(0, 4)) : undefined;

    return {
        bookId: String(item.bookId || item.id || ""),
        title: item.title || item.name || "Untitled",
        description: item.description || item.desc || undefined,
        poster: item.cover || item.landscapeCover || undefined,
        episodeCount: item.episodes || item.episodeCount || undefined,
        region: item.region || normalizeCountry(item.country) || undefined,
        contentType,
        tags: item.type ? [item.type] : undefined,
        year,
        tahun_rilis: tahunRilis,
        is_finish: item.is_finish,
        is_coming: item.is_coming,
    };
}

/**
 * POST/GET /api/sync-dramaqueen?full=true
 * 
 * Sync ALL dramas and donghua from DramaQueen API
 * - Paginates through /drama/list to get all dramas
 * - Fetches /donghua/list for anime content
 * 
 * Query params:
 * - full: if "true", sync all pages (default: only first 50)
 * - type: "drama" | "donghua" | "all" (default: "all")
 */
export async function POST(request: NextRequest) {
    if (!validateApiKey(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const fullSync = searchParams.get("full") === "true";
    const syncType = searchParams.get("type") || "all";

    console.log(`[Sync DramaQueen] Starting sync - full: ${fullSync}, type: ${syncType}`);

    const results = {
        drama: { processed: 0, created: 0, updated: 0 },
        donghua: { processed: 0, created: 0, updated: 0 },
    };

    try {
        // Sync Dramas
        if (syncType === "all" || syncType === "drama") {
            const allDramas: ContentInput[] = [];
            let page = 1;
            const limit = 50;
            const maxPages = fullSync ? 50 : 1; // Max 50 pages (2500 items) or just 1 page

            while (page <= maxPages) {
                console.log(`[Sync DramaQueen] Fetching drama page ${page}...`);
                const data = await DramaQueenApi.getList(page, limit);

                if (data.length === 0) {
                    console.log(`[Sync DramaQueen] No more dramas at page ${page}`);
                    break;
                }

                const normalized = data.map(item => normalizeDramaQueen({
                    bookId: item.id,
                    title: item.title,
                    description: item.description,
                    cover: item.cover,
                    region: normalizeCountry(item.country),
                    contentType: "drama",
                    tags: item.type ? [item.type] : undefined,
                    year: item.tahun_rilis ? parseInt(String(item.tahun_rilis).slice(0, 4)) : undefined,
                    tahun_rilis: item.tahun_rilis,
                    is_finish: item.is_finish,
                    is_coming: item.is_coming,
                    episodeCount: item.episodes,
                }, "drama"));

                allDramas.push(...normalized);

                if (data.length < limit) {
                    // Last page
                    break;
                }
                page++;
            }

            console.log(`[Sync DramaQueen] Total dramas fetched: ${allDramas.length}`);

            // Sync to database
            const validDramas = allDramas.filter(item => item.bookId);
            if (validDramas.length > 0) {
                const result = await ContentIngestionService.syncTrending("dramaqueen" as ContentProvider, validDramas);
                results.drama = result;
            }
        }

        // Sync Donghua (Anime)
        if (syncType === "all" || syncType === "donghua") {
            const allDonghua: ContentInput[] = [];
            let page = 1;
            const maxPages = fullSync ? 30 : 1; // 30 pages * 10 = 300 max donghua

            while (page <= maxPages) {
                console.log(`[Sync DramaQueen] Fetching donghua page ${page}...`);
                const data = await DramaQueenApi.getDonghuaList(page);

                if (data.length === 0) {
                    console.log(`[Sync DramaQueen] No more donghua at page ${page}`);
                    break;
                }

                // getDonghuaList already normalizes data (name→title, image→cover)
                const normalized = data.map(item => normalizeDramaQueen({
                    bookId: String(item.id),
                    title: item.title,  // Already normalized from 'name'
                    description: item.description,
                    cover: item.cover,  // Already normalized from 'image'
                    region: "CN", // Donghua is Chinese animation
                    contentType: "anime",
                    tags: ["donghua"],
                    year: item.year ? parseInt(String(item.year)) : undefined,
                    is_finish: item.status === "Completed",
                    is_coming: false,
                    episodeCount: item.episodes || item.totalEpisodes,
                }, "anime"));

                allDonghua.push(...normalized);

                // Donghua API returns 10 per page, break if less than 10
                if (data.length < 10) {
                    break;
                }
                page++;
            }

            console.log(`[Sync DramaQueen] Total donghua fetched: ${allDonghua.length}`);

            // Sync to database
            const validDonghua = allDonghua.filter(item => item.bookId);
            if (validDonghua.length > 0) {
                const result = await ContentIngestionService.syncTrending("donghua" as ContentProvider, validDonghua);
                results.donghua = result;
            }
        }

        return NextResponse.json({
            success: true,
            fullSync,
            syncType,
            results,
            total: results.drama.processed + results.donghua.processed,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[Sync DramaQueen] Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// Support GET for easy testing
export async function GET(request: NextRequest) {
    return POST(request);
}
