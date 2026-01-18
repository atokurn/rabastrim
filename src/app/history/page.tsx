"use client";

import { useUserStore, WatchedItem } from "@/lib/auth/store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { ArrowLeft, MoreHorizontal, Bookmark, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

// Helper to group items by date
function groupByDate(items: WatchedItem[]): Record<string, WatchedItem[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: Record<string, WatchedItem[]> = {
        "Hari Ini": [],
        "Kemarin": [],
        "Minggu Ini": [],
        "Sebelumnya": [],
    };

    items.forEach(item => {
        const timestamp = item.updatedAt || 0;
        const itemDate = new Date(timestamp);
        itemDate.setHours(0, 0, 0, 0);

        if (itemDate.getTime() === today.getTime()) {
            groups["Hari Ini"].push(item);
        } else if (itemDate.getTime() === yesterday.getTime()) {
            groups["Kemarin"].push(item);
        } else if (today.getTime() - itemDate.getTime() <= 7 * 24 * 60 * 60 * 1000) {
            groups["Minggu Ini"].push(item);
        } else {
            groups["Sebelumnya"].push(item);
        }
    });

    return groups;
}

export default function HistoryPage() {
    const router = useRouter();
    const { history, favorites, likes, isSyncing, syncHistoryFromServer, syncFavoritesFromServer } = useUserStore();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'history' | 'collection' | 'likes'>('history');
    const [hasSynced, setHasSynced] = useState(false);

    // Sync from server on mount
    useEffect(() => {
        if (!hasSynced) {
            Promise.all([
                syncHistoryFromServer(),
                syncFavoritesFromServer(),
            ]).then(() => setHasSynced(true));
        }
    }, [hasSynced, syncHistoryFromServer, syncFavoritesFromServer]);

    // Group items by date with translated labels
    const groupedHistory = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayLabel = t("common.today");
        const yesterdayLabel = t("common.yesterday");
        const thisWeekLabel = "This Week";
        const earlierLabel = "Earlier";

        const groups: Record<string, WatchedItem[]> = {
            [todayLabel]: [],
            [yesterdayLabel]: [],
            [thisWeekLabel]: [],
            [earlierLabel]: [],
        };

        history.forEach(item => {
            const timestamp = item.updatedAt || 0;
            const itemDate = new Date(timestamp);
            itemDate.setHours(0, 0, 0, 0);

            if (itemDate.getTime() === today.getTime()) {
                groups[todayLabel].push(item);
            } else if (itemDate.getTime() === yesterday.getTime()) {
                groups[yesterdayLabel].push(item);
            } else if (today.getTime() - itemDate.getTime() <= 7 * 24 * 60 * 60 * 1000) {
                groups[thisWeekLabel].push(item);
            } else {
                groups[earlierLabel].push(item);
            }
        });

        return groups;
    }, [history, t]);

    return (
        <div className="min-h-screen bg-black text-white pb-20 md:pt-20">
            {/* Header / Tabs */}
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
                                {t("user.history")}
                            </button>
                            <button
                                onClick={() => setActiveTab('collection')}
                                className={`${activeTab === 'collection' ? 'text-[#ffcc00]' : 'text-gray-400'}`}
                            >
                                {t("user.collection")}
                            </button>
                            <button
                                onClick={() => setActiveTab('likes')}
                                className={`${activeTab === 'likes' ? 'text-[#ffcc00]' : 'text-gray-400'}`}
                            >
                                {t("user.likes")}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isSyncing && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                        <button className="text-white">
                            <MoreHorizontal className="w-6 h-6" />
                        </button>
                    </div>
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
                                                        <span>{t("player.episode")} {item.episode || 1}</span>
                                                        <span>{t("common.progress")}: {item.progress || 0}%</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                        {history.length === 0 && (
                            <div className="text-center text-gray-500 mt-10">{t("user.no_history")}</div>
                        )}
                    </div>
                )}

                {activeTab === 'collection' && (
                    <div className="grid grid-cols-3 gap-3">
                        {favorites.length === 0 ? (
                            <div className="col-span-3 text-center text-gray-500 mt-10">{t("user.no_collection")}</div>
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
                            <div className="text-center text-gray-500 mt-10">{t("user.no_likes")}</div>
                        ) : (
                            <div>
                                <h3 className="text-gray-500 text-sm font-medium mb-3">Episode yang Disukai</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {likes.map((item) => (
                                        <Link key={item.id} href={`/watch/${item.bookId}?provider=${item.provider}&ep=${item.episode}&title=${encodeURIComponent(item.title)}&cover=${encodeURIComponent(item.cover)}`} className="block group">
                                            <div className="aspect-[3/4] rounded-lg overflow-hidden relative bg-gray-800 mb-2">
                                                <img src={item.cover} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
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
