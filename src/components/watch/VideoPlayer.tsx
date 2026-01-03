"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MobilePlayer } from "./MobilePlayer";
import { DesktopPlayer } from "./DesktopPlayer";

export interface VideoPlayerProps {
    src: string;
    poster?: string;
    title: string;
    dramaId: string;
    provider: string;
    currentEpisodeNumber: number;
    totalEpisodes: number;
    episodes: Array<{ id: string; number: number; videoUrl: string | null }>;
    nextEpisode?: { number: number };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    drama?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recommendations?: any[];
}

export function VideoPlayer(props: VideoPlayerProps) {
    const isMobile = useMediaQuery("(max-width: 1023px)");
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
