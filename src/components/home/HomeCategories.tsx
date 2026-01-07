"use client";

import { cn } from "@/lib/utils";

interface HomeCategoriesProps {
    categories: string[];
    activeCategory: string;
    onSelect: (category: string) => void;
}

export function HomeCategories({ categories, activeCategory, onSelect }: HomeCategoriesProps) {
    return (
        <div className="sticky top-[60px] z-30 bg-[#121418]/95 backdrop-blur-md border-b border-gray-800/50 py-3">
            <div className="container mx-auto px-4">
                <div className="flex overflow-x-auto gap-3 scrollbar-hide snap-x">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => onSelect(category)}
                            className={cn(
                                "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 snap-start whitespace-nowrap",
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
