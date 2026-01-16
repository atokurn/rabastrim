import { NextRequest, NextResponse } from "next/server";
import { getLikes, toggleLike } from "@/lib/actions/likes";
import {
    ToggleLikeSchema,
    PaginationSchema,
    parseBody,
    parseQueryParams
} from "@/lib/validations/api-schemas";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Validate pagination params
        const parsed = parseQueryParams(PaginationSchema, searchParams);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const { limit, offset } = parsed.data;
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

        // Validate request body with Zod
        const parsed = parseBody(ToggleLikeSchema, body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const { dramaId, dramaTitle, dramaCover, provider, episodeNumber } = parsed.data;

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
