import { NextResponse } from "next/server";
import { getFlickReelsHero } from "@/lib/services/hero/flickreels";

export const revalidate = 600; // Cache for 10 minutes

/**
 * Priority Hero endpoint - Returns only FlickReels data for fast initial render
 * Target response time: <500ms
 */
export async function GET() {
    try {
        // Only fetch from FlickReels (usually fastest)
        const heroItems = await getFlickReelsHero(3);

        return NextResponse.json({
            success: true,
            data: heroItems,
            partial: true // Indicates more data available from /api/home/hero
        });
    } catch (error) {
        console.error("Priority Hero API Error:", error);
        return NextResponse.json(
            { success: false, data: [], partial: true },
            { status: 200 } // Return 200 with empty to not block UI
        );
    }
}
