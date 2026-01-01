"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { FilterGroup } from "@/lib/explore/types";

interface FilterBarProps {
    filters: FilterGroup[];
    isLoading?: boolean;
    className?: string;
}

export function FilterBar({ filters, isLoading, className }: FilterBarProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced filter update (300ms)
    const updateFilter = useCallback((key: string, value: string) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            // Reset page when filter changes
            params.delete("page");
            router.push(`/explore?${params.toString()}`);
        }, 300);
    }, [searchParams, router]);

    const getCurrentValue = (key: string) => searchParams.get(key) || "";

    // Skeleton loading state
    if (isLoading) {
        return (
            <div className={cn("sticky top-[95px] md:top-16 z-30 bg-[#0d0f14] border-b border-[#1f2126] px-4 py-2 flex flex-col gap-2", className)}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-2 animate-pulse">
                        <div className="h-6 w-24 bg-[#1f2126] rounded-md" />
                        <div className="h-6 w-20 bg-[#1f2126] rounded-md" />
                        <div className="h-6 w-16 bg-[#1f2126] rounded-md" />
                    </div>
                ))}
            </div>
        );
    }

    // No filters available
    if (filters.length === 0) {
        return null;
    }

    return (
        <div className={cn("sticky top-[95px] md:top-16 z-30 bg-[#0d0f14] border-b border-[#1f2126] px-4 py-2 flex flex-col gap-1", className)}>
            {filters.map((group) => {
                // Skip rendering if no options
                if (group.options.length === 0) return null;

                const currentValue = getCurrentValue(group.key);
                const isSort = group.key === "sort";

                // Sort has special styling
                if (isSort) {
                    return (
                        <div key={group.key} className="flex items-center gap-4 mt-1 border-t border-[#1f2126] pt-2">
                            {group.options.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => updateFilter(group.key, opt.id)}
                                    className={cn(
                                        "text-xs transition-all",
                                        currentValue === opt.id || (!currentValue && opt.id === "popular")
                                            ? "text-[#00cc55] font-medium"
                                            : "text-gray-400 hover:text-white"
                                    )}
                                >
                                    {opt.name}
                                </button>
                            ))}
                        </div>
                    );
                }

                // Regular filter row
                return (
                    <div
                        key={group.key}
                        className="flex items-center gap-2 whitespace-nowrap overflow-x-auto scrollbar-hide py-1"
                    >
                        {/* "All" option */}
                        <button
                            onClick={() => updateFilter(group.key, "")}
                            className={cn(
                                "text-xs px-3 py-1 rounded-md transition-all flex-shrink-0",
                                !currentValue
                                    ? "bg-[#1f2923] text-[#00cc55] font-medium border border-[#1f2923]"
                                    : "text-gray-400 hover:text-white"
                            )}
                        >
                            Semua {group.label}
                        </button>

                        {/* Filter options */}
                        {group.options.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => updateFilter(group.key, opt.id)}
                                className={cn(
                                    "text-xs px-3 py-1 rounded-md transition-all flex-shrink-0",
                                    currentValue === opt.id
                                        ? "bg-[#1f2923] text-[#00cc55] font-medium border border-[#1f2923]"
                                        : "text-gray-400 hover:text-white"
                                )}
                            >
                                {opt.name}
                            </button>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
