"use client";


import { useUserStore, FavoriteItem, LikeItem } from "@/lib/auth/store";
import { ArrowLeft, MoreHorizontal, Bookmark, Heart, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MovieCard } from "@/components/user/MovieCard"; // Assuming we can reuse MovieCard or make a similar list item

export default function HistoryPage() {
    const router = useRouter();
    const { history, favorites, likes } = useUserStore();
    const [activeTab, setActiveTab] = useState<'history' | 'collection' | 'likes'>('history');

    // Group history by date (mocking "Hari Ini" for now since we store simple timestamps)
    // In a real app, we'd process `updatedAt` to group properly.
    // For now, let's put everything under "Hari Ini" if it's recent, or just render a flat list with a header.
    const groupedHistory = {
        "Hari Ini": history
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">

            {/* Header / Tabs - Adjusted top position since MobileHeader takes up space or acts as the header */}
            <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm">
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.back()} className="text-white">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="flex gap-6 text-lg font-medium">
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`${activeTab === 'history' ? 'text-[#ffcc00]' : 'text-gray-400'}`}
                            >
                                Histori
                            </button>
                            <button
                                onClick={() => setActiveTab('collection')}
                                className={`${activeTab === 'collection' ? 'text-[#ffcc00]' : 'text-gray-400'}`}
                            >
                                Koleksi
                            </button>
                            <button
                                onClick={() => setActiveTab('likes')}
                                className={`${activeTab === 'likes' ? 'text-[#ffcc00]' : 'text-gray-400'}`}
                            >
                                Suka
                            </button>
                        </div>
                    </div>
                    <button className="text-white">
                        <MoreHorizontal className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 mt-2">
                {activeTab === 'history' && (
                    <div className="flex flex-col gap-6">
                        {Object.entries(groupedHistory).map(([dateLabel, items]) => (
                            items.length > 0 && (
                                <div key={dateLabel}>
                                    <h3 className="text-gray-500 text-sm font-medium mb-3">{dateLabel}</h3>
                                    <div className="flex flex-col gap-4">
                                        {items.map((item) => (
                                            <Link
                                                key={item.id}
                                                href={`/watch/${item.bookId}?provider=${item.provider}&title=${encodeURIComponent(item.title)}&cover=${encodeURIComponent(item.cover)}&ep=${item.episode || 1}`}
                                                className="flex gap-3"
                                            >
                                                {/* Thumbnail */}
                                                <div className="relative w-24 aspect-[3/4] flex-shrink-0 rounded-lg overflow-hidden bg-gray-800">
                                                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                                                    {/* Progress Bar overlay at bottom of image */}
                                                    <div className="absolute bottom-1 left-1 right-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#00cc55]"
                                                            style={{ width: `${item.progress || 0}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Detail */}
                                                <div className="flex flex-col justify-center flex-1 min-w-0">
                                                    <h4 className="text-white text-base font-medium truncate mb-1">{item.title}</h4>
                                                    <div className="flex flex-col gap-0.5 text-xs text-gray-400">
                                                        <span>Selesai | Kelahiran kembali, Pemeran Utama Pria</span>
                                                        <span>Sedang membaca Ep.{item.episode || 1}</span>
                                                        <span>Semua episode {item.duration || 80}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                        {history.length === 0 && (
                            <div className="text-center text-gray-500 mt-10">Belum ada histori tontonan.</div>
                        )}
                    </div>
                )}

                {activeTab === 'collection' && (
                    <div className="grid grid-cols-3 gap-3">
                        {favorites.length === 0 ? (
                            <div className="col-span-3 text-center text-gray-500 mt-10">Belum ada koleksi drama.</div>
                        ) : (
                            favorites.map((item) => (
                                <Link key={item.id} href={`/watch/${item.bookId}?provider=${item.provider}&title=${encodeURIComponent(item.title)}&cover=${encodeURIComponent(item.cover)}`} className="block group">
                                    <div className="aspect-[3/4] rounded-lg overflow-hidden relative bg-gray-800 mb-2">
                                        <img src={item.cover} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                                        <div className="absolute top-1 right-1 bg-black/60 p-1 rounded-full">
                                            <Bookmark className="w-3 h-3 text-[#00cc55] fill-[#00cc55]" />
                                        </div>
                                    </div>
                                    <div className="text-xs text-white line-clamp-2">{item.title}</div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'likes' && (
                    <div className="space-y-4">
                        {likes.length === 0 ? (
                            <div className="text-center text-gray-500 mt-10">Belum ada episode yang disukai.</div>
                        ) : (
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium mb-3">Sebelumnya</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {likes.map((item) => (
                                        <Link key={item.id} href={`/watch/${item.bookId}?provider=${item.provider}&ep=${item.episode}&title=${encodeURIComponent(item.title)}&cover=${encodeURIComponent(item.cover)}`} className="block group">
                                            <div className="aspect-[3/4] rounded-lg overflow-hidden relative bg-gray-800 mb-2">
                                                <img src={item.cover} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                                                {/* Optional: Add a subtle overlay or just clean like reference */}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-xs text-white font-medium line-clamp-2 leading-tight">{item.title}</h3>
                                                <p className="text-[10px] text-gray-400">Ep.{item.episode}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
