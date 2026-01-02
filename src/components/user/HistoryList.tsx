"use client";

import { useUserStore } from "@/lib/auth/store";
import { Trash2, History } from "lucide-react";
import { MovieCard } from "./MovieCard";

export function HistoryList() {
    const { history, clearHistory } = useUserStore();

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <History className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-white font-medium mb-1">Belum ada riwayat</h3>
                <p className="text-gray-500 text-sm">
                    Film yang kamu tonton akan muncul di sini.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-[#00cc55]" />
                    Lanjutkan Menonton
                </h2>
                <button
                    onClick={clearHistory}
                    className="text-gray-500 hover:text-red-400 text-xs flex items-center gap-1.5 transition-colors"
                >
                    <Trash2 className="w-3 h-3" />
                    Hapus Semua
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {history.map((item) => (
                    <MovieCard
                        key={item.id}
                        id={item.bookId}
                        title={item.title}
                        cover={item.cover}
                        provider={item.provider}
                        episode={item.episode}
                        progress={item.progress}
                        type="history"
                    />
                ))}
            </div>
        </div>
    );
}
