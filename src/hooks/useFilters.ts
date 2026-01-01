"use client";

import useSWR from "swr";
import { FiltersResponse, FilterGroup, ProviderSource } from "@/lib/explore";

const fetcher = (url: string) => fetch(url).then(res => res.json());

/**
 * Hook for fetching dynamic filters per provider
 * Uses SWR with long cache time since filters rarely change
 */
export function useFilters(provider: ProviderSource) {
    const { data, error, isLoading } = useSWR<FiltersResponse>(
        `/api/filters/${provider}`,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 3600000, // 1 hour deduping
            revalidateIfStale: false,
        }
    );

    return {
        filters: data?.filters || [],
        isLoading,
        error,
    };
}

/**
 * Helper to get current filter value from URL
 */
export function getFilterValue(
    searchParams: URLSearchParams,
    filters: FilterGroup[],
    key: string
): string {
    return searchParams.get(key) || "";
}
