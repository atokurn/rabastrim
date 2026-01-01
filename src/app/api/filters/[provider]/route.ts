import { NextRequest, NextResponse } from "next/server";
import { cache, cacheTTL } from "@/lib/cache";
import { getProviderFilters, DEFAULT_SORT_FILTER } from "@/lib/filters";
import { ProviderSource, FiltersResponse, PROVIDERS } from "@/lib/explore";

const CACHE_VERSION = "v1";

function getCacheKey(provider: string) {
    return `filters:${provider}:${CACHE_VERSION}`;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    const { provider } = await params;

    // Validate provider
    const validProviders = PROVIDERS.filter(p => p.enabled).map(p => p.id);
    if (!validProviders.includes(provider as ProviderSource)) {
        return NextResponse.json(
            { error: `Invalid provider. Valid: ${validProviders.join(", ")}` },
            { status: 400 }
        );
    }

    try {
        const cacheKey = getCacheKey(provider);

        // Use Redis cache with long TTL (filters rarely change)
        const filters = await cache.getOrSet(
            cacheKey,
            async () => {
                const providerFilters = getProviderFilters(provider as ProviderSource);
                // Always include sort filter at the end
                return [...providerFilters, DEFAULT_SORT_FILTER];
            },
            cacheTTL.drama // 5 minutes (can be longer for filters)
        );

        const response: FiltersResponse = {
            provider: provider as ProviderSource,
            filters,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Filters API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch filters" },
            { status: 500 }
        );
    }
}
