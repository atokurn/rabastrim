import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getVideoUrl } from "@/lib/actions/video-source";

export interface VideoPlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    isMuted: boolean;
    isLoading: boolean;
    playbackRate: number;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    togglePlay: (e?: React.MouseEvent) => void;
    handleTimeUpdate: () => void;
    handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
    toggleMute: () => void;
    changeSpeed: (speed: number) => void;
    setDuration: (duration: number) => void;
    setIsLoading: (loading: boolean) => void;
    setIsPlaying: (playing: boolean) => void;
}

export interface UseVideoPlayerProps {
    src: string;
    dramaId: string;
    provider: string;
    nextEpisode?: { number: number };
}

export function useVideoPlayer({ src, dramaId, provider, nextEpisode }: UseVideoPlayerProps): VideoPlayerState {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);

    // Preloading State
    const [hasPreloaded, setHasPreloaded] = useState(false);

    // Play/Pause
    const togglePlay = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, []);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    // Time Update & Preload Logic
    const handleTimeUpdate = useCallback(() => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);

        // Preload Logic (80%)
        if (!hasPreloaded && nextEpisode && duration > 0) {
            const progress = (videoRef.current.currentTime / duration) * 100;
            if (progress > 80) {
                setHasPreloaded(true);
                getVideoUrl(dramaId, provider, nextEpisode.number).then(url => {
                    if (url) {
                        const link = document.createElement('link');
                        link.rel = 'preload';
                        link.as = 'video';
                        link.href = url;
                        document.head.appendChild(link);
                        console.log("Preloaded next episode", nextEpisode.number);
                    }
                });
            }
        }
    }, [duration, hasPreloaded, nextEpisode, dramaId, provider]);

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, []);

    const changeSpeed = useCallback((speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackRate(speed);
        }
    }, []);

    return {
        isPlaying,
        currentTime,
        duration,
        isMuted,
        isLoading,
        playbackRate,
        videoRef,
        containerRef,
        togglePlay,
        handleTimeUpdate,
        handleSeek,
        toggleMute,
        changeSpeed,
        setDuration,
        setIsLoading,
        setIsPlaying
    };
}
