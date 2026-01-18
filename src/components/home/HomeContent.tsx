"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MovieCard } from "@/components/user/MovieCard";
import { MovieCardSkeleton } from "@/components/user/MovieCardSkeleton";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

interface HomeContentProps {
    category: string;
}

interface ContentItem {
    id: string;
    title: string;
    image: string;
    episodes?: string;
    provider: string;
    createdAt?: string;
}

interface APIResponse {
    success: boolean;
    data: ContentItem[];
    nextCursor: string | null;
    hasMore: boolean;
}

export function HomeContent({ category }: HomeContentProps) {
    const observerRef = useRef<HTMLDivElement | null>(null);
    const { language, isHydrated } = useTranslation();

    // Cursor-based state
    const [items, setItems] = useState<ContentItem[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Fetch function using cursor
    const fetchData = useCallback(async (cursorValue: string | null, reset: boolean = false) => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                limit: "24",
                category: category,
                lang: language, // Pass user's language preference
            });
            if (cursorValue) {
                params.set("cursor", cursorValue);
            }

            const res = await fetch(`/api/explore/all-dramas?${params}`);
            const json: APIResponse = await res.json();

            if (json.success) {
                if (reset) {
                    setItems(json.data);
                } else {
                    setItems(prev => [...prev, ...json.data]);
                }
                setCursor(json.nextCursor);
                setHasMore(json.hasMore);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
            setIsInitialLoad(false);
        }
    }, [category, language, isLoading]);

    // Reset when category or language changes - only fetch after hydration
    useEffect(() => {
        if (!isHydrated) return; // Wait for hydration to get correct language

        setItems([]);
        setCursor(null);
        setHasMore(true);
        setIsInitialLoad(true);
        fetchData(null, true);
    }, [category, language, isHydrated]); // Reset when category, language changes, or hydration completes

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoading && hasMore && !isInitialLoad) {
                    fetchData(cursor);
                }
            },
            { threshold: 0.1, rootMargin: "200px" }
        );

        const currentRef = observerRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.disconnect();
            }
        };
    }, [cursor, isLoading, hasMore, isInitialLoad, fetchData]);

    if (isInitialLoad) {
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
                {items.map((item, index) => (
                    <div key={`${item.provider}-${item.id}-${index}`} className="w-full">
                        <MovieCard
                            id={item.id}
                            title={item.title}
                            cover={item.image}
                            provider={item.provider}
                        />
                    </div>
                ))}
            </div>

            {/* Loading / End Status */}
            <div ref={observerRef} className="flex justify-center py-8 w-full">
                {isLoading && items.length > 0 ? (
                    <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                ) : !hasMore && items.length > 0 ? (
                    <span className="text-gray-600 text-sm">No more items</span>
                ) : null}
            </div>

            {items.length === 0 && !isLoading && (
                <div className="text-center py-20 text-gray-500">
                    No contents found for this category.
                </div>
            )}
        </div>
    );
}
