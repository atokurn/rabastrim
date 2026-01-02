"use client";

import { useUserStore } from "@/lib/auth/store";
import { Heart } from "lucide-react";
import { MovieCard } from "./MovieCard";
import Link from "next/link";

export function FavoritesList() {
    const { favorites } = useUserStore();

    if (favorites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border-t border-gray-800/50 mt-8">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-white font-medium mb-1">Favorit kosong</h3>
                <p className="text-gray-500 text-sm mb-6">
                    Simpan film kesukaanmu agar mudah ditemukan.
                </p>
                <Link
                    href="/explore"
                    className="px-6 py-2 bg-gray-800 text-white text-sm font-medium rounded-full hover:bg-gray-700 transition-colors"
                >
                    Jelajahi Film
                </Link>
            </div>
        );
    }

    return (
        <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                Difavoritkan
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {favorites.map((item) => (
                    <MovieCard
                        key={item.id}
                        id={item.bookId}
                        title={item.title}
                        cover={item.cover}
                        provider={item.provider}
                        type="favorite"
                    />
                ))}
            </div>
        </div>
    );
}
