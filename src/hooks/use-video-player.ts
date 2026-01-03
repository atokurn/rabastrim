"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getVideoUrl } from "@/lib/actions/video-source";
import { useUserStore } from "@/lib/auth/store";

// ===== PLAYER STATE MACHINE =====
export enum PlayerState {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    PLAYING = 'PLAYING',
    PAUSED = 'PAUSED',
    BUFFERING = 'BUFFERING',
    ENDED = 'ENDED'
}

export interface VideoPlayerState {
    // State Machine
    playerState: PlayerState;

    // Video State
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    isMuted: boolean;
    isLoading: boolean;
    playbackRate: number;

    // Episode State
    currentEpisodeNum: number;
    currentSrc: string;

    // Refs
    videoRef: React.RefObject<HTMLVideoElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;

    // Actions
    togglePlay: (e?: React.MouseEvent) => void;
    handleTimeUpdate: () => void;
    handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
    toggleMute: () => void;
    changeSpeed: (speed: number) => void;
    setDuration: (duration: number) => void;
    setIsLoading: (loading: boolean) => void;
    setIsPlaying: (playing: boolean) => void;

    // NEW: Episode Navigation
    changeEpisode: (episodeNum: number) => Promise<void>;
    isChangingEpisode: boolean;
}

export interface UseVideoPlayerProps {
    src: string;
    dramaId: string;
    provider: string;
    currentEpisodeNumber: number;
    totalEpisodes: number;
    title?: string;
    cover?: string; // Added for history
    nextEpisode?: { number: number };
    prevEpisode?: { number: number };
}

