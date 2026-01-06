"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Play, Pause, ChevronLeft, Loader2, Volume2, VolumeX, Maximize, Minimize, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useVideoPlayer } from "@/hooks/use-video-player";

interface DesktopPlayerProps {
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

export function DesktopPlayer({
    src,
    poster,
    title,
    dramaId,
    provider,
    currentEpisodeNumber,
    totalEpisodes,
    episodes,
    nextEpisode,
}: DesktopPlayerProps) {
    const router = useRouter();

    // Previous episode calculation
    const prevEpisode = currentEpisodeNumber > 1 ? { number: currentEpisodeNumber - 1 } : undefined;

    const {
        videoRef,
        containerRef,
        isPlaying,
        currentTime,
        duration,
        isMuted,
        isLoading,
        playbackRate,
        togglePlay,
        handleTimeUpdate,
        handleSeek,
        toggleMute,
        setIsLoading,
        setIsPlaying,
        setDuration,
        changeSpeed,
        error,
        handleError,
        handlePlaying
    } = useVideoPlayer({
        src,
        dramaId,
        provider,
        currentEpisodeNumber,
        totalEpisodes,
        title,
        cover: poster,
        nextEpisode,
        prevEpisode
    });

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverPosition, setHoverPosition] = useState<number>(0);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetControls = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isPlaying]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = () => {
            setHasInteracted(true);
            resetControls();
        };

        const handleMouseLeave = () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            if (isPlaying) {
                setShowControls(false);
            }
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [resetControls, isPlaying]); // Re-bind when playing state changes to update timeout behavior


    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const goToEpisode = (epNum: number) => {
        router.push(`/watch/${dramaId}?ep=${epNum}&provider=${provider}`);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            setHasInteracted(true);

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    if (videoRef.current) videoRef.current.currentTime -= 10;
                    break;
                case 'arrowright':
                    e.preventDefault();
                    if (videoRef.current) videoRef.current.currentTime += 10;
                    break;
                case 'arrowup':
                    e.preventDefault();
                    if (videoRef.current) videoRef.current.volume = Math.min(1, videoRef.current.volume + 0.1);
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    if (videoRef.current) videoRef.current.volume = Math.max(0, videoRef.current.volume - 0.1);
                    break;
                case 'm':
                    toggleMute();
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
                case 'n':
                    if (currentEpisodeNumber < totalEpisodes) goToEpisode(currentEpisodeNumber + 1);
                    break;
                case 'p':
                    if (currentEpisodeNumber > 1) goToEpisode(currentEpisodeNumber - 1);
                    break;
                case 'escape':
                    if (document.fullscreenElement) document.exitFullscreen();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, toggleMute, currentEpisodeNumber, totalEpisodes, dramaId, provider]);

    return (
        <div ref={containerRef}
            className={cn(
                "w-full h-full bg-black relative group overflow-hidden md:aspect-video rounded-lg",
                !showControls && isPlaying && "cursor-none"
            )}
            onMouseEnter={resetControls}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className={cn(
                    "w-full h-full object-contain transition-all duration-200",
                    (!showControls && isPlaying) ? "cursor-none" : "cursor-pointer"
                )}
                autoPlay
                onClick={() => {
                    setHasInteracted(true);
                    togglePlay();
                    resetControls();
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e) => {
                    setDuration(e.currentTarget.duration);
                    setIsLoading(false);
                    e.currentTarget.play().catch(() => {
                        setIsPlaying(false);
                        setIsLoading(false);
                    });
                }}
                onWaiting={() => setIsLoading(true)}
                onPlaying={handlePlaying}
                onError={handleError}
                onEnded={() => {
                    setIsPlaying(false);
                    setHasInteracted(false); // Reset interaction on episode end
                    if (currentEpisodeNumber < totalEpisodes) goToEpisode(currentEpisodeNumber + 1);
                }}
            />

            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30 text-white gap-3 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-1">
                        {/* Just using Loader as generic icon or maybe AlertCircle if available, but staying safe with existing imports for now, though AlertCircle would be better. Let's stick to simple text or existing icons. Actually lets import AlertCircle if possible, but I don't want to break imports. I'll use text for now or simple structure. Wait, I can use simple UI. */}
                        <div className="text-3xl">⚠️</div>
                    </div>
                    <p className="text-white/90 font-medium text-base">Gagal memutar video</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-[#00cc55] hover:bg-[#00b34a] rounded-full text-black font-bold text-sm transition-transform active:scale-95 flex items-center gap-2 mt-2"
                    >
                        <span>Muat Ulang</span>
                    </button>
                    <p className="text-xs text-white/40 max-w-[200px] text-center">
                        Terjadi kesalahan saat memuat media. Silakan periksa koneksi internet Anda.
                    </p>
                </div>
            )}

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <Loader2 className="w-16 h-16 text-[#00cc55] animate-spin" />
                </div>
            )}

            {/* Controls Overlay */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/40 flex flex-col justify-end transition-opacity duration-200",
                    (showControls && !isLoading) || (hasInteracted && !isPlaying && !isLoading) ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                )}
                onClick={(e) => {
                    // Only toggle if clicking on the overlay itself (not on controls)
                    if (e.target === e.currentTarget) {
                        togglePlay();
                    }
                }}
            >
                {/* Top Bar (Title) */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center gap-4">
                    <button onClick={() => router.push('/')} className="text-white hover:bg-white/20 p-2 rounded-full">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-white font-medium text-lg drop-shadow">{title}</h1>
                </div>

                {/* Center Play Button (Large) */}
                {!isPlaying && !error && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-20 h-20 icon-scale bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm pointer-events-auto cursor-pointer hover:bg-[#00cc55]/80 transition-colors" onClick={togglePlay}>
                            <Play className="w-10 h-10 text-white fill-white ml-2" />
                        </div>
                    </div>
                )}

                {/* Bottom Bar */}
                <div className="p-4 bg-gradient-to-t from-black/80 to-transparent space-y-2">
                    {/* Progress Bar */}
                    <div className="flex items-center gap-3 relative group/seek">
                        {/* Tooltip */}
                        {hoverTime !== null && (
                            <div
                                className="absolute bottom-full mb-2 px-2 py-1 bg-black/80 text-white text-xs font-bold rounded -translate-x-1/2 pointer-events-none whitespace-nowrap z-30"
                                style={{ left: `${hoverPosition}px` }}
                            >
                                {formatTime(hoverTime)}
                            </div>
                        )}
                        <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const percent = Math.min(Math.max(0, x), rect.width) / rect.width;
                                setHoverTime(percent * (duration || 0));
                                setHoverPosition(x);
                            }}
                            onMouseLeave={() => setHoverTime(null)}
                            className="w-full h-1 bg-gray-600 rounded-lg cursor-pointer accent-[#00cc55] hover:h-2 transition-all"
                        />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="text-white hover:text-[#00cc55]">
                                {isPlaying ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white" />}
                            </button>

                            <div className="flex items-center gap-2 group/vol">
                                <button onClick={toggleMute} className="text-white hover:text-[#00cc55]">
                                    {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                                </button>
                                <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300">
                                    <input
                                        type="range" min="0" max="1" step="0.1"
                                        onChange={(e) => {
                                            if (videoRef.current) videoRef.current.volume = parseFloat(e.target.value);
                                        }}
                                        className="w-20 h-1 accent-white"
                                    />
                                </div>
                            </div>

                            <span className="text-white text-sm font-mono">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Speed Selector */}
                            <div className="relative group/speed">
                                <button className="text-white text-sm font-bold bg-white/10 px-2 py-1 rounded hover:bg-[#00cc55] hover:text-black transition-colors">
                                    {playbackRate}x
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/speed:flex flex-col bg-[#1f2126] rounded-lg p-1 shadow-xl">
                                    {[0.5, 1.0, 1.5, 2.0].map(rate => (
                                        <button
                                            key={rate}
                                            onClick={() => changeSpeed(rate)}
                                            className="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded"
                                        >
                                            {rate}x
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={toggleFullscreen} className="text-white hover:text-[#00cc55]">
                                {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
