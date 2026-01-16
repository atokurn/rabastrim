import { NextRequest, NextResponse } from "next/server";
import { ContentIngestionService, type ContentInput } from "@/lib/services/content-ingestion";
import { DramaQueenApi } from "@/lib/api/dramaqueen";
import type { ContentProvider } from "@/lib/db";
import { validateApiKey, authErrorResponse } from "@/lib/auth/api-utils";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max for Vercel Pro

/**
 * CRON: Sync All DramaQueen Content
 * 
 * Usage:
 * - GET /api/cron/sync-dramaqueen?key=CRON_SECRET
 * - GET /api/cron/sync-dramaqueen?key=CRON_SECRET&mode=full (sync ALL pages)
 * - GET /api/cron/sync-dramaqueen?key=CRON_SECRET&mode=incremental (default, 5 pages)
 * 
 * Vercel Cron Config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/sync-dramaqueen?mode=incremental",
 *     "schedule": "0 * * * *"   // Every hour
 *   }]
 * }
 * 
 * Cron-job.org:
 * - URL: https://your-domain.com/api/cron/sync-dramaqueen?key=YOUR_SECRET&mode=incremental
 * - Schedule: Every hour
 */

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
function normalizeDramaItem(item: any, contentType: "drama" | "anime" = "drama"): ContentInput {
    const tahunRilis = item.tahun_rilis;
    const year = tahunRilis ? parseInt(String(tahunRilis).slice(0, 4)) : undefined;

    return {
        bookId: String(item.id || item.bookId || ""),
        title: item.title || item.name || "Untitled",
        description: item.description || item.desc || undefined,
        poster: item.cover || item.landscapeCover || item.image || undefined,
        episodeCount: item.episodes || item.episodeCount || item.jumlah_episode || undefined,
        region: normalizeCountry(item.country || item.negara) || undefined,
        contentType,
        tags: item.genres || (item.type ? [item.type] : undefined),
        year,
        tahun_rilis: tahunRilis,
        is_finish: item.is_finish,
        is_coming: item.is_coming,
    };
}

interface SyncStats {
    processed: number;
    created: number;
    updated: number;
    pages: number;
    duration: number;
}

export async function GET(request: NextRequest) {
    // Validate auth using centralized function
    if (!validateApiKey(request)) {
        return NextResponse.json(authErrorResponse(), { status: 401 });
    }

    const startTime = Date.now();
    const mode = request.nextUrl.searchParams.get("mode") || "incremental";
    const isFullSync = mode === "full";

    console.log(`[Cron DramaQueen] Starting ${mode} sync...`);

    const results: {
        drama: SyncStats;
        donghua: SyncStats;
    } = {
        drama: { processed: 0, created: 0, updated: 0, pages: 0, duration: 0 },
        donghua: { processed: 0, created: 0, updated: 0, pages: 0, duration: 0 },
    };

    try {
        // ========== SYNC DRAMAS ==========
        const dramaStart = Date.now();
        const allDramas: ContentInput[] = [];
        let page = 1;
        const limit = 50;
        // Full: max 100 pages (5000 dramas), Incremental: 5 pages (250 dramas)
        const maxPages = isFullSync ? 100 : 5;

        while (page <= maxPages) {
            console.log(`[Cron DramaQueen] Fetching drama page ${page}/${maxPages}...`);

            try {
                const data = await DramaQueenApi.getList(page, limit);

                if (!data || data.length === 0) {
                    console.log(`[Cron DramaQueen] No more dramas at page ${page}`);
                    break;
                }

                const normalized = data.map(item => normalizeDramaItem({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    cover: item.cover,
                    country: item.country,
                    tahun_rilis: item.tahun_rilis,
                    is_finish: item.is_finish,
                    is_coming: item.is_coming,
                    episodes: item.episodes,
                    genres: item.genres,
                }, "drama"));

                allDramas.push(...normalized);
                results.drama.pages++;

                // Break if we got less than limit (last page)
                if (data.length < limit) {
                    break;
                }

                page++;

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`[Cron DramaQueen] Error fetching drama page ${page}:`, error);
                break;
            }
        }

        console.log(`[Cron DramaQueen] Total dramas fetched: ${allDramas.length}`);

        // Ingest dramas
        const validDramas = allDramas.filter(item => item.bookId);
        if (validDramas.length > 0) {
            const result = await ContentIngestionService.syncTrending(
                "dramaqueen" as ContentProvider,
                validDramas
            );
            results.drama.processed = result.processed;
            results.drama.created = result.created;
            results.drama.updated = result.updated;
        }
        results.drama.duration = Date.now() - dramaStart;

        // ========== SYNC DONGHUA (Anime) ==========
        const donghuaStart = Date.now();
        const allDonghua: ContentInput[] = [];
        let donghuaPage = 1;
        // Full: max 50 pages (500 donghua), Incremental: 3 pages (30 donghua)
        const maxDonghuaPages = isFullSync ? 50 : 3;

        while (donghuaPage <= maxDonghuaPages) {
            console.log(`[Cron DramaQueen] Fetching donghua page ${donghuaPage}/${maxDonghuaPages}...`);

            try {
                const data = await DramaQueenApi.getDonghuaList(donghuaPage);

                if (!data || data.length === 0) {
                    console.log(`[Cron DramaQueen] No more donghua at page ${donghuaPage}`);
                    break;
                }

                const normalized = data.map(item => normalizeDramaItem({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    cover: item.cover,
                    country: "CN", // Donghua is Chinese
                    episodes: item.episodes,
                    is_finish: item.status === "Completed",
                }, "anime"));

                allDonghua.push(...normalized);
                results.donghua.pages++;

                // Donghua API returns ~10 per page
                if (data.length < 10) {
                    break;
                }

                donghuaPage++;
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`[Cron DramaQueen] Error fetching donghua page ${donghuaPage}:`, error);
                break;
            }
        }

        console.log(`[Cron DramaQueen] Total donghua fetched: ${allDonghua.length}`);

        // Ingest donghua - use "dramaqueen" provider but with anime contentType
        const validDonghua = allDonghua.filter(item => item.bookId);
        if (validDonghua.length > 0) {
            const result = await ContentIngestionService.syncTrending(
                "dramaqueen" as ContentProvider,
                validDonghua
            );
            results.donghua.processed = result.processed;
            results.donghua.created = result.created;
            results.donghua.updated = result.updated;
        }
        results.donghua.duration = Date.now() - donghuaStart;

        const totalDuration = Date.now() - startTime;

        console.log(`[Cron DramaQueen] Sync completed in ${totalDuration}ms`);
        console.log(`[Cron DramaQueen] Drama: ${results.drama.processed} processed, ${results.drama.created} created, ${results.drama.updated} updated`);
        console.log(`[Cron DramaQueen] Donghua: ${results.donghua.processed} processed, ${results.donghua.created} created, ${results.donghua.updated} updated`);

        return NextResponse.json({
            success: true,
            mode,
            results,
            totals: {
                processed: results.drama.processed + results.donghua.processed,
                created: results.drama.created + results.donghua.created,
                updated: results.drama.updated + results.donghua.updated,
            },
            duration: `${totalDuration}ms`,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error("[Cron DramaQueen] Fatal error:", error);
        return NextResponse.json({
            success: false,
            error: String(error),
            partialResults: results,
            duration: `${Date.now() - startTime}ms`,
        }, { status: 500 });
    }
}

// Support POST for manual triggers
export async function POST(request: NextRequest) {
    return GET(request);
}
