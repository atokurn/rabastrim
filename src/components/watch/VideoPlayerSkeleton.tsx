"use client";

import { Loader2 } from "lucide-react";

interface VideoPlayerSkeletonProps {
    title?: string;
    cover?: string;
}

export function VideoPlayerSkeleton({ title, cover }: VideoPlayerSkeletonProps) {
    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Video Area */}
            <div className="flex-1 relative flex items-center justify-center">
                {cover ? (
                    <img
                        src={decodeURIComponent(cover)}
                        alt={title || "Loading..."}
                        className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1a1c20] to-black" />
                )}

                {/* Loading Spinner */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <Loader2 className="w-16 h-16 text-[#00cc55] animate-spin" />
                    <p className="text-white/70 text-sm">Memuat video...</p>
                </div>

                {/* Title Overlay */}
                {title && (
                    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
                        <h1 className="text-white font-medium text-lg drop-shadow">
                            {decodeURIComponent(title)}
                        </h1>
                    </div>
                )}
            </div>

            {/* Bottom Controls Skeleton */}
            <div className="p-4 bg-gradient-to-t from-black to-transparent">
                {/* Progress Bar Skeleton */}
                <div className="w-full h-1 bg-gray-700 rounded-full mb-4">
                    <div className="w-0 h-full bg-[#00cc55] rounded-full" />
                </div>

                {/* Controls Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-700/50 rounded-full animate-pulse" />
                        <div className="w-20 h-4 bg-gray-700/50 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-700/50 rounded animate-pulse" />
                        <div className="w-8 h-8 bg-gray-700/50 rounded animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Desktop variant
export function DesktopPlayerSkeleton({ title, cover }: VideoPlayerSkeletonProps) {
    return (
        <div className="pt-16 pb-20">
            {/* Video Player Skeleton */}
            <div className="w-full aspect-video bg-black relative rounded-lg overflow-hidden">
                {cover ? (
                    <img
                        src={decodeURIComponent(cover)}
                        alt={title || "Loading..."}
                        className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1a1c20] to-black" />
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-16 h-16 text-[#00cc55] animate-spin" />
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="container mx-auto px-4 py-4 hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Title Skeleton */}
                    <div className="space-y-2">
                        <div className="h-8 bg-gray-700/50 rounded w-2/3 animate-pulse" />
                        <div className="h-4 bg-gray-700/50 rounded w-1/3 animate-pulse" />
                    </div>

                    {/* Description Skeleton */}
                    <div className="bg-[#1f2126] p-4 rounded-lg space-y-2">
                        <div className="h-5 bg-gray-700/50 rounded w-24 animate-pulse" />
                        <div className="h-4 bg-gray-700/50 rounded w-full animate-pulse" />
                        <div className="h-4 bg-gray-700/50 rounded w-4/5 animate-pulse" />
                    </div>
                </div>

                {/* Episode List Skeleton */}
                <div className="hidden lg:block">
                    <div className="bg-[#1f2126] rounded-lg p-4">
                        <div className="h-6 bg-gray-700/50 rounded w-24 mb-4 animate-pulse" />
                        <div className="grid grid-cols-5 gap-2">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <div key={i} className="aspect-square bg-gray-700/50 rounded animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
