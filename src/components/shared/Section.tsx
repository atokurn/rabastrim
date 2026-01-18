"use client";

import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/use-translation";

interface VideoItem {
    id: string;
    title: string;
    image: string;
    badge?: string;
    progress?: number; // 0-100 for continue watching
    episodes?: string;
    isNew?: boolean;
    isVip?: boolean;
    provider?: string; // dramabox, netshort, melolo, anime
}

interface SectionProps {
    title: string;
    items: VideoItem[];
    variant?: "portrait" | "landscape"; // Portrait for dramas, landscape for continue watching usually
    useTranslation?: boolean; // If true, title is treated as a translation key
}

export function Section({ title, items, variant = "portrait", useTranslation: shouldTranslate = false }: SectionProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    // Translate title if it looks like a translation key (contains '.')
    const displayTitle = shouldTranslate || title.includes('.') ? t(title) : title;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth / 2 : current.offsetWidth / 2;
            current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <section className="py-6 space-y-4 group/section">
            <div className="container mx-auto px-4 flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    {displayTitle}
                    <span className="text-gray-500 text-sm font-normal cursor-pointer hover:text-white transition-colors ml-2">{t("common.more")} &gt;</span>
                </h2>
            </div>

            <div className="relative group/slider">
                {/* Left Button - Only visible on desktop hover */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 p-3 rounded-full text-white backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 transition-opacity hidden md:block hover:bg-black/80 hover:scale-110 active:scale-95"
                    aria-label="Scroll left"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Right Button - Only visible on desktop hover */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 p-3 rounded-full text-white backdrop-blur-sm opacity-0 group-hover/slider:opacity-100 transition-opacity hidden md:block hover:bg-black/80 hover:scale-110 active:scale-95"
                    aria-label="Scroll right"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-4 px-4 pb-4 md:px-8 snap-x snap-mandatory scrollbar-hide"
                >
                    {items.map((item, idx) => (
                        <Link
                            key={item.id}
                            href={`/watch/${item.id}?provider=${item.provider || "dramabox"}`}
                            className={cn(
                                "flex-shrink-0 relative group cursor-pointer snap-start transition-transform hover:scale-105 duration-300",
                                variant === "portrait" ? "w-[140px] md:w-[200px]" : "w-[240px] md:w-[300px]"
                            )}
                        >

                            {/* Image Container */}
                            <div className={cn(
                                "relative overflow-hidden rounded-lg bg-[#1f2126]",
                                variant === "portrait" ? "aspect-[3/4]" : "aspect-video"
                            )}>
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2a2d32] to-[#1a1c20]">
                                        <span className="text-gray-500 text-xs text-center px-2">{item.title}</span>
                                    </div>
                                )}

                                {/* Badges */}
                                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                    {item.isVip && (
                                        <span className="bg-[#cba46a] text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">VIP</span>
                                    )}
                                    {item.badge && (
                                        <span className={cn(
                                            "text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm",
                                            item.badge.includes("TOP") ? "bg-[#00cc55] text-black" : "bg-red-600"
                                        )}>
                                            {item.badge}
                                        </span>
                                    )}
                                </div>

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Play className="w-10 h-10 fill-white text-white drop-shadow-lg" />
                                </div>

                                {/* Progress Bar for Continue Watching variant */}
                                {variant === "landscape" && item.progress !== undefined && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                        <div
                                            className="h-full bg-[#00cc55]"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                )}

                                {/* Episode Info Overlay */}
                                {variant === "portrait" && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                                        <p className="text-xs text-gray-300">
                                            {item.episodes ? item.episodes : "Updated to 10"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Title & Meta */}
                            <div className="mt-2 space-y-1">
                                <h3 className="text-sm md:text-base font-medium text-white line-clamp-1 group-hover:text-[#00cc55] transition-colors">
                                    {item.title}
                                </h3>
                                {variant === "landscape" && (
                                    <p className="text-xs text-gray-400">Continue watching Ep 5</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
