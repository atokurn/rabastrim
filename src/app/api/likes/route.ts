import { NextRequest, NextResponse } from "next/server";
import { getLikes, toggleLike } from "@/lib/actions/likes";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        const totalLimit = limit + offset;
        const allLikes = await getLikes(totalLimit);

        const likes = allLikes.slice(offset, offset + limit);

        return NextResponse.json({
            items: likes.map(item => ({
                id: `${item.dramaId}-${item.episodeNumber}`,
                dramaId: item.dramaId,
                title: item.dramaTitle || "Untitled",
                image: item.dramaCover || "",
                provider: item.provider,
                episodeNumber: item.episodeNumber,
                createdAt: item.createdAt,
            })),
            pagination: {
                limit,
                offset,
                hasMore: allLikes.length > offset + limit,
            }
        });
    } catch (error) {
        console.error("Likes API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch likes" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { dramaId, dramaTitle, dramaCover, provider, episodeNumber } = body;

        if (!dramaId || !provider || episodeNumber === undefined) {
            return NextResponse.json(
                { error: "dramaId, provider, and episodeNumber are required" },
                { status: 400 }
            );
        }

        const result = await toggleLike({
            dramaId,
            dramaTitle: dramaTitle || "",
            dramaCover: dramaCover || "",
            provider,
            episodeNumber,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Likes toggle API error:", error);
        return NextResponse.json(
            { error: "Failed to toggle like" },
            { status: 500 }
        );
    }
}
