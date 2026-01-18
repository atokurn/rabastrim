/**
 * Background Sync API
 * 
 * Lightweight endpoint for auto-syncing content from explore sections.
 * Called by frontend after fetching data from external API.
 * 
 * POST /api/sync/background
 * Body: { provider, language, items }
 */

import { NextRequest, NextResponse } from "next/server";
import { ContentIngestionService, ScraperItem } from "@/lib/services/content-ingestion";
import { type ContentProvider } from "@/lib/db";

interface BackgroundSyncRequest {
    provider: ContentProvider;
    language: string;
    items: ScraperItem[];
}

export async function POST(request: NextRequest) {
    try {
        const body: BackgroundSyncRequest = await request.json();
        const { provider, language, items } = body;

        // Validate required fields
        if (!provider || !language || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { success: false, error: "Missing required fields: provider, language, items" },
                { status: 400 }
            );
        }

        // Validate provider
        const validProviders: ContentProvider[] = ["dramabox", "flickreels", "melolo"];
        if (!validProviders.includes(provider)) {
            return NextResponse.json(
                { success: false, error: `Invalid provider: ${provider}. Must be one of: ${validProviders.join(", ")}` },
                { status: 400 }
            );
        }

        // Process in background - non-blocking for the response
        // Using Promise.resolve to not block the response
        const syncPromise = ContentIngestionService.syncContentWithLanguage(
            provider,
            items,
            language,
            "home" // fetchedFrom
        );

        // Don't await - let it run in background
        // Note: In production with Vercel, use waitUntil() for proper background processing
        syncPromise.then(result => {
            console.log(`[Background Sync] ${provider}/${language}: ${result.processed} items processed`);
        }).catch(err => {
            console.error(`[Background Sync] ${provider}/${language} error:`, err);
        });

        return NextResponse.json({
            success: true,
            message: `Background sync started for ${provider}/${language} with ${items.length} items`,
            queued: items.length
        });

    } catch (error) {
        console.error("[Background Sync] Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process sync request" },
            { status: 500 }
        );
    }
}
