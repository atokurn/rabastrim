"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PROVIDERS, ProviderSource } from "@/lib/explore";

interface ExploreTabsProps {
    className?: string;
}

export function ExploreTabs({ className }: ExploreTabsProps) {
    const searchParams = useSearchParams();
    const currentSource = (searchParams.get("source") || "dramabox") as ProviderSource;

    return (
        <div className={cn("sticky top-16 z-40 bg-[#111319] border-b border-[#1f2126]", className)}>
            <div className="flex overflow-x-auto scrollbar-hide gap-1 px-4 py-3">
                {PROVIDERS.filter(p => p.enabled).map((provider) => {
                    const isActive = currentSource === provider.id;
                    return (
                        <Link
                            key={provider.id}
                            href={`/explore?source=${provider.id}`}
                            className={cn(
                                "relative px-2 py-2 text-sm font-medium whitespace-nowrap transition-all",
                                isActive
                                    ? "text-[#00cc55]"
                                    : "text-gray-400 hover:text-white"
                            )}
                        >
                            <span>{provider.name}</span>
                            {isActive && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#00cc55] rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
