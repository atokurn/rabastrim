import { NextRequest, NextResponse } from "next/server";

// Use Edge Runtime for video streaming (no timeout limit)
export const runtime = "edge";

// ============================================
// SECURITY: URL Validation & SSRF Protection
// ============================================

/**
 * Whitelist of allowed video hosting domains
 * Add new domains here as needed for legitimate video sources
 */
const ALLOWED_DOMAINS = [
    // Whatbox hosting for DramaQueen
    "whatbox.ca",
    "panda.whatbox.ca",
    // Add other legitimate video CDN domains here
    "storage.googleapis.com",
    "cloudflare.com",
    "r2.cloudflarestorage.com",
];

/**
 * Production domain for CORS
 */
const PRODUCTION_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "https://flysel.fun";

/**
 * Check if hostname is a private/internal IP address (SSRF protection)
 */
function isPrivateIP(hostname: string): boolean {
    // Localhost variations
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
        return true;
    }

    // Private IP ranges
    const privateRanges = [
        /^10\./,                    // 10.0.0.0/8
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
        /^192\.168\./,              // 192.168.0.0/16
        /^169\.254\./,              // Link-local (AWS metadata at 169.254.169.254)
        /^0\./,                     // 0.0.0.0/8
        /^100\.(6[4-9]|[7-9][0-9]|1[0-2][0-7])\./, // Carrier-grade NAT
    ];

    return privateRanges.some(range => range.test(hostname));
}

/**
 * Validate URL for security - returns error message or null if valid
 */
function validateUrl(urlString: string): string | null {
    try {
        const url = new URL(urlString);

        // Only allow HTTP and HTTPS
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return "Invalid protocol - only HTTP/HTTPS allowed";
        }

        // Block private/internal IPs
        if (isPrivateIP(url.hostname)) {
            return "Access to internal addresses is not allowed";
        }

        // Check against whitelist
        const isAllowed = ALLOWED_DOMAINS.some(domain =>
            url.hostname === domain || url.hostname.endsWith(`.${domain}`)
        );

        if (!isAllowed) {
            return `Domain not whitelisted: ${url.hostname}`;
        }

        return null; // Valid
    } catch {
        return "Invalid URL format";
    }
}

/**
 * Get CORS headers with proper origin restriction
 */
function getCorsHeaders(requestOrigin: string | null): Record<string, string> {
    // In development, allow localhost
    const allowedOrigins = [
        PRODUCTION_ORIGIN,
        "http://localhost:3000",
        "http://localhost:3001",
    ];

    const origin = requestOrigin && allowedOrigins.includes(requestOrigin)
        ? requestOrigin
        : PRODUCTION_ORIGIN;

    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Range",
        "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
    };
}

// ============================================
// VIDEO PROXY ENDPOINT
// ============================================

/**
 * Video Proxy for Whatbox/Donghua streams
 * 
 * Handles URLs with embedded credentials (user:pass@host) that browsers block.
 * The proxy strips the credentials and adds them as Basic Auth header server-side.
 * 
 * Security:
 * - Domain whitelist to prevent SSRF
 * - Private IP blocking
 * - Restricted CORS
 * 
 * Usage: /api/video-proxy?url=http://user:pass@host/path/video.mp4
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get("url");
    const requestOrigin = request.headers.get("origin");

    if (!videoUrl) {
        return NextResponse.json(
            { error: "Missing url parameter" },
            { status: 400, headers: getCorsHeaders(requestOrigin) }
        );
    }

    // Security: Validate URL before processing
    const validationError = validateUrl(videoUrl);
    if (validationError) {
        console.warn(`[VideoProxy] Blocked request: ${validationError}`, { url: videoUrl });
        return NextResponse.json(
            { error: "URL not allowed" },
            { status: 403, headers: getCorsHeaders(requestOrigin) }
        );
    }

    try {
        // Parse URL to extract credentials
        const url = new URL(videoUrl);
        const username = url.username;
        const password = url.password;

        // Build clean URL without credentials
        url.username = "";
        url.password = "";
        const cleanUrl = url.toString();

        // Prepare fetch headers
        const headers: HeadersInit = {};

        // Handle range requests for seeking
        const rangeHeader = request.headers.get("range");
        if (rangeHeader) {
            headers["Range"] = rangeHeader;
        }

        // Add Basic Auth if credentials were present in URL
        if (username && password) {
            // Use btoa() instead of Buffer for Edge Runtime compatibility
            const credentials = btoa(`${username}:${password}`);
            headers["Authorization"] = `Basic ${credentials}`;
        }

        // Fetch the video from the actual source
        const response = await fetch(cleanUrl, {
            headers,
            // Don't follow redirects automatically - handle them for range requests
        });

        if (!response.ok && response.status !== 206) {
            return NextResponse.json(
                { error: `Upstream error: ${response.status}` },
                { status: response.status, headers: getCorsHeaders(requestOrigin) }
            );
        }

        // Create streaming response
        const responseHeaders = new Headers();

        // Copy relevant headers from upstream
        const contentType = response.headers.get("content-type");
        if (contentType) {
            responseHeaders.set("Content-Type", contentType);
        }

        const contentLength = response.headers.get("content-length");
        if (contentLength) {
            responseHeaders.set("Content-Length", contentLength);
        }

        const contentRange = response.headers.get("content-range");
        if (contentRange) {
            responseHeaders.set("Content-Range", contentRange);
        }

        const acceptRanges = response.headers.get("accept-ranges");
        if (acceptRanges) {
            responseHeaders.set("Accept-Ranges", acceptRanges);
        }

        // Add CORS headers (restricted)
        const corsHeaders = getCorsHeaders(requestOrigin);
        Object.entries(corsHeaders).forEach(([key, value]) => {
            responseHeaders.set(key, value);
        });

        return new NextResponse(response.body, {
            status: response.status,
            headers: responseHeaders,
        });

    } catch (error) {
        console.error("[VideoProxy] Error:", error);
        return NextResponse.json(
            { error: "Proxy error" },
            { status: 500, headers: getCorsHeaders(requestOrigin) }
        );
    }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
    const requestOrigin = request.headers.get("origin");
    return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(requestOrigin),
    });
}
