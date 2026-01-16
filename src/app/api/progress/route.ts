import { NextRequest, NextResponse } from "next/server";
import { updateWatchHistory } from "@/lib/actions/history";
import { getNextEpisode } from "@/lib/services/progress";
import { UpdateProgressSchema, parseBody } from "@/lib/validations/api-schemas";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request body with Zod
        const parsed = parseBody(UpdateProgressSchema, body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const {
            dramaId,
            dramaTitle,
            dramaCover,
            provider,
            episodeId,
            episodeNumber,
            position,
            duration,
        } = parsed.data;

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
