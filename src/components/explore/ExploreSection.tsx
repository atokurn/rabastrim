"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { SectionConfig } from "@/lib/explore/sections";
import { ExploreItem } from "@/lib/explore";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/use-translation";

interface ExploreSectionProps {
    section: SectionConfig;
}

// Card component for each item
function SectionCard({
    item,
    index,
    variant,
    layout,
    imageType = "portrait"
}: {
    item: ExploreItem;
    index: number;
    variant?: "portrait" | "landscape" | "ranking";
    layout?: "carousel" | "grid" | "ranking-list";
    imageType?: "portrait" | "landscape";
}) {
    const isRanking = variant === "ranking";
    const isRankingList = layout === "ranking-list";

    // Always use portrait poster
    const imageSrc = item.poster;

    if (isRankingList) {
        return (
            <Link
                href={`/watch/${item.id}?provider=${item.source}`}
                className="flex items-center gap-4 py-3 group border-b border-[#1f2126] last:border-0"
            >
                {/* Ranking Index */}
                <div className={cn(
                    "w-8 text-2xl font-black italic",
                    index < 3 ? "text-purple-500" : "text-gray-600"
                )}>
                    {index + 1}
                </div>

                {/* Poster (List Style) */}
                <div className="relative w-16 h-20 rounded overflow-hidden bg-[#1f2126] flex-shrink-0">
                    {imageSrc ? (
                        <Image
                            src={imageSrc}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">N/A</div>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-semibold truncate group-hover:text-purple-400 transition-colors">
                        {item.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                        {item.views && (
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                {item.views}
                            </span>
                        )}
                        {item.score && (
                            <span className="text-[11px] text-yellow-500 flex items-center gap-1">
                                ⭐ {item.score}
                            </span>
                        )}
                    </div>
                    {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {item.tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className="text-[10px] bg-[#1f2126] text-gray-400 px-1 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </Link>
        );
    }

    // Width classes for Grid/Carousel - Use larger portrait cards
    const widthClass = layout === "grid"
        ? "w-full"
        : isRanking
            ? "w-[140px] sm:w-[160px]"
            : "w-[160px] sm:w-[180px]"; // Larger portrait cards

    // Aspect ratio - Always use portrait for cards
    const aspectClass = "aspect-[2/3]";

    return (
        <Link
            href={`/watch/${item.id}?provider=${item.source}`}
            className={cn("flex-shrink-0 group relative", widthClass)}
        >
            {/* Ranking Number (only for ranking variant in carousel) */}
            {isRanking && layout !== "grid" && (
                <div className="absolute -left-2 -bottom-4 z-10 text-[60px] font-black text-[#ffffff] opacity-80"
                    style={{
                        textShadow: '2px 2px 0px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                        fontFamily: 'Impact, sans-serif'
                    }}>
                    {index + 1}
                </div>
            )}

            {/* Poster container */}
            <div className={cn("relative rounded-lg overflow-hidden bg-[#1f2126] mb-2", aspectClass)}>
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="180px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No Image
                    </div>
                )}

                {/* Hot Badge */}
                {item.hotBadge && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        {item.hotBadge}
                    </div>
                )}

                {/* Episode badge */}
                {item.episodes && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                        {item.episodes} Ep
                    </div>
                )}

                {/* Ranking Medal (Top 3) */}
                {isRanking && index < 3 && (
                    <div className={cn(
                        "absolute top-0 right-2 w-6 h-8 flex items-center justify-center text-white font-bold text-xs shadow-lg",
                        index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-600"
                    )} style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)' }}>
                        TOP
                    </div>
                )}

                {/* VIP badge */}
                {item.isVip && !isRanking && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                        VIP
                    </div>
                )}
            </div>

            {/* Title */}
            <p className={cn(
                "text-white text-sm font-medium line-clamp-2 group-hover:text-purple-400 transition-colors",
                isRanking ? "pl-6" : ""
            )}>
                {item.title}
            </p>

            {/* Stats for Grid layout */}
            {layout === "grid" && (
                <div className="flex items-center gap-2 mt-1 opacity-70">
                    {item.score && (
                        <span className="text-[10px] text-yellow-500">⭐ {item.score}</span>
                    )}
                    {item.views && (
                        <span className="text-[10px] text-gray-400">{item.views}</span>
                    )}
                </div>
            )}
        </Link>
    );
}

