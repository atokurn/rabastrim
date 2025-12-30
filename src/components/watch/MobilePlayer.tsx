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

    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'episodes'>('episodes');
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const goToEpisode = (epNum: number) => {
        router.push(`/watch/${dramaId}?ep=${epNum}&provider=${provider}`);
        setIsSheetOpen(false);
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

    useEffect(() => {
        if (isSheetOpen || isSettingsOpen) {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            setShowControls(true);
        } else {
            resetControls();
        }
    }, [isSheetOpen, isSettingsOpen, resetControls]);


    // Derived formatting
    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div ref={containerRef} className="fixed inset-0 z-50 bg-black overflow-hidden group font-sans">

            {/* === 1. Fullscreen Video Layer === */}
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

            {/* Play/Pause Center Icon */}
            {!isPlaying && !isLoading && !isSheetOpen && !isSettingsOpen && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-16 h-16 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm animate-in fade-in zoom-in duration-200">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* === 2. Overlays (Visible based on showControls) === */}
            <div className={cn("absolute inset-0 pointer-events-none transition-opacity duration-500",
                isSheetOpen ? "opacity-0" : "opacity-100"
            )}>

                {/* Top Bar (Title & Back) - Hides automatically */}
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

                {/* Right Sidebar Actions - Hides automatically */}
                <div className={cn(
                    "absolute right-2 bottom-32 flex flex-col gap-6 items-center pointer-events-auto z-20 transition-opacity duration-300",
                    showControls ? "opacity-100" : "opacity-0"
                )}>
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

                {/* Bottom Left Info - Hides automatically */}
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

                {/* Progress Bar - ALWAYS VISIBLE (requested) */}
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

                {/* Bottom Episode Bar - ALWAYS VISIBLE (requested) */}
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
            <div className={cn(
                "absolute inset-x-0 bottom-0 bg-[#121212] rounded-t-xl z-50 flex flex-col transition-transform duration-300 ease-out border-t border-white/5 shadow-2xl h-[70%]",
                isSheetOpen ? "translate-y-0" : "translate-y-full"
            )}>
                {/* Drag Handle / Close */}
                <div className="h-10 flex items-center justify-center shrink-0 cursor-pointer border-b border-white/5" onClick={() => setIsSheetOpen(false)}>
                    <div className="w-12 h-1 bg-white/20 rounded-full" />
                </div>

                {/* Drama Header Info */}
                <div className="px-4 py-4 flex gap-4 shrink-0 bg-[#121212]">
                    <div className="w-16 h-24 bg-gray-800 rounded-md overflow-hidden shrink-0 relative shadow-md">
                        {drama?.cover && <Image src={drama.cover} alt={title} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h2 className="text-white font-bold text-base leading-tight line-clamp-2 mb-1">{title}</h2>
                        <div className="text-xs text-gray-400 mb-3">Updated to {totalEpisodes} episodes</div>
                        <div className="flex gap-2">
                            <button className="px-4 py-1.5 bg-[#00cc55] text-white text-xs font-bold rounded-full">
                                Putar
                            </button>
                            <button className="px-4 py-1.5 bg-white/10 text-white text-xs font-bold rounded-full">
                                Favorit
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 px-4 shrink-0 sticky top-0 bg-[#121212] z-10">
                    <button
                        onClick={() => setActiveTab('episodes')}
                        className={cn("flex-1 py-3 text-sm font-bold relative transition-colors", activeTab === 'episodes' ? "text-[#00cc55]" : "text-gray-400")}
                    >
                        Pilih episode
                        {activeTab === 'episodes' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#00cc55] rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('details')}
                        className={cn("flex-1 py-3 text-sm font-bold relative transition-colors", activeTab === 'details' ? "text-[#00cc55]" : "text-gray-400")}
                    >
                        Sinopsis
                        {activeTab === 'details' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#00cc55] rounded-full" />}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#121212]">
                    {activeTab === 'episodes' ? (
                        <div className="">
                            {/* Episode Ranges (Mock) */}
                            <div className="flex gap-4 text-xs font-medium text-gray-400 mb-4 sticky top-0 bg-[#121212] py-2 z-10">
                                <button className="text-[#00cc55] bg-[#00cc55]/10 px-3 py-1 rounded-full">1-50</button>
                                <button className="hover:text-white px-3 py-1">51-{totalEpisodes}</button>
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: totalEpisodes }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => goToEpisode(i + 1)}
                                        className={cn(
                                            "aspect-square rounded flex flex-col items-center justify-center text-xs font-medium border transition-colors relative overflow-hidden",
                                            i + 1 === currentEpisodeNumber
                                                ? "text-[#00cc55]"
                                                : "text-gray-400 hover:text-white"
                                        )}
                                    >
                                        <span className={cn("z-10", i + 1 === currentEpisodeNumber && "scale-125 font-bold")}>{i + 1}</span>
                                        {i + 1 === currentEpisodeNumber && <div className="absolute bottom-1 w-1 h-1 bg-[#00cc55] rounded-full" />}
                                        {i > 10 && <div className="absolute top-0 right-0 w-2 h-2 bg-[#b68d40] rounded-bl-full" />}
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
