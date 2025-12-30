import { NextRequest, NextResponse } from "next/server";
import { updateWatchHistory } from "@/lib/actions/history";
import { getNextEpisode, shouldMarkComplete } from "@/lib/services/progress";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            dramaId,
            dramaTitle,
            dramaCover,
            provider,
            episodeId,
            episodeNumber,
            position,
            duration,
        } = body;

        if (!dramaId || !provider) {
            return NextResponse.json(
                { error: "dramaId and provider are required" },
                { status: 400 }
            );
        }

        // Update watch history
        const { isCompleted, progress } = await updateWatchHistory({
            dramaId,
            dramaTitle: dramaTitle || "",
            dramaCover: dramaCover || "",
            provider,
            episodeId,
            episodeNumber,
            lastPosition: position || 0,
            duration: duration || 0,
        });

        // Check if should suggest next episode
        let nextEpisode = null;
        if (isCompleted && episodeNumber) {
            nextEpisode = await getNextEpisode(dramaId, episodeNumber, provider);
        }

        return NextResponse.json({
            success: true,
            progress,
            isCompleted,
            nextEpisode,
        });
    } catch (error) {
        console.error("Progress API error:", error);
        return NextResponse.json(
            { error: "Failed to save progress" },
            { status: 500 }
        );
    }
}
