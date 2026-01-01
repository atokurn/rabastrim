"use client";

import useSWR from "swr";
import { useCallback, useState, useEffect } from "react";
import { ExploreItem, ExploreFilters, ProviderSource } from "@/lib/explore";

interface UseExploreDataOptions {
    source: ProviderSource;
    category?: string;
    region?: string;
    year?: string;
    status?: string;
    sort?: string;
}

interface ExploreData {
    meta: {
        page: number;
        limit: number;
        hasNext: boolean;
        total: number;
    };
    filters: ExploreFilters;
    items: ExploreItem[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useExploreData({ source, category, region, year, status, sort }: UseExploreDataOptions) {
    const [page, setPage] = useState(1);
    const [allItems, setAllItems] = useState<ExploreItem[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Build API URL with all filter params
    const params = new URLSearchParams({ source, page: String(page) });
    if (category) params.set("category", category);
    if (region) params.set("region", region);
    if (year) params.set("year", year);
    if (status) params.set("status", status);
    if (sort) params.set("sort", sort);
    const apiUrl = `/api/explore?${params.toString()}`;

    // SWR for client-side caching
    const { data, error, isLoading, mutate } = useSWR<ExploreData>(
        apiUrl,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 60000, // 1 minute deduping
            onSuccess: (newData: ExploreData) => {
                if (page === 1) {
                    setAllItems(newData.items);
                } else {
                    setAllItems(prev => [...prev, ...newData.items]);
                }
                setIsLoadingMore(false);
            },
        }
    );

    // Reset when filters change
    useEffect(() => {
        setPage(1);
        setAllItems([]);
    }, [source, category, region, year, status, sort]);

    // Load more handler
    const loadMore = useCallback(() => {
        if (data?.meta.hasNext && !isLoadingMore) {
            setIsLoadingMore(true);
            setPage(prev => prev + 1);
        }
    }, [data?.meta.hasNext, isLoadingMore]);

    // Reset handler
    const reset = useCallback(() => {
        setPage(1);
        setAllItems([]);
    }, []);

    return {
        items: page === 1 ? (data?.items || []) : allItems,
        filters: data?.filters || { categories: [], sorts: [] },
        isLoading: isLoading && page === 1,
        isLoadingMore,
        hasMore: data?.meta.hasNext ?? false,
        total: data?.meta.total ?? 0,
        error,
        loadMore,
        reset,
        mutate,
    };
}
