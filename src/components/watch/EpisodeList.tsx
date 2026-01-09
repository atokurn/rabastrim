"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface EpisodeListProps {
    totalEpisodes: number;
    currentEpisode: number;
    dramaId: string;
    provider: string;
    gridClassName?: string;
    maxHeightClassName?: string;
}

export function EpisodeList({
    totalEpisodes,
    currentEpisode,
    dramaId,
    provider,
    gridClassName = "grid-cols-5",
    maxHeightClassName = "max-h-[500px]"
}: EpisodeListProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const activeEpRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        // Debounce slightly to ensure layout is ready
        const timer = setTimeout(() => {
            if (activeEpRef.current && containerRef.current) {
                const container = containerRef.current;
                const element = activeEpRef.current;

                // Robust scroll calculation using viewports coordinates
                const containerRect = container.getBoundingClientRect();
                const elementRect = element.getBoundingClientRect();
                const currentScroll = container.scrollTop;
                const relativeTop = elementRect.top - containerRect.top;

                container.scrollTo({
                    top: currentScroll + relativeTop - (container.clientHeight / 2) + (element.clientHeight / 2),
                    behavior: 'smooth'
                });
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [currentEpisode]);

    if (totalEpisodes === 0) {
        return (
            <div className="text-center text-gray-400 py-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading episodes...
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "grid gap-2 overflow-y-auto pr-2 custom-scrollbar",
                gridClassName,
                maxHeightClassName
            )}
        >
            {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map(epNum => (
                <Link
                    key={epNum}
                    replace
                    ref={epNum === currentEpisode ? activeEpRef : null}
                    href={`/watch/${dramaId}?ep=${epNum}&provider=${provider}`}
                    className={cn(
                        "aspect-square rounded flex items-center justify-center text-sm font-medium transition-colors border",
                        currentEpisode === epNum
                            ? "bg-[#00cc55] text-black border-[#00cc55] font-bold"
                            : "bg-[#2e3036] text-gray-300 border-transparent hover:border-gray-500"
                    )}
                >
                    {epNum}
                </Link>
            ))}
        </div>
    );
}
