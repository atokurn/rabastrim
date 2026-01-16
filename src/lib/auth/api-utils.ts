import { NextRequest } from "next/server";

/**
 * Validate API Key for protected routes (cron jobs, admin actions)
 */
export function validateApiKey(request: NextRequest): boolean {
    const cronSecret = process.env.CRON_SECRET;

    // If no secret is set, allow requests (development mode)
    if (!cronSecret) {
        console.warn("[Auth] CRON_SECRET not set, allowing unauthenticated access");
        return true;
    }

    // Check Authorization header (Bearer token)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        if (token === cronSecret) return true;
    }

    // Check query parameter (for cron-job.org compatibility)
    const keyParam = request.nextUrl.searchParams.get("key");
    if (keyParam === cronSecret) return true;

    return false;
}
