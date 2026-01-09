"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MovieCard } from "@/components/user/MovieCard";
import { MovieCardSkeleton } from "@/components/user/MovieCardSkeleton";
import { Loader2, RefreshCw } from "lucide-react";

interface ExploreFeedSectionProps {
    provider: string;
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
    error?: string;
}

/**
 * Custom hook for fetching explore feed data with cursor-based pagination
 */
function useExploreFeed(provider: string) {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (cursorValue: string | null, reset: boolean = false) => {
        if (isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                limit: "24",
                provider: provider,
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
            } else {
                setError(json.error || "Gagal memuat data");
            }
        } catch (err) {
            console.error("Failed to fetch data:", err);
            setError("Terjadi kesalahan jaringan");
        } finally {
            setIsLoading(false);
            setIsInitialLoad(false);
        }
    }, [provider, isLoading]);

    const reset = useCallback(() => {
        setItems([]);
        setCursor(null);
        setHasMore(true);
        setIsInitialLoad(true);
        setError(null);
    }, []);

    const retry = useCallback(() => {
        if (items.length === 0) {
            reset();
            fetchData(null, true);
        } else {
            fetchData(cursor);
        }
    }, [items.length, cursor, reset, fetchData]);

    return {
        items,
        cursor,
        hasMore,
        isLoading,
        isInitialLoad,
        error,
        fetchData,
        reset,
        retry,
    };
}

export function ExploreFeedSection({ provider }: ExploreFeedSectionProps) {
    const observerRef = useRef<HTMLDivElement | null>(null);
    const {
        items,
        cursor,
        hasMore,
        isLoading,
        isInitialLoad,
        error,
        fetchData,
        reset,
        retry,
    } = useExploreFeed(provider);

    // Reset and fetch when provider changes
    useEffect(() => {
        reset();
        fetchData(null, true);
    }, [provider]); // eslint-disable-line react-hooks/exhaustive-deps

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoading && hasMore && !isInitialLoad && !error) {
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
    }, [cursor, isLoading, hasMore, isInitialLoad, error, fetchData]);

    // Get provider display name
    const getProviderName = (p: string) => {
        const names: Record<string, string> = {
            dramabox: "DramaBox",
            flickreels: "FlickReels",
            melolo: "Melolo",
            dramawave: "DramaWave",
            dramaqueen: "Drama Queen",
            donghua: "Donghua",
            anime: "Anime",
        };
        return names[p] || p;
    };

    return (
        <section className="mt-8 px-4">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📺</span>
                <h2 className="text-lg font-bold text-white">
                    Lihat Semua {getProviderName(provider)}
                </h2>
            </div>

            {/* Skeleton Loader for Initial Load */}
            {isInitialLoad && (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <MovieCardSkeleton key={i} />
                    ))}
                </div>
            )}

            {/* Error State */}
            {error && !isInitialLoad && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <p className="mb-4">{error}</p>
                    <button
                        onClick={retry}
                        className="flex items-center gap-2 px-4 py-2 bg-[#00cc55] text-black font-medium rounded-lg hover:bg-[#00aa44] transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Coba Lagi
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!isInitialLoad && !error && items.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    Belum ada drama untuk provider ini.
                </div>
            )}

            {/* Grid */}
            {!isInitialLoad && items.length > 0 && (
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
            )}

            {/* Loading / End Status */}
            <div ref={observerRef} className="flex justify-center py-8 w-full">
                {isLoading && items.length > 0 ? (
                    <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                ) : !hasMore && items.length > 0 ? (
                    <span className="text-gray-600 text-sm">Tidak ada lagi drama</span>
                ) : null}
            </div>
        </section>
    );
}
