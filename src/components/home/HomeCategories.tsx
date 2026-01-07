"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HomeCategoriesProps {
    categories: string[];
    activeCategory: string;
    onSelect: (category: string) => void;
}

export function HomeCategories({ categories, activeCategory, onSelect }: HomeCategoriesProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth / 2 : current.offsetWidth / 2;
            current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <div className="sticky top-[60px] z-30 bg-[#121418]/95 backdrop-blur-md border-b border-gray-800/50 py-3 group/nav">
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
                    className="flex overflow-x-auto gap-3 scrollbar-hide snap-x px-8"
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => onSelect(category)}
                            className={cn(
                                "flex-shrink-0 px-4 py-1.5 rounded-sm text-sm font-medium transition-all duration-300 snap-start whitespace-nowrap",
                                activeCategory === category
                                    ? "bg-[#00cc55] text-black font-bold shadow-lg shadow-green-500/20"
                                    : "bg-[#1f2126] text-gray-400 hover:text-white hover:bg-[#2a2d32] border border-transparent"
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
