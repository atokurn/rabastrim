"use client";

import { useEffect, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { MovieCard } from "@/components/user/MovieCard";
import { MovieCardSkeleton } from "@/components/user/MovieCardSkeleton";
import { Loader2 } from "lucide-react";

interface HomeContentProps {
    category: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function HomeContent({ category }: HomeContentProps) {
    const observerRef = useRef<HTMLDivElement | null>(null);

    // Define SWR key generator
    const getKey = (pageIndex: number, previousPageData: any) => {
        // If previous page was empty, stop fetching
        if (previousPageData && (previousPageData.data?.length === 0 || !previousPageData.hasMore)) return null;
        return `/api/home/list?category=${encodeURIComponent(category)}&page=${pageIndex + 1}`;
    };

    const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, {
        revalidateFirstPage: false,
        revalidateOnFocus: false,
        persistSize: true, // Keep page size when key changes? No, likely want reset.
    });

    // Flatten data
    const items = data ? data.flatMap((page) => page.data || []) : [];
    const isLoadingInitial = !data && isValidating;
    const isLoadingMore = size > 0 && data && typeof data[size - 1] === "undefined";
    const isEmpty = data?.[0]?.data?.length === 0;
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.length === 0 || data && !data[data.length - 1]?.hasMore);

    // Reset size when category changes (SWR handles key change, but we might want to ensure we start fresh)
    // Actually SWR handles separate cache by key, so switching category naturally switches data.

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isValidating && !isReachingEnd) {
                    setSize((prev) => prev + 1);
                }
            },
            { threshold: 1.0, rootMargin: "100px" }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.disconnect();
            }
        };
    }, [isValidating, isReachingEnd, setSize]);

    if (isLoadingInitial) {
        return (
            <div className="container mx-auto px-4 pb-20">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <MovieCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pb-20">
            {/* Grid */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {items.map((item: any, index: number) => (
                    <div key={`${item.provider}-${item.id}-${index}`} className="w-full">
                        <MovieCard
                            id={item.id}
                            title={item.title}
                            cover={item.image}
                            provider={item.provider}
                            episode={item.episodes ? parseInt(item.episodes) : undefined}
                        />
                    </div>
                ))}
            </div>

            {/* Loading / End Status */}
            <div ref={observerRef} className="flex justify-center py-8 w-full">
                {isValidating && !isLoadingInitial ? (
                    <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                ) : isReachingEnd && items.length > 0 ? (
                    <span className="text-gray-600 text-sm">No more items </span>
                ) : null}
            </div>

            {isEmpty && (
                <div className="text-center py-20 text-gray-500">
                    No contents found for this category.
                </div>
            )}
        </div>
    );
}
