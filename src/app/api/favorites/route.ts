import { NextRequest, NextResponse } from "next/server";
import { getFavorites, toggleFavorite } from "@/lib/actions/favorites";
import {
    ToggleFavoriteSchema,
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

        // Validate request body with Zod
        const parsed = parseBody(ToggleFavoriteSchema, body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
        }

        const { dramaId, dramaTitle, dramaCover, provider } = parsed.data;

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
