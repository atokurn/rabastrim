"use client";

import { useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROVIDERS, ProviderSource } from "@/lib/explore";

interface ExploreTabsProps {
    className?: string;
}

export function ExploreTabs({ className }: ExploreTabsProps) {
    const searchParams = useSearchParams();
    const currentSource = (searchParams.get("source") || "dramabox") as ProviderSource;
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth / 2 : current.offsetWidth / 2;
            current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <div className={cn("sticky top-16 z-40 bg-[#0d0f14]/95 backdrop-blur-md border-b border-[#1f2126] py-3 group/nav", className)}>
            <div className="container mx-auto px-4 relative">
                {/* Scroll Buttons */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 p-2 rounded-full text-white backdrop-blur-sm opacity-0 group-hover/nav:opacity-100 transition-opacity hidden md:block hover:bg-black/80 hover:scale-110 active:scale-95"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 p-2 rounded-full text-white backdrop-blur-sm opacity-0 group-hover/nav:opacity-100 transition-opacity hidden md:block hover:bg-black/80 hover:scale-110 active:scale-95"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>

                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto scrollbar-hide gap-3 px-1"
                >
                    {PROVIDERS.filter(p => p.enabled).map((provider) => {
                        const isActive = currentSource === provider.id;
                        return (
                            <Link
                                key={provider.id}
                                href={`/explore?source=${provider.id}`}
                                className={cn(
                                    "flex-shrink-0 px-4 py-1.5 rounded-sm text-sm font-medium transition-all duration-300 whitespace-nowrap",
                                    isActive
                                        ? "bg-[#00cc55] text-black font-bold shadow-lg shadow-green-500/20"
                                        : "bg-[#1f2126] text-gray-400 hover:text-white hover:bg-[#2a2d32] border border-transparent"
                                )}
                            >
                                {provider.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
