"use client";

import { useUserStore } from "@/lib/auth/store";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface LikeButtonProps {
    bookId: string;
    provider: string;
    episode: number;
    title: string;
    cover: string;
    variant?: 'icon-only' | 'with-label' | 'mobile-sidebar';
    className?: string;
}

export function LikeButton({
    bookId,
    provider,
    episode,
    title,
    cover,
    variant = 'with-label',
    className = ''
}: LikeButtonProps) {
    const { addToLikes, removeFromLikes, likes } = useUserStore();
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        const id = `${provider}-${bookId}-${episode}`;
        setIsLiked(likes.some(l => l.id === id));
    }, [likes, bookId, provider, episode]);

    const handleToggle = () => {
        if (isLiked) {
            removeFromLikes(bookId, episode, provider);
        } else {
            addToLikes({
                bookId,
                episode,
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
                    <Heart className={`w-7 h-7 stroke-[1.5px] ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                </div>
                <span className="text-white text-xs font-medium text-shadow">{isLiked ? 'Disukai' : 'Suka'}</span>
            </button>
        );
    }

    if (variant === 'icon-only') {
        return (
            <button onClick={handleToggle} className={`text-gray-400 hover:text-red-500 transition-colors ${className}`}>
                <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
            </button>
        );
    }

    return (
        <button
            onClick={handleToggle}
            className={`flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors ${className}`}
        >
            <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
            <span className="text-xs">{isLiked ? 'Disukai' : 'Suka'}</span>
        </button>
    );
}
