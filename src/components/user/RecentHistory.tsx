"use client";

import { useUserStore } from "@/lib/auth/store";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { MovieCard } from "./MovieCard";

export function RecentHistory() {
    const { history } = useUserStore();
    const recentItems = history.slice(0, 10); // Show max 10 items

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-white">Bacaan Terakhir</h2>
                <Link href="/history" className="text-gray-400 hover:text-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </Link>
            </div>

            {recentItems.length > 0 ? (
                <div className="bg-[#1f2126] p-4 rounded-xl">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                        {recentItems.map((item) => (
                            <div key={item.id} className="min-w-[100px] w-[100px] snap-start">
                                <MovieCard
                                    id={item.bookId}
                                    title={item.title}
                                    cover={item.cover}
                                    provider={item.provider}
                                    episode={item.episode}
                                    progress={item.progress}
                                    type="history"
                                    compact={true} // We might need to add this prop to MovieCard or just style it via className
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-[#1f2126] p-8 rounded-xl text-center">
                    <p className="text-gray-500 text-sm">Belum ada riwayat tontonan</p>
                </div>
            )}
        </div>
    );
}
