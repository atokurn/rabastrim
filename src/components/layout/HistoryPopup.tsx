"use client";

import { useUserStore } from "@/lib/auth/store";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryPopupProps {
    isVisible: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export function HistoryPopup({ isVisible, onMouseEnter, onMouseLeave }: HistoryPopupProps) {
    const { history } = useUserStore();
    const recentHistory = history.slice(0, 4); // Show top 4 items

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "absolute top-full right-0 mt-2 w-80 bg-[#1a1c22] rounded-lg shadow-xl border border-gray-800 overflow-hidden z-50 transition-opacity duration-200",
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Arrow pointing up */}
            <div className="absolute -top-1.5 right-6 w-3 h-3 bg-[#1a1c22] border-t border-l border-gray-800 transform rotate-45" />

            <div className="p-4">
                {recentHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-[#1a1c22]">
                        <History className="w-8 h-8 text-gray-600 mb-2" />
                        <p className="text-gray-400 text-sm">No history yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentHistory.map((item) => (
                            <Link
                                key={item.id}
                                href={`/watch/${item.provider}/${item.bookId}${item.episode ? `/${item.episode}` : ''}`}
                                className="flex gap-3 group"
                            >
                                <div className="relative w-24 h-14 shrink-0 rounded overflow-hidden">
                                    <Image
                                        src={item.cover}
                                        alt={item.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h4 className="text-white text-sm font-medium truncate group-hover:text-[#00cc55] transition-colors">
                                        {item.title}
                                    </h4>
                                    <div className="mt-1">
                                        <p className="text-gray-400 text-xs mb-1">
                                            Watched Up to Ep {item.episode || 1}
                                        </p>
                                        <div className="w-full h-0.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#00cc55]"
                                                style={{ width: `${item.progress || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <Link
                href="/history"
                className="block w-full py-3 text-center bg-[#23252b] text-gray-400 hover:text-white hover:bg-[#2a2d35] transition-colors text-sm font-medium border-t border-gray-800"
            >
                <span className="flex items-center justify-center gap-1">
                    More <ChevronRight className="w-4 h-4" />
                </span>
            </Link>
        </div>
    );
}
