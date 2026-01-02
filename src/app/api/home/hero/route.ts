import { NextResponse } from "next/server";
import { HeroService } from "@/lib/services/hero";

export const revalidate = 600; // Cache for 10 minutes

export async function GET() {
    try {
        const heroItems = await HeroService.getHeroContent();

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
