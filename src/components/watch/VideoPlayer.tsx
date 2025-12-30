"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MobilePlayer } from "./MobilePlayer";
import { DesktopPlayer } from "./DesktopPlayer";

interface VideoPlayerProps {
    src: string;
    poster?: string;
    title: string;
    dramaId: string;
    provider: string;
    currentEpisodeNumber: number;
    totalEpisodes: number;
    episodes: Array<{ id: string; number: number; videoUrl: string | null }>;
    nextEpisode?: { number: number };
}

export function VideoPlayer(props: VideoPlayerProps) {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Render a skeleton or a default player to avoid hydration mismatch
        // Defaulting to desktop layout structure but empty/loading might be safest, 
        // or just return null if SEO of the player itself isn't critical (video content usually isn't indexed from the player UI)
        return <div className="w-full h-full bg-black aspect-video" />;
    }

    return isMobile ? <MobilePlayer {...props} /> : <DesktopPlayer {...props} />;
}
