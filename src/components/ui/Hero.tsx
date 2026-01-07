"use client";

import { Play, Plus, Star } from "lucide-react";
import useSWR from "swr";
import Link from "next/link";
import { useState, useEffect } from "react";
import { HeroItem } from "@/lib/services/hero/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface HeroProps {
    initialData?: HeroItem[];
}

export function Hero({ initialData = [] }: HeroProps) {
    // Use SWR with fallbackData for background refresh
    const { data: fullResponse } = useSWR<{ success: boolean; data: HeroItem[] }>(
        '/api/home/hero',
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 600000,
            fallbackData: initialData.length ? { success: true, data: initialData } : undefined,
        }
    );

    const [activeIndex, setActiveIndex] = useState(0);

    // Use initialData immediately if available, then SWR data
    const heroItems = fullResponse?.data?.length ? fullResponse.data : initialData;
    const activeItem = heroItems[activeIndex] || null;

    // Auto-rotate hero items every 10 seconds
    useEffect(() => {
        if (heroItems.length <= 1) return;

        const interval = setInterval(() => {
            setActiveIndex((current) => (current + 1) % heroItems.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [heroItems.length]);

    // Reset index if items change and current index is out of bounds
    useEffect(() => {
        if (activeIndex >= heroItems.length && heroItems.length > 0) {
            setActiveIndex(0);
        }
    }, [heroItems.length, activeIndex]);

    // Default Fallback (Emergency Static) - only if no data at all
    const displayItem = activeItem || {
        id: "default",
        title: "FATED HEARTS",
        cover: "https://image.tmdb.org/t/p/original/sRLC052ieEafQN95VcK8i0TS9Js.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/sRLC052ieEafQN95VcK8i0TS9Js.jpg",
        provider: "dramabox" as const,
        score: 9.8,
        year: 2025,
        episodeCount: "38 Episodes",
        tags: ["Costume", "Romance"],
        description: `"Fated Hearts" is a romance period drama directed by Chu Yuibun.`
    };

    return (
        <section className="relative h-[85vh] w-full overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
                <div key={displayItem.id} className="relative w-full h-full animate-fadeIn">
                    <img
                        src={displayItem.backdrop || displayItem.cover}
                        alt={displayItem.title}
                        className="w-full h-full object-cover object-center"
                        loading="eager"
                        fetchPriority="high"
                    />
                    {/* Gradient Overlays */}
                    {/* Side fade for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                    {/* Bottom fade for seamless content transition */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121418] via-transparent to-transparent" />
                </div>
            </div>

            {/* Content */}
            <div className="relative container mx-auto px-4 h-full flex flex-col justify-center pb-10">
                <div className="max-w-2xl space-y-6">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
                        {activeIndex === 0 && <span className="bg-[#00cc55] text-black px-1.5 py-0.5 rounded">Top 1</span>}
                        <span className="bg-[#1f2126] text-[#00cc55] px-1.5 py-0.5 rounded border border-[#00cc55]/30">
                            {displayItem.provider === 'netshort' ? 'NetShort' :
                                displayItem.provider === 'flickreels' ? 'FlickReels' :
                                    displayItem.provider === 'melolo' ? 'Melolo' : 'DramaBox'}
                        </span>
                        {displayItem.isVip && <span className="bg-yellow-500 text-black px-1.5 py-0.5 rounded">VIP</span>}
                        {displayItem.tags?.slice(0, 2).map(tag => (
                            <span key={tag} className="bg-white/10 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">{tag}</span>
                        ))}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white drop-shadow-lg line-clamp-2">
                        {displayItem.title}
                    </h1>

                    {/* Metadata Line */}
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                        {displayItem.score && (
                            <div className="flex items-center gap-1 text-[#00cc55]">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-bold">{displayItem.score}</span>
                            </div>
                        )}
                        {displayItem.year && <span>{displayItem.year}</span>}
                        <span className="border border-gray-600 px-1 rounded text-xs">13+</span>
                        {displayItem.episodeCount && <span>{displayItem.episodeCount}</span>}
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm md:text-base line-clamp-2 max-w-xl drop-shadow-md">
                        {displayItem.description || "No description available."}
                    </p>

                    {/* Buttons */}
                    <div className="flex items-center gap-4 pt-4">
                        <Link href={`/watch/${displayItem.id}?provider=${displayItem.provider}`}>
                            <button className="w-14 h-14 bg-[#00cc55] hover:bg-[#00b34a] rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-green-500/20 group">
                                <Play className="w-6 h-6 fill-black text-black ml-1" />
                            </button>
                        </Link>
                        <button className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-transform active:scale-95 border border-white/10">
                            <Plus className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                {/* Carousel Indicators (if multiple items) */}
                {heroItems.length > 1 && (
                    <div className="absolute bottom-8 right-4 md:right-10 flex gap-2">
                        {heroItems.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? "w-8 bg-[#00cc55]" : "w-2 bg-gray-600 hover:bg-gray-400"}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-in-out;
                }
            `}</style>
        </section>
    );
}
