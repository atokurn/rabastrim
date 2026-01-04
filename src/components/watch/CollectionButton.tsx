"use client";

import { useUserStore } from "@/lib/auth/store";
import { Bookmark, Check } from "lucide-react";
import { useEffect, useState } from "react";

interface CollectionButtonProps {
    bookId: string;
    provider: string;
    title: string;
    cover: string;
    variant?: 'icon-only' | 'with-label' | 'mobile-sidebar';
    className?: string;
}

export function CollectionButton({
    bookId,
    provider,
    title,
    cover,
    variant = 'with-label',
    className = ''
}: CollectionButtonProps) {
    const { addToFavorites, removeFromFavorites, favorites } = useUserStore();
    const [isCollected, setIsCollected] = useState(false);

    useEffect(() => {
        const id = `${provider}-${bookId}`;
        setIsCollected(favorites.some(f => f.id === id));
    }, [favorites, bookId, provider]);

    const handleToggle = () => {
        if (isCollected) {
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
                    <Bookmark
                        className={`w-7 h-7 stroke-[1.5px] ${isCollected ? 'text-[#00cc55] fill-[#00cc55]' : 'text-white'}`}
                    />
                </div>
                <span className="text-white text-xs font-medium text-shadow">{isCollected ? 'Disimpan' : 'Koleksi'}</span>
            </button>
        );
    }

    if (variant === 'icon-only') {
        return (
            <button onClick={handleToggle} className={`text-gray-400 hover:text-[#00cc55] transition-colors ${className}`}>
                <Bookmark className={`w-5 h-5 ${isCollected ? 'text-[#00cc55] fill-[#00cc55]' : ''}`} />
            </button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            className={`flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors ${className}`}
        >
            <Bookmark className={`w-5 h-5 ${isCollected ? 'text-[#00cc55] fill-[#00cc55]' : ''}`} />
            <span className="text-xs">{isCollected ? 'Disimpan' : 'Koleksi'}</span>
        </button>
    );
}
