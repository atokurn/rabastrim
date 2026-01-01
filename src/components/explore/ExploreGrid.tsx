"use client";

import Link from "next/link";
import { useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { ExploreItem } from "@/lib/explore";

interface ExploreGridProps {
    items: ExploreItem[];
    isLoading?: boolean;
    isLoadingMore?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

// Skeleton card for loading state
function SkeletonCard() {
    return (
        <div className="animate-pulse">
            <div className="aspect-[3/4] bg-[#1f2126] rounded-lg" />
            <div className="mt-2 h-4 bg-[#1f2126] rounded w-3/4" />
        </div>
    );
}

export function ExploreGrid({
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    onLoadMore,
}: ExploreGridProps) {
    const sentinelRef = useRef<HTMLDivElement>(null);

    // IntersectionObserver for infinite scroll
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !isLoadingMore && onLoadMore) {
                onLoadMore();
            }
        },
        [hasMore, isLoadingMore, onLoadMore]
    );

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: "200px", // Start loading 200px before reaching bottom
            threshold: 0,
        });

        observer.observe(sentinel);

        return () => {
            observer.unobserve(sentinel);
        };
    }, [handleObserver]);

    // Loading skeleton
    if (isLoading && items.length === 0) {
        return (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    // Empty state
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <p className="text-gray-400 text-center">
                    Tidak ada konten ditemukan
                </p>
                <p className="text-gray-500 text-sm mt-2">
                    Coba filter atau source lain
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            {/* Grid */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {items.map((item, index) => (
                    <Link
                        key={`${item.source}-${item.id}-${index}`}
                        href={`/watch/${item.id}?provider=${item.source}&title=${encodeURIComponent(item.title)}`}
                        className="group flex flex-col gap-2"
                    >
                        <div className="aspect-[3/4] bg-[#1f2126] rounded-lg overflow-hidden relative">
                            {item.poster ? (
                                <img
                                    src={item.poster}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                                    No Image
                                </div>
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                            {/* Episode overlay (Bottom Left) */}
                            {item.episodes && (
                                <div className="absolute bottom-1.5 left-1.5 text-white text-[10px] font-medium">
                                    Full {item.episodes} Episode
                                </div>
                            )}

                            {/* Top Right Badges */}
                            <div className="absolute top-1.5 right-1.5 flex flex-col items-end gap-1">
                                {item.isVip && (
                                    <div className="bg-[#00cc55] text-black text-[8px] font-bold px-1.5 py-0.5 rounded-sm">
                                        Eksklusif
                                    </div>
                                )}
                                <div className="bg-black/40 backdrop-blur-sm text-white text-[8px] px-1 py-0.5 rounded-sm flex items-center gap-0.5">
                                    <span className="w-1 h-1 rounded-full bg-white"></span> Dolby
                                </div>
                            </div>

                            {/* Top Left Badge (Ranking/Status) */}
                            {item.score && (
                                <div className="absolute top-1.5 left-1.5 bg-[#ff4d4f] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm">
                                    TOP {item.score > 9 ? "10" : item.score}
                                </div>
                            )}
                        </div>

                        <div className="space-y-0.5">
                            <h4 className="text-gray-200 text-xs line-clamp-2 leading-tight group-hover:text-[#00cc55] transition-colors">
                                {item.title}
                            </h4>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Sentinel element for IntersectionObserver */}
            <div ref={sentinelRef} className="h-4" />

            {/* Loading indicator */}
            {isLoadingMore && (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-[#00cc55]" />
                </div>
            )}

            {/* Manual load more fallback (optional) */}
            {hasMore && !isLoadingMore && (
                <button
                    onClick={onLoadMore}
                    className="w-full py-3 text-gray-400 text-sm border border-gray-700 rounded-lg hover:border-[#00cc55] hover:text-[#00cc55] transition-colors flex items-center justify-center gap-2"
                >
                    <span>Muat lebih banyak</span>
                </button>
            )}
        </div>
    );
}
