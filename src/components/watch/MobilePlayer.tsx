"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, ChevronLeft, Loader2, Volume2, VolumeX, Settings, Maximize, Minimize } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/Drawer";
import { useVideoPlayer } from "@/hooks/use-video-player";

interface MobilePlayerProps {
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

export function MobilePlayer({
    src,
    poster,
    title,
    dramaId,
    provider,
    currentEpisodeNumber,
    totalEpisodes,
    episodes,
    nextEpisode,
}: MobilePlayerProps) {
    const router = useRouter();
    const {
        videoRef,
        containerRef,
        isPlaying,
        currentTime,
        duration,
        isLoading,
        playbackRate,
        togglePlay,
        handleTimeUpdate,
        handleSeek,
        setIsLoading,
        setIsPlaying,
        setDuration,
        changeSpeed
    } = useVideoPlayer({ src, dramaId, provider, nextEpisode });

    const [showControls, setShowControls] = useState(true);
    const [activeDrawer, setActiveDrawer] = useState<'episodes' | 'settings' | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Format time
    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Auto-hide controls
    const resetControls = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        if (isPlaying && !activeDrawer) {
            controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2000);
        }
    }, [isPlaying, activeDrawer]);

    useEffect(() => {
        resetControls();
        const container = containerRef.current;
        if (container) {
            container.addEventListener('click', resetControls);
            container.addEventListener('touchstart', resetControls);
        }
        return () => {
            if (container) {
                container.removeEventListener('click', resetControls);
                container.removeEventListener('touchstart', resetControls);
            }
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [resetControls]);

    // Initial mount auto-play check
    useEffect(() => {
        setIsLoading(true);
    }, [src, setIsLoading]);

    const goToEpisode = (epNum: number) => {
        router.push(`/watch/${dramaId}?ep=${epNum}&provider=${provider}`);
        setActiveDrawer(null);
    };

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 bg-black overflow-hidden group">
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain"
                autoPlay
                playsInline
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
                onPlaying={() => setIsLoading(false)}
                onEnded={() => {
                    setIsPlaying(false);
                    setShowControls(true);
                    if (nextEpisode) goToEpisode(nextEpisode.number);
                }}
            />

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <Loader2 className="w-12 h-12 text-[#00cc55] animate-spin" />
                </div>
            )}

            {/* Gesture Overlay (Invisible) */}
            <div
                className="absolute inset-0 z-0"
                onClick={togglePlay}
                onTouchStart={(e) => {
                    const touch = e.touches[0];
                    containerRef.current?.setAttribute('data-touch-start-y', touch.clientY.toString());
                }}
                onTouchEnd={(e) => {
                    const startY = parseFloat(containerRef.current?.getAttribute('data-touch-start-y') || '0');
                    const endY = e.changedTouches[0].clientY;
                    const diff = startY - endY;

                    if (Math.abs(diff) > 50) {
                        if (diff > 0 && nextEpisode) goToEpisode(nextEpisode.number);
                        else if (diff < 0 && currentEpisodeNumber > 1) goToEpisode(currentEpisodeNumber - 1);
                    }
                }}
            />

            {/* Top Bar */}
            <div className={cn(
                "absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none transition-opacity duration-300 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-12",
                showControls ? "opacity-100" : "opacity-0"
            )}>
                <button onClick={() => router.back()} className="text-white p-2 bg-black/20 rounded-full backdrop-blur-md pointer-events-auto">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 mx-4 text-center mt-2">
                    <h1 className="text-white font-medium text-sm line-clamp-2 drop-shadow-md">{title}</h1>
                    <p className="text-white/80 text-xs mt-0.5">Episode {currentEpisodeNumber}</p>
                </div>
                <button onClick={() => setActiveDrawer('settings')} className="text-white p-2 bg-black/20 rounded-full backdrop-blur-md pointer-events-auto">
                    <Settings className="w-6 h-6" />
                </button>
            </div>

            {/* Center Play Button */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm pointer-events-auto animate-in fade-in zoom-in duration-200" onClick={togglePlay}>
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* Bottom Section */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 pointer-events-none",
                showControls ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            )}>
                {/* Total Episode Button (Floating above controls) */}
                <div className="px-4 mb-4 pointer-events-auto flex justify-start">
                    <button
                        onClick={() => setActiveDrawer('episodes')}
                        className="bg-[#1f2126]/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-3 shadow-lg"
                    >
                        <div className="flex flex-col items-start text-left">
                            <span className="text-[#00cc55] text-[10px] font-bold uppercase tracking-wider">Playlist</span>
                            <span className="text-white text-xs font-medium">Episode {currentEpisodeNumber} / {totalEpisodes}</span>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                    </button>
                </div>

                {/* Progress Bar Area */}
                <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-8 pt-8 pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-white/80 w-8 text-right font-mono">{formatTime(currentTime)}</span>
                        <div className="relative flex-1 group h-4 flex items-center">
                            <input
                                type="range"
                                min={0}
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#00cc55] rounded-full relative"
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
                                </div>
                            </div>
                        </div>
                        <span className="text-[10px] text-white/80 w-8 font-mono">{formatTime(duration)}</span>
                    </div>
                </div>
            </div>

            {/* Episodes Drawer */}
            <Drawer
                isOpen={activeDrawer === 'episodes'}
                onClose={() => setActiveDrawer(null)}
                title={`Episodes (${totalEpisodes})`}
            >
                <div className="grid grid-cols-5 gap-3">
                    {Array.from({ length: totalEpisodes }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goToEpisode(i + 1)}
                            className={cn(
                                "aspect-square rounded flex items-center justify-center text-sm font-medium border transition-colors",
                                i + 1 === currentEpisodeNumber
                                    ? "bg-[#00cc55] text-black border-[#00cc55] font-bold"
                                    : "bg-[#2e3036] text-gray-300 border-transparent"
                            )}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </Drawer>

            {/* Settings Drawer */}
            <Drawer
                isOpen={activeDrawer === 'settings'}
                onClose={() => setActiveDrawer(null)}
                title="Settings"
            >
                <div className="space-y-4">
                    <div>
                        <h4 className="text-gray-400 text-sm mb-2">Kecepatan Laju</h4>
                        <div className="flex flex-wrap gap-2">
                            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                                <button
                                    key={rate}
                                    onClick={() => changeSpeed(rate)}
                                    className={cn(
                                        "px-3 py-1 rounded text-sm min-w-[3rem]",
                                        playbackRate === rate ? "bg-[#00cc55] text-black" : "bg-[#2e3036] text-white"
                                    )}
                                >
                                    {rate}x
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
