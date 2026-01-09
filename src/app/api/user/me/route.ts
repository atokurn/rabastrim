import { NextResponse } from "next/server";
import { getUserProfile, isLoggedIn } from "@/lib/actions/user";

export async function GET() {
    try {
        const profile = await getUserProfile();
        const loggedIn = await isLoggedIn();

        return NextResponse.json({
            ...profile,
            isLoggedIn: loggedIn,
        });
    } catch (error) {
        console.error("User profile API error:", error);
        return NextResponse.json(
            { error: "Failed to get user profile" },
            { status: 500 }
        );
    }
}
