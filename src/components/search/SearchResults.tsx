"use client";

import { Star, Play, Loader2 } from "lucide-react";
import Link from "next/link";

interface SearchResult {
    id: string;
    title: string;
    cover: string;
    description?: string;
    episodes?: number;
    score?: number;
    tags?: string[];
    type?: string;
    provider: string;
}

interface SearchPagination {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

interface SourceInfo {
    provider: string;
    count: number;
    success: boolean;
}

interface SearchResultsProps {
    results: SearchResult[];
    isLoading?: boolean;
    isLoadingMore?: boolean;
    query: string;
    pagination?: SearchPagination;
    sources?: SourceInfo[];
    onLoadMore?: () => void;
}

export function SearchResults({
    results,
    isLoading,
    isLoadingMore,
    query,
    pagination,
    sources,
    onLoadMore
}: SearchResultsProps) {
    if (isLoading && results.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#00cc55] animate-spin" />
            </div>
        );
    }

    if (results.length === 0 && query) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <p className="text-gray-400 text-center">
                    Tidak ditemukan hasil untuk &quot;{query}&quot;
                </p>
                <p className="text-gray-500 text-sm mt-2">
                    Coba kata kunci lain atau periksa ejaan
                </p>
            </div>
        );
    }

    if (results.length === 0) return null;

    // First result as featured
    const featured = results[0];
    // Rest as grid
    const gridResults = results.slice(1);

    return (
        <div className="px-4 py-4 space-y-6">
            {/* Results Header */}
            <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-between">
                    <div className="text-gray-400 text-xs uppercase tracking-wider">
                        {featured.type || "Drama"}
                    </div>
                    {pagination && (
                        <div className="text-gray-500 text-xs">
                            {pagination.total} hasil
                        </div>
                    )}
                </div>

                {/* Source Status Badges */}
                {sources && sources.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {sources.map((source) => (
                            <span
                                key={source.provider}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${source.count > 0
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-700/50 text-gray-500'
                                    }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${source.count > 0 ? 'bg-green-400' : 'bg-gray-500'
                                    }`} />
                                {source.provider}
                                {source.count > 0 && (
                                    <span className="text-gray-400">({source.count})</span>
                                )}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Featured Result Card */}
            <div className="flex gap-4">
                {/* Large Poster */}
                <Link
                    href={`/watch/${featured.id}?provider=${featured.provider}&title=${encodeURIComponent(featured.title)}&cover=${encodeURIComponent(featured.cover || '')}`}
                    className="w-32 h-44 bg-[#1f2126] rounded-lg overflow-hidden relative shrink-0 group"
                >
                    {featured.cover ? (
                        <img
                            src={featured.cover}
                            alt={featured.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                            No Image
                        </div>
                    )}
                    {featured.episodes && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-2 py-1">
                            {featured.episodes} Episode
                        </div>
                    )}
                </Link>

                {/* Info */}
                <div className="flex-1 flex flex-col min-w-0">
                    <Link
                        href={`/watch/${featured.id}?provider=${featured.provider}&title=${encodeURIComponent(featured.title)}&cover=${encodeURIComponent(featured.cover || '')}`}
                        className="text-[#00cc55] font-bold text-lg hover:underline"
                    >
                        {featured.title}
                    </Link>

                    {/* Provider Badge */}
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-purple-500/20 text-purple-400 w-fit capitalize">
                        {featured.provider}
                    </span>

                    {/* Rating & Meta */}
                    {featured.score && (
                        <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-yellow-500 text-sm font-medium">
                                {featured.score}
                            </span>
                        </div>
                    )}

                    {/* Tags/Info Line */}
                    {(featured.episodes || featured.tags) && (
                        <div className="text-gray-400 text-xs mt-2">
                            {featured.episodes && <span>Full {featured.episodes} Episode</span>}
                            {featured.tags && (() => {
                                // Handle both JSON string and array
                                const tagsArray = typeof featured.tags === 'string'
                                    ? (() => { try { return JSON.parse(featured.tags); } catch { return []; } })()
                                    : featured.tags;
                                return Array.isArray(tagsArray) && tagsArray.length > 0
                                    ? <span> | {tagsArray.slice(0, 2).join(" | ")}</span>
                                    : null;
                            })()}
                        </div>
                    )}

                    {/* Description */}
                    {featured.description && (
                        <p className="text-gray-300 text-xs mt-2 line-clamp-3">
                            <span className="text-gray-500">Sinopsis : </span>
                            {featured.description}
                        </p>
                    )}

                    {/* Play Button */}
                    <Link
                        href={`/watch/${featured.id}?provider=${featured.provider}&title=${encodeURIComponent(featured.title)}&cover=${encodeURIComponent(featured.cover || '')}`}
                        className="mt-auto inline-flex items-center justify-center gap-2 bg-[#00cc55] text-black font-bold text-sm px-6 py-2 rounded-lg hover:bg-[#00aa44] transition-colors self-start"
                    >
                        <Play className="w-4 h-4 fill-black" />
                        PUTAR SEKARANG
                    </Link>
                </div>
            </div>

            {/* Grid Results */}
            {gridResults.length > 0 && (
                <div>
                    <h3 className="text-white text-sm font-bold mb-4">
                        Kamu juga akan suka
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {gridResults.map((item) => (
                            <Link
                                key={`${item.provider}-${item.id}`}
                                href={`/watch/${item.id}?provider=${item.provider}&title=${encodeURIComponent(item.title)}&cover=${encodeURIComponent(item.cover || '')}`}
                                className="group"
                            >
                                <div className="aspect-[3/4] bg-[#1f2126] rounded-lg overflow-hidden relative">
                                    {item.cover ? (
                                        <img
                                            src={item.cover}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                                            No Image
                                        </div>
                                    )}
                                    {item.episodes && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] px-2 py-1">
                                            {item.episodes} Ep
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-white text-xs mt-2 line-clamp-2 group-hover:text-[#00cc55] transition-colors">
                                    {item.title}
                                </h4>
                                {/* Provider Tag */}
                                <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-medium rounded bg-gray-700/50 text-gray-400 capitalize">
                                    {item.provider}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Load More Button */}
            {pagination?.hasMore && onLoadMore && (
                <button
                    onClick={onLoadMore}
                    disabled={isLoadingMore}
                    className="w-full py-3 text-gray-400 text-sm border border-gray-700 rounded-lg hover:border-[#00cc55] hover:text-[#00cc55] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isLoadingMore ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <span>Lebih banyak</span>
                            <span className="text-xs">
                                ({pagination.total - results.length} lagi)
                            </span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
