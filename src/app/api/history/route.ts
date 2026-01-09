import { NextRequest, NextResponse } from "next/server";
import { getAllWatchHistory } from "@/lib/actions/history";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        // getAllWatchHistory already returns ordered by watchedAt DESC
        // We add offset support here
        const totalLimit = limit + offset;
        const allHistory = await getAllWatchHistory(totalLimit);

        // Apply offset manually (drizzle doesn't have offset in simple queries)
        const history = allHistory.slice(offset, offset + limit);

        return NextResponse.json({
            items: history.map(item => ({
                id: item.dramaId,
                title: item.dramaTitle || "Untitled",
                image: item.dramaCover || "",
                progress: item.progress || 0,
                episodeNumber: item.episodeNumber,
                episodeId: item.episodeId,
                provider: item.provider,
                lastPosition: item.lastPosition,
                duration: item.duration,
                isCompleted: item.isCompleted,
                watchedAt: item.watchedAt,
            })),
            pagination: {
                limit,
                offset,
                hasMore: allHistory.length > offset + limit,
            }
        });
    } catch (error) {
        console.error("History API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch history" },
            { status: 500 }
        );
    }
}
