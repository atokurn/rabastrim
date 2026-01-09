import { NextRequest, NextResponse } from "next/server";
import { syncClerkUser } from "@/lib/actions/user";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));

        const result = await syncClerkUser({
            email: body.email,
            name: body.name,
            avatar: body.avatar,
        });

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 401 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("User sync API error:", error);
        return NextResponse.json(
            { error: "Failed to sync user" },
            { status: 500 }
        );
    }
}
