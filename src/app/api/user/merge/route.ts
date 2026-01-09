import { NextResponse } from "next/server";
import { mergeGuestData } from "@/lib/actions/user";

export async function POST() {
    try {
        const result = await mergeGuestData();

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 401 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("User merge API error:", error);
        return NextResponse.json(
            { error: "Failed to merge guest data" },
            { status: 500 }
        );
    }
}
