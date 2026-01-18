import { NextRequest, NextResponse } from "next/server";
import { getContent } from "@/lib/services/content-repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const lang = searchParams.get("lang") || undefined; // Optional language filter

        // Convert page to offset
        const cursor = (page - 1) * limit;

        const data = await getContent(cursor, limit, lang);

        return NextResponse.json({
            success: true,
            data,
            page,
            hasMore: data.length === limit,
        });
    } catch (error) {
        console.error("[Explore API] Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch explore content" },
            { status: 500 }
        );
    }
}
