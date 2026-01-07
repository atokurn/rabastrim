import { NextRequest, NextResponse } from "next/server";

/**
 * Video Proxy for Whatbox/Donghua streams
 * 
 * Handles URLs with embedded credentials (user:pass@host) that browsers block.
 * The proxy strips the credentials and adds them as Basic Auth header server-side.
 * 
 * Usage: /api/video-proxy?url=http://user:pass@host/path/video.mp4
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get("url");

    if (!videoUrl) {
        return NextResponse.json(
            { error: "Missing url parameter" },
            { status: 400 }
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
            const credentials = Buffer.from(`${username}:${password}`).toString("base64");
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
                { status: response.status }
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

        // Enable CORS
        responseHeaders.set("Access-Control-Allow-Origin", "*");
        responseHeaders.set("Access-Control-Allow-Methods", "GET, OPTIONS");
        responseHeaders.set("Access-Control-Allow-Headers", "Range");
        responseHeaders.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");

        return new NextResponse(response.body, {
            status: response.status,
            headers: responseHeaders,
        });

    } catch (error) {
        console.error("[VideoProxy] Error:", error);
        return NextResponse.json(
            { error: "Proxy error" },
            { status: 500 }
        );
    }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Range",
            "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
        },
    });
}
