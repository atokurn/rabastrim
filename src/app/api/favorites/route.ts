import { NextRequest, NextResponse } from "next/server";
import { getFavorites, toggleFavorite } from "@/lib/actions/favorites";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "50", 10);
        const offset = parseInt(searchParams.get("offset") || "0", 10);

        const totalLimit = limit + offset;
        const allFavorites = await getFavorites(totalLimit);

        const favorites = allFavorites.slice(offset, offset + limit);

        return NextResponse.json({
            items: favorites.map(item => ({
                id: item.dramaId,
                title: item.dramaTitle || "Untitled",
                image: item.dramaCover || "",
                provider: item.provider,
                description: item.description,
                createdAt: item.createdAt,
            })),
            pagination: {
                limit,
                offset,
                hasMore: allFavorites.length > offset + limit,
            }
        });
    } catch (error) {
        console.error("Favorites API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch favorites" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { dramaId, dramaTitle, dramaCover, provider } = body;

        if (!dramaId || !provider) {
            return NextResponse.json(
                { error: "dramaId and provider are required" },
                { status: 400 }
            );
        }

        const result = await toggleFavorite({
            dramaId,
            dramaTitle: dramaTitle || "",
            dramaCover: dramaCover || "",
            provider,
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Favorites toggle API error:", error);
        return NextResponse.json(
            { error: "Failed to toggle favorite" },
            { status: 500 }
        );
    }
}
