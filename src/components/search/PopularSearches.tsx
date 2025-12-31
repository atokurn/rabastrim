"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PopularItem {
    id: string;
    title: string;
    cover: string;
    rank: number;
    episodes?: number;
    playCount?: string;
    provider: string;
}

interface PopularSearchesProps {
    items: PopularItem[];
    isLoading?: boolean;
    variant?: "default" | "sidebar";
}

export function PopularSearches({ items, isLoading, variant = "default" }: PopularSearchesProps) {
    const isSidebar = variant === "sidebar";

    if (isLoading) {
        return (
            <div className={cn("py-4", isSidebar ? "" : "px-4")}>
                <h3 className="text-white text-sm font-medium mb-4">Pencarian populer</h3>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 animate-pulse">
                            <div className="w-8 h-8 bg-gray-700 rounded" />
                            {!isSidebar && <div className="w-24 h-16 bg-gray-700 rounded" />}
                            <div className="flex-1 h-4 bg-gray-700 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (items.length === 0) return null;

    // Sidebar variant - simple list like iQIYI desktop
    if (isSidebar) {
        return (
            <div className="bg-[#1a1c22] rounded-lg p-4">
                <h3 className="text-white text-sm font-bold mb-4">Popular Searches</h3>
                <ul className="space-y-3">
                    {items.slice(0, 10).map((item) => (
                        <li key={`${item.provider}-${item.id}`}>
                            <Link
                                href={`/watch/${item.id}?provider=${item.provider}`}
                                className="flex items-center gap-3 group"
                            >
                                {/* Rank */}
                                <span
                                    className={cn(
                                        "w-5 text-sm font-bold",
                                        item.rank <= 3 ? "text-[#00cc55]" : "text-gray-500"
                                    )}
                                >
                                    {item.rank}
                                </span>
                                {/* Title */}
                                <span className="text-gray-300 text-sm group-hover:text-[#00cc55] transition-colors line-clamp-1">
                                    {item.title}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    // Default variant - full cards with thumbnails (mobile style)
    return (
        <div className="px-4 py-4">
            <h3 className="text-white text-sm font-medium mb-4">Pencarian populer</h3>
            <div className="space-y-3">
                {items.map((item) => (
                    <Link
                        key={`${item.provider}-${item.id}`}
                        href={`/watch/${item.id}?provider=${item.provider}`}
                        className="flex items-center gap-4 group"
                    >
                        {/* Rank Badge */}
                        <div
                            className={cn(
                                "w-7 h-7 flex items-center justify-center rounded text-sm font-bold shrink-0",
                                item.rank <= 3
                                    ? "bg-[#00cc55] text-black"
                                    : "bg-[#2a2d32] text-gray-400"
                            )}
                        >
                            {item.rank}
                        </div>

                        {/* Thumbnail */}
                        <div className="w-28 h-16 bg-[#1f2126] rounded overflow-hidden relative shrink-0">
                            {item.cover ? (
                                <img
                                    src={item.cover}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600">
                                    No Image
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-[#00cc55] transition-colors">
                                {item.title}
                            </h4>
                        </div>

                        {/* Play Button */}
                        <button className="p-2 text-gray-400 group-hover:text-[#00cc55] transition-colors shrink-0">
                            <Play className="w-6 h-6" />
                        </button>
                    </Link>
                ))}
            </div>
        </div>
    );
}
