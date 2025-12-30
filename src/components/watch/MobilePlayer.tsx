"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, ChevronLeft, Loader2, Share2, Heart, MoreHorizontal, ChevronRight, MessageCircle, Settings as SettingsIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useVideoPlayer } from "@/hooks/use-video-player";
import Image from "next/image";
import Link from "next/link";
import { Drawer } from "@/components/ui/Drawer";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    drama?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recommendations?: any[];
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
    drama,
    recommendations = []
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

    // Drawer States
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isSheetFull, setIsSheetFull] = useState(false); // New state for fullscreen drawer
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [activeTab, setActiveTab] = useState<'details' | 'episodes'>('episodes');
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Touch Handling References
    const touchStartY = useRef<number>(0);
    const drawerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const goToEpisode = (epNum: number) => {
        router.push(`/watch/${dramaId}?ep=${epNum}&provider=${provider}`);
        setIsSheetOpen(false);
        setIsSheetFull(false);
    };

    // Auto-hide controls logic
    const resetControls = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        if (isPlaying && !isSheetOpen && !isSettingsOpen) {
            controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
        }
    }, [isPlaying, isSheetOpen, isSettingsOpen]);

    useEffect(() => {
        resetControls();
        const container = containerRef.current;
        const handleInteraction = () => resetControls();
        if (container) {
            container.addEventListener('click', handleInteraction);
            container.addEventListener('touchstart', handleInteraction);
            container.addEventListener('mousemove', handleInteraction);
        }
        return () => {
            if (container) {
                container.removeEventListener('click', handleInteraction);
                container.removeEventListener('touchstart', handleInteraction);
                container.removeEventListener('mousemove', handleInteraction);
            }
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [resetControls]);

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isSheetOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.overscrollBehavior = 'none'; // Prevent pull-to-refresh on body
        } else {
            document.body.style.overflow = '';
            document.body.style.overscrollBehavior = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.overscrollBehavior = '';
        };
    }, [isSheetOpen]);


    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        // Optional: Implement real-time dragging physics here if needed
        // For simplicity, we just use End to trigger state change
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchEndY - touchStartY.current;
        const threshold = 50; // pixels to trigger swipe

        // Check if we are scrolling content or swiping the drawer
        // If content is scrolled down (scrollTop > 0), we shouldn't trigger "Close" on swipe down immediately
        // unless we are at the very top.
        const isAtTop = contentRef.current ? contentRef.current.scrollTop <= 0 : true;

        if (deltaY < -threshold) {
            // SWIPE UP (Finger moves up)
            if (!isSheetFull) {
                setIsSheetFull(true);
            }
        } else if (deltaY > threshold) {
            // SWIPE DOWN (Finger moves down)
            if (isSheetFull && isAtTop) {
                setIsSheetFull(false); // Go back to half
            } else if (!isSheetFull && isAtTop) {
                setIsSheetOpen(false); // Close completely
            }
        }
    };


    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 bg-black overflow-hidden group font-sans">

            {/* ... (Video and Overlays remain same) ... */}
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="absolute inset-0 w-full h-full object-contain bg-black"
                autoPlay
                playsInline
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e) => {
                    setDuration(e.currentTarget.duration);
                    setIsLoading(false);
                    e.currentTarget.play().catch(() => { });
                }}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => setIsLoading(false)}
                onEnded={() => {
                    if (nextEpisode) goToEpisode(nextEpisode.number);
                    else setIsPlaying(false);
                }}
                onClick={togglePlay}
            />

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <Loader2 className="w-12 h-12 text-white/50 animate-spin" />
                </div>
            )}

            {!isPlaying && !isLoading && !isSheetOpen && !isSettingsOpen && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-16 h-16 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                </div>
            )}

            <div className={cn("absolute inset-0 pointer-events-none transition-opacity duration-500",
                isSheetOpen ? "opacity-0" : "opacity-100"
            )}>
                <div className={cn(
                    "absolute top-0 left-0 right-0 p-4 pt-8 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent pointer-events-auto transition-opacity duration-300",
                    showControls ? "opacity-100" : "opacity-0"
                )}>
                    <button onClick={() => router.back()} className="text-white hover:opacity-70">
                        <ChevronLeft className="w-8 h-8 shadow-sm" />
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)} className="text-white hover:opacity-70">
                        <MoreHorizontal className="w-8 h-8 shadow-sm" />
                    </button>
                </div>

                <div className={cn(
                    "absolute right-2 bottom-32 flex flex-col gap-6 items-center pointer-events-auto z-20 transition-opacity duration-300",
                    showControls ? "opacity-100" : "opacity-0"
                )}>
                    {/* Sidebar buttons ... */}
                    <button className="flex flex-col items-center gap-1 group">
                        <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm group-active:scale-90 transition-transform">
                            <Heart className="w-8 h-8 text-white stroke-[1.5px]" />
                        </div>
                        <span className="text-white text-xs font-medium text-shadow">118.3k</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 group">
                        <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm group-active:scale-90 transition-transform">
                            <MessageCircle className="w-8 h-8 text-white stroke-[1.5px]" />
                        </div>
                        <span className="text-white text-xs font-medium text-shadow">123</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 group">
                        <div className="p-2 rounded-full bg-black/20 backdrop-blur-sm group-active:scale-90 transition-transform">
                            <Share2 className="w-8 h-8 text-white stroke-[1.5px]" />
                        </div>
                        <span className="text-white text-xs font-medium text-shadow">Bagikan</span>
                    </button>
                </div>

                <div className={cn(
                    "absolute left-0 right-16 bottom-16 px-4 flex flex-col items-start gap-2 pointer-events-auto z-10 text-shadow-lg transition-opacity duration-300",
                    showControls ? "opacity-100" : "opacity-0"
                )}>
                    <h1 className="text-white font-bold text-lg leading-tight line-clamp-2">
                        <span className="mr-2 opacity-70">Ep.{currentEpisodeNumber}</span>
                        {title}
                    </h1>
                    {drama?.description && (
                        <p className="text-white/90 text-sm line-clamp-2 leading-snug">
                            {drama.description}
                        </p>
                    )}
                </div>

                <div className="absolute bottom-12 left-0 right-0 h-1 bg-white/30 pointer-events-auto z-20">
                    <div
                        className="h-full bg-[#00cc55] relative"
                        style={{ width: `${progressPercent}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow" />
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-4 -top-1.5 opacity-0 cursor-pointer"
                    />
                </div>

                <button
                    onClick={() => { setIsSheetOpen(true); setActiveTab('episodes'); }}
                    className="absolute bottom-0 left-0 right-0 h-12 bg-[#000000] flex items-center justify-between px-4 pointer-events-auto active:bg-gray-900 transition-colors z-20"
                >
                    <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                        <Play className="w-4 h-4 fill-white text-white" />
                        <span>Total {totalEpisodes} episode</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Pilih episode</span>
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </button>
            </div>

            {/* === 3. Bottom Sheet (Drawer) === */}
            <div
                ref={drawerRef}
                className={cn(
                    "absolute inset-x-0 bottom-0 bg-[#121212] z-50 flex flex-col transition-all duration-300 ease-out shadow-2xl overflow-hidden",
                    isSheetOpen ? "translate-y-0" : "translate-y-full",
                    isSheetFull ? "top-0 rounded-none" : "h-[70%] rounded-t-xl border-t border-white/5"
                )}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Header in Drawer */}
                {/* Only show Back Chevron if Fullscreen or for closing */}
                <div className="h-10 flex items-center justify-between px-4 shrink-0 border-b border-white/5 relative">
                    <button onClick={() => {
                        if (isSheetFull) setIsSheetFull(false);
                        else setIsSheetOpen(false);
                    }} className="p-1 -ml-1 text-white/70">
                        <ChevronLeft className="w-6 h-6 -rotate-90" /> {/* Down-like chevron */}
                    </button>

                    {/* Drag Handle (Only visible in compact mode) */}
                    {!isSheetFull && (
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-1 bg-white/20 rounded-full" />
                    )}
                </div>

                {/* Drama Header Info */}
                <div className="px-4 py-3 flex gap-4 shrink-0 bg-[#121212]">
                    <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden shrink-0 relative shadow-md">
                        {drama?.cover && <Image src={drama.cover} alt={title} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h2 className="text-white font-bold text-sm leading-tight line-clamp-1 mb-1">{title}</h2>
                        <div className="text-[10px] text-gray-400 mb-2">Full {totalEpisodes} Episode</div>
                        <button className="self-start px-3 py-1 bg-white/10 text-white text-[10px] font-bold rounded-lg border border-white/10">
                            Sudah ditambahkan
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 px-4 shrink-0 bg-[#121212] z-10">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={cn("mr-6 py-3 text-sm font-bold relative transition-colors", activeTab === 'details' ? "text-white" : "text-gray-500")}
                    >
                        Sinopsis
                        {activeTab === 'details' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#00cc55] rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('episodes')}
                        className={cn("mr-6 py-3 text-sm font-bold relative transition-colors", activeTab === 'episodes' ? "text-white" : "text-gray-500")}
                    >
                        Pilih episode
                        {activeTab === 'episodes' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#00cc55] rounded-full" />}
                    </button>
                </div>

                {/* Tab Content */}
                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#121212] pb-20 overscroll-y-contain" // Added overscroll-y-contain
                >
                    {activeTab === 'episodes' ? (
                        <div className="">
                            <div className="grid grid-cols-6 gap-3">
                                {Array.from({ length: totalEpisodes }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => goToEpisode(i + 1)}
                                        className={cn(
                                            "aspect-square rounded.md flex flex-col items-center justify-center text-sm font-medium border transition-colors relative overflow-hidden bg-[#1f2126]",
                                            i + 1 === currentEpisodeNumber
                                                ? "text-[#00cc55] border border-[#00cc55]/20 bg-[#00cc55]/5"
                                                : "text-gray-400 border-transparent active:scale-95"
                                        )}
                                    >
                                        <span className={cn("z-10", i + 1 === currentEpisodeNumber && "font-bold")}>{i + 1}</span>
                                        {i + 1 > 10 && <span className="absolute bottom-1 text-[8px] text-[#b68d40] uppercase">VIP</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {drama?.description || "Tidak ada deskripsi."}
                            </p>

                            {/* Recommendations */}
                            {recommendations && recommendations.length > 0 && (
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-3">Rekomendasi</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {recommendations.map((rec: any) => (
                                            <Link key={rec.id} href={`/watch/${rec.id}?provider=${rec.provider}`} className="block group">
                                                <div className="aspect-[3/4] rounded-lg overflow-hidden relative bg-gray-800 mb-2">
                                                    {rec.image && <Image src={rec.image} alt={rec.title} fill className="object-cover" />}
                                                </div>
                                                <div className="text-xs text-white line-clamp-2">{rec.title}</div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* === 4. Settings Drawer === */}
            <div className={cn(
                "absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
                isSettingsOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )} onClick={() => setIsSettingsOpen(false)}>
                {/* ... Same settings content ... */}
                <div
                    className={cn(
                        "absolute bottom-0 left-0 right-0 bg-[#121212] rounded-t-xl overflow-hidden transition-transform duration-300",
                        isSettingsOpen ? "translate-y-0" : "translate-y-full"
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="space-y-1">
                        <button className="w-full flex justify-between items-center p-4 border-b border-white/5 active:bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-1 border border-white rounded text-[10px] uppercase px-1.5">CC</div>
                                <span className="text-white text-sm font-medium">Subtitle</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                                <span>Bahasa Indonesia</span>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </button>

                        <button className="w-full flex justify-between items-center p-4 border-b border-white/5 active:bg-white/5">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-white text-xs px-1">🔊</span>
                                <span className="text-white text-sm font-medium">Dubbing</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                                <span>Bahasa Mandarin</span>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </button>

                        <button className="w-full flex justify-between items-center p-4 border-b border-white/5 active:bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-0.5 border border-white rounded text-[9px] font-bold px-1">HQ</div>
                                <span className="text-white text-sm font-medium">Kualitas</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                                <span>4K</span>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </button>

                        <button className="w-full flex justify-between items-center p-4 border-b border-white/5 active:bg-white/5" onClick={() => {
                            const rates = [1.0, 1.25, 1.5, 2.0];
                            const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
                            changeSpeed(nextRate);
                        }}>
                            <div className="flex items-center gap-3">
                                <Play className="w-4 h-4 text-white fill-white" />
                                <span className="text-white text-sm font-medium">Kelipatan laju</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-xs">
                                <span>{playbackRate.toFixed(1)}X</span>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </button>
                    </div>

                    <button
                        className="w-full p-4 text-center text-white text-sm font-medium border-t border-white/10 active:bg-white/5"
                        onClick={() => setIsSettingsOpen(false)}
                    >
                        Batal
                    </button>
                </div>
            </div>

        </div>
    );
}
