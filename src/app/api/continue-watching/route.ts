import { NextResponse } from "next/server";
import { getWatchHistory } from "@/lib/actions/history";

export async function GET() {
    try {
        const history = await getWatchHistory(10);

        const continueWatching = history.map(item => ({
            id: item.dramaId,
            title: item.dramaTitle || "Untitled",
            image: item.dramaCover || "",
            progress: item.progress || 0,
            episodeNumber: item.episodeNumber,
            episodeId: item.episodeId,
            provider: item.provider,
            lastPosition: item.lastPosition,
        }));

        return NextResponse.json({ items: continueWatching });
    } catch (error) {
        console.error("Continue watching API error:", error);
        return NextResponse.json({ error: "Failed to fetch continue watching" }, { status: 500 });
    }
}
