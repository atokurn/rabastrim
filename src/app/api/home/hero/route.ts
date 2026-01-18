import { NextRequest, NextResponse } from "next/server";
import { HeroService } from "@/lib/services/hero";

export const revalidate = 600; // Cache for 10 minutes

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const lang = searchParams.get("lang") || "id";

        const heroItems = await HeroService.getHeroContent(lang);

        return NextResponse.json({
            success: true,
            data: heroItems
        });
    } catch (error) {
        console.error("Hero API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch hero content" },
            { status: 500 }
        );
    }
}

