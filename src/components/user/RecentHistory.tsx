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
            <Link href="/history" className="flex items-center justify-between px-1 group cursor-pointer">
                <h2 className="text-lg font-bold text-white group-hover:text-green-500 transition-colors">Bacaan Terakhir</h2>
                <div className="text-gray-400 group-hover:text-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                </div>
            </Link>

            {recentItems.length > 0 ? (
                <div className="bg-[#1f2126] p-4 rounded-xl">
                    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible md:gap-4 md:pb-0">
                        {recentItems.map((item) => (
                            <div key={item.id} className="min-w-[110px] w-[110px] snap-start md:w-full md:min-w-0">
                                <MovieCard
                                    id={item.bookId}
                                    title={item.title}
                                    cover={item.cover}
                                    provider={item.provider}
                                    episode={item.episode}
                                    progress={item.progress}
                                    type="history"
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