export function useVideoPlayer({
    src,
    dramaId,
    provider,
    currentEpisodeNumber,
    totalEpisodes,
    title,
    cover,
    nextEpisode,
    prevEpisode
}: UseVideoPlayerProps): VideoPlayerState {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // ===== STATE MACHINE =====
    const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.IDLE);

    // ===== VIDEO STATE =====
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);

    // ===== EPISODE STATE =====
    const [currentEpisodeNum, setCurrentEpisodeNum] = useState(currentEpisodeNumber);
    const [currentSrc, setCurrentSrc] = useState(src);
    const [isChangingEpisode, setIsChangingEpisode] = useState(false);

    // Sync episode state when props change (e.g., on initial load or page navigation)
    useEffect(() => {
        setCurrentEpisodeNum(currentEpisodeNumber);
        setCurrentSrc(src);
        resumeApplied.current = false; // Reset resume flag for new episode
    }, [currentEpisodeNumber, src]);

    // ===== EPISODE BUFFER POOL =====
    const episodeBuffer = useRef<Map<number, string>>(new Map());
    const lastSaveTime = useRef<number>(0);

    // ===== USER STORE FOR HISTORY =====
    const addToHistory = useUserStore((state) => state.addToHistory);
    const history = useUserStore((state) => state.history);
    const resumeApplied = useRef<boolean>(false);

    // Initialize buffer with current episode
    useEffect(() => {
        episodeBuffer.current.set(currentEpisodeNumber, src);
    }, [currentEpisodeNumber, src]);

    // ===== PRELOAD LOGIC (Buffer Pool: prev, current, next) =====
    const preloadEpisode = useCallback(async (episodeNum: number) => {
        if (episodeBuffer.current.has(episodeNum)) return; // Already cached
        if (episodeNum < 1 || episodeNum > totalEpisodes) return; // Out of range

        try {
            const url = await getVideoUrl(dramaId, provider, episodeNum);
            if (url) {
                episodeBuffer.current.set(episodeNum, url);

                // Also preload the video element
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'video';
                link.href = url;
                document.head.appendChild(link);

                console.log(`[Buffer] Preloaded episode ${episodeNum}`);
            }
        } catch (error) {
            console.error(`[Buffer] Failed to preload episode ${episodeNum}:`, error);
        }
    }, [dramaId, provider, totalEpisodes]);

    // Preload adjacent episodes when current changes
    useEffect(() => {
        // Preload Previous (-1)
        if (currentEpisodeNum > 1) {
            preloadEpisode(currentEpisodeNum - 1);
        }
        // Preload Next (+1)
        if (currentEpisodeNum < totalEpisodes) {
            preloadEpisode(currentEpisodeNum + 1);
        }
        // Also preload +2 for smoother experience
        if (currentEpisodeNum + 2 <= totalEpisodes) {
            preloadEpisode(currentEpisodeNum + 2);
        }
    }, [currentEpisodeNum, totalEpisodes, preloadEpisode]);

    // ===== CHANGE EPISODE (Seamless) =====
    const changeEpisode = useCallback(async (episodeNum: number) => {
        if (episodeNum < 1 || episodeNum > totalEpisodes) return;
        if (isChangingEpisode) return; // Prevent double calls

        setIsChangingEpisode(true);
        setPlayerState(PlayerState.LOADING);

        try {
            // Check buffer first
            let url: string | undefined = episodeBuffer.current.get(episodeNum);

            if (!url) {
                // Fallback: fetch on demand
                const fetchedUrl = await getVideoUrl(dramaId, provider, episodeNum);
                if (fetchedUrl) {
                    url = fetchedUrl;
                    episodeBuffer.current.set(episodeNum, fetchedUrl);
                }
            }

            if (url && videoRef.current) {
                // Store current time for potential resume
                const wasPlaying = !videoRef.current.paused;

                // Update source
                setCurrentSrc(url);
                setCurrentEpisodeNum(episodeNum);
                videoRef.current.src = url;
                videoRef.current.load();

                // Update URL without reload
                const newUrl = `/watch/${dramaId}?ep=${episodeNum}&provider=${provider}`;
                window.history.pushState({ episode: episodeNum }, '', newUrl);

                // Update document title
                if (title) {
                    document.title = `Ep. ${episodeNum} - ${title}`;
                }

                // Auto-play if was playing
                if (wasPlaying) {
                    await videoRef.current.play();
                }

                console.log(`[Episode] Changed to episode ${episodeNum}`);

                // Save to history
                if (title && cover) {
                    addToHistory({
                        id: `${provider}-${dramaId}`,
                        bookId: dramaId,
                        title: title,
                        cover: cover,
                        provider: provider,
                        episode: episodeNum,
                        progress: 0,
                    });
                }
            }
        } catch (error) {
            console.error(`[Episode] Failed to change to episode ${episodeNum}:`, error);
            setPlayerState(PlayerState.IDLE);
        } finally {
            setIsChangingEpisode(false);
        }
    }, [dramaId, provider, totalEpisodes, isChangingEpisode, title, cover, addToHistory]);

    // ===== VISIBILITY CHANGE (Pause on tab switch) =====
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && videoRef.current && !videoRef.current.paused) {
                videoRef.current.pause();
                setPlayerState(PlayerState.PAUSED);
                console.log('[Visibility] Paused - tab hidden');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // ===== PLAY/PAUSE =====
    const togglePlay = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!videoRef.current) return;

        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
            setPlayerState(PlayerState.PLAYING);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
            setPlayerState(PlayerState.PAUSED);
        }
    }, []);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    // ===== SAVE PROGRESS HELPER =====
    const saveProgress = useCallback((time: number, videoDuration: number) => {
        if (videoDuration <= 0 || !title || !cover) return;
        const progressPercent = Math.round((time / videoDuration) * 100);
        addToHistory({
            id: `${provider}-${dramaId}`,
            bookId: dramaId,
            title: title,
            cover: cover,
            provider: provider,
            episode: currentEpisodeNum,
            progress: progressPercent,
            lastPosition: Math.floor(time),
            duration: Math.floor(videoDuration),
        });
    }, [dramaId, provider, title, cover, currentEpisodeNum, addToHistory]);

    // ===== TIME UPDATE & PROGRESS SAVING =====
    const handleTimeUpdate = useCallback(() => {
        if (!videoRef.current) return;
        const time = videoRef.current.currentTime;
        const videoDuration = videoRef.current.duration;
        setCurrentTime(time);

        // Save progress to history every 3 seconds
        const now = Date.now();
        if (now - lastSaveTime.current > 3000 && videoDuration > 0) {
            lastSaveTime.current = now;
            saveProgress(time, videoDuration);
        }
    }, [saveProgress]);

    // ===== APPLY RESUME POSITION =====
    useEffect(() => {
        if (resumeApplied.current) return;
        if (!videoRef.current || duration <= 0) return;

        // Find matching history entry
        const historyItem = history.find(
            (h) => h.bookId === dramaId && h.provider === provider && h.episode === currentEpisodeNum
        );

        if (historyItem?.lastPosition && historyItem.lastPosition > 0) {
            // Resume from last position (buffer 2s from end)
            const resumeTime = Math.min(historyItem.lastPosition, duration - 2);
            if (resumeTime > 0) {
                videoRef.current.currentTime = resumeTime;
                console.log(`[Resume] Seeking to ${resumeTime}s`);
            }
            resumeApplied.current = true;
        }
    }, [duration, history, dramaId, provider, currentEpisodeNum]);

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
            // Save progress immediately on seek
            saveProgress(time, videoRef.current.duration);
        }
    }, [saveProgress]);

    const changeSpeed = useCallback((speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackRate(speed);
        }
    }, []);

    // ===== CLEANUP: Limit buffer size to prevent memory issues =====
    useEffect(() => {
        const maxBufferSize = 5;
        if (episodeBuffer.current.size > maxBufferSize) {
            // Remove episodes far from current
            const keysToRemove: number[] = [];
            episodeBuffer.current.forEach((_, key) => {
                if (Math.abs(key - currentEpisodeNum) > 2) {
                    keysToRemove.push(key);
                }
            });
            keysToRemove.forEach(key => episodeBuffer.current.delete(key));
            console.log(`[Buffer] Cleaned up ${keysToRemove.length} episodes`);
        }
    }, [currentEpisodeNum]);

    return {
        playerState,
        isPlaying,
        currentTime,
        duration,
        isMuted,
        isLoading,
        playbackRate,
        currentEpisodeNum,
        currentSrc,
        videoRef,
        containerRef,
        togglePlay,
        handleTimeUpdate,
        handleSeek,
        toggleMute,
        changeSpeed,
        setDuration,
        setIsLoading,
        setIsPlaying,
        changeEpisode,
        isChangingEpisode,
    };
}