// Skeleton loader for cards
function SectionSkeleton({ variant, layout }: { variant?: string; layout?: string }) {
    const isLandscape = variant === "landscape";
    const isRankingList = layout === "ranking-list";

    if (isRankingList) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4 py-2 border-b border-[#1f2126]">
                        <div className="w-8 h-8 rounded bg-[#1f2126] animate-pulse" />
                        <div className="w-16 h-20 rounded bg-[#1f2126] animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-[#1f2126] rounded animate-pulse w-3/4" />
                            <div className="h-3 bg-[#1f2126] rounded animate-pulse w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const widthClass = layout === "grid" ? "w-full" : isLandscape ? "w-[240px] sm:w-[280px]" : "w-[120px] sm:w-[140px]";
    const aspectClass = isLandscape ? "aspect-video" : "aspect-[2/3]";

    return (
        <div className={cn(
            layout === "grid" ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4" : "flex gap-3 overflow-hidden"
        )}>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={cn("flex-shrink-0", widthClass)}>
                    <div className={cn("rounded-lg bg-[#1f2126] animate-pulse mb-2", aspectClass)} />
                    <div className="h-4 bg-[#1f2126] rounded animate-pulse" />
                </div>
            ))}
        </div>
    );
}

export default function ExploreSection({ section }: ExploreSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { t, language, isHydrated } = useTranslation();

    // Intersection Observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "400px" } // Load earlier
        );

        if (scrollRef.current) {
            observer.observe(scrollRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Fetch data with SWR (only when visible AND hydrated) - ensures correct language
    const { data: rawItems, isLoading } = useSWR(
        isVisible && isHydrated ? `section-${section.source}-${section.id}-${language}` : null,
        async () => {
            // Pass language to fetcher - DramaBox sections will use it, others ignore
            const items = await section.fetcher(language);
            if (!Array.isArray(items)) return [];

            // Auto-sync: Save fetched items to database in background
            // Only for multi-language providers (dramabox, flickreels, melolo)
            const isMultiLangProvider = ["dramabox", "flickreels", "melolo"].includes(section.source);
            if (isMultiLangProvider && items.length > 0) {
                // Trigger background sync - fire and forget
                import("@/lib/services/auto-sync").then(({ triggerBackgroundSync }) => {
                    triggerBackgroundSync(section.source, language, items);
                }).catch(err => {
                    console.error("[ExploreSection] Failed to load auto-sync:", err);
                });
            }

            return items.map(section.normalizer);
        },
        {
            revalidateOnFocus: false,
            errorRetryCount: 2,
            errorRetryInterval: 3000,
        }
    );

    const items = rawItems || [];
    const layout = section.layout || "carousel";

    return (
        <div ref={scrollRef} className="mb-10">
            {/* Section Header */}
            <div className="flex items-center justify-between px-4 mb-4">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                    {section.icon && <span className="text-xl">{section.icon}</span>}
                    <span className="capitalize">{t(`sections.${section.id}`, section.title)}</span>
                </h2>
                {/* Optional: See All Link - only if it's a carousel */}
                {layout === "carousel" && (
                    <Link href="#" className="text-xs text-purple-400 hover:text-purple-300">{t("common.see_all")}</Link>
                )}
            </div>

            {/* Layout Switcher */}
            <div className="px-4">
                {isLoading || !isVisible ? (
                    <SectionSkeleton variant={section.variant} layout={layout} />
                ) : items.length === 0 ? (
                    <p className="text-gray-500 text-sm">Tidak ada data tersedia.</p>
                ) : layout === "grid" ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 pb-2">
                        {items.slice(0, 12).map((item, index) => (
                            <SectionCard
                                key={`${item.id}-${index}`}
                                item={item}
                                index={index}
                                variant={section.variant}
                                layout={layout}
                                imageType={section.imageType}
                            />
                        ))}
                    </div>
                ) : layout === "ranking-list" ? (
                    <div className="flex flex-col pb-2">
                        {items.slice(0, 5).map((item, index) => (
                            <SectionCard
                                key={`${item.id}-${index}`}
                                item={item}
                                index={index}
                                variant={section.variant}
                                layout={layout}
                                imageType={section.imageType}
                            />
                        ))}
                    </div>
                ) : (
                    /* Default: Carousel */
                    <div className="overflow-x-auto scrollbar-hide">
                        <div className="flex gap-4 pb-2">
                            {items.map((item, index) => (
                                <SectionCard
                                    key={`${item.id}-${index}`}
                                    item={item}
                                    index={index}
                                    variant={section.variant}
                                    layout={layout}
                                    imageType={section.imageType}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
