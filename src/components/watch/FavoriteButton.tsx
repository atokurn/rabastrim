"use client";

import { useUserStore } from "@/lib/auth/store";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface FavoriteButtonProps {
    bookId: string;
    provider: string;
    title: string;
    cover: string;
    variant?: 'icon-only' | 'with-label' | 'mobile-sidebar';
    className?: string;
}

export function FavoriteButton({
    bookId,
    provider,
    title,
    cover,
    variant = 'with-label',
    className = ''
}: FavoriteButtonProps) {
    const { addToFavorites, removeFromFavorites, favorites } = useUserStore();
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const id = `${provider}-${bookId}`;
        setIsFavorite(favorites.some(f => f.id === id));
    }, [favorites, bookId, provider]);

    const handleToggle = () => {
        if (isFavorite) {
            removeFromFavorites(bookId, provider);
        } else {
            addToFavorites({
                bookId,
                title,
                cover,
                provider,
            });
        }
    };

    if (variant === 'mobile-sidebar') {
        return (
            <button onClick={handleToggle} className={`flex flex-col items-center gap-1 group ${className}`}>
                <div className="p-1.5 rounded-full bg-black/20 backdrop-blur-sm group-active:scale-90 transition-transform">
                    <Heart className={`w-7 h-7 stroke-[1.5px] ${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                </div>
                <span className="text-white text-xs font-medium text-shadow">{isFavorite ? 'Disimpan' : 'Simpan'}</span>
            </button>
        );
    }

    if (variant === 'icon-only') {
        return (
            <button onClick={handleToggle} className={`text-gray-400 hover:text-red-500 transition-colors ${className}`}>
                <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
            </button>
        );
    }

    // Default: with-label (desktop style)
    return (
        <button
            onClick={handleToggle}
            className={`flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors ${className}`}
        >
            <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
            <span className="text-xs">{isFavorite ? 'Disimpan' : 'Collect'}</span>
        </button>
    );
}
