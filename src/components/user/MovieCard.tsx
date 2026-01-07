import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface MovieCardProps {
    id: string; // The book ID
    title: string;
    cover: string;
    provider: string;
    episode?: number;
    progress?: number;
    type?: 'history' | 'favorite' | 'default';
}

export function MovieCard({
    id,
    title,
    cover,
    provider,
    episode,
    progress,
    type = 'default'
}: MovieCardProps) {
    // Build href with optional episode for history resume
    const baseHref = `/watch/${id}?provider=${provider}&title=${encodeURIComponent(title)}&cover=${encodeURIComponent(cover)}`;
    const href = episode ? `${baseHref}&ep=${episode}` : baseHref;

    // Provider colors mapping
    const getProviderColor = (p: string) => {
        const colors: Record<string, string> = {
            melolo: "bg-purple-600",
            drambox: "bg-red-600",
            dramaqueen: "bg-pink-600",
            flickreels: "bg-blue-600",
        };
        return colors[p.toLowerCase()] || "bg-gray-600";
    };

    return (
        <Link href={href} className="group relative flex flex-col gap-2 w-full">
            {/* Aspect Ratio Container */}
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#1f2126] shadow-md group-hover:shadow-lg transition-shadow">
                {cover ? (
                    <img
                        src={cover}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">
                        No Image
                    </div>
                )}

                {/* Overlay Play Icon - Always visible for history items on mobile (simulated by having it base visible) or group hover */}
                {/* For history items, we want a prominent play button as per design */}
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center transition-all bg-black/10 group-hover:bg-black/30",
                    type === 'history' ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                    <div className={cn(
                        "w-10 h-10 rounded-full bg-[#00cc55] flex items-center justify-center shadow-lg transition-transform",
                        type === 'history' ? "scale-100" : "scale-90 group-hover:scale-100"
                    )}>
                        <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                    </div>
                </div>

                {/* Progress Bar for History */}
                {type === 'history' && progress !== undefined && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div
                            className="h-full bg-[#00cc55]"
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                    </div>
                )}

                {/* Badges Container - Top */}
                <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1 z-10 pointer-events-none">
                    {/* Provider Badge */}
                    <div className={cn(
                        "text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider backdrop-blur-md shadow-sm shrink min-w-0 truncate",
                        getProviderColor(provider)
                    )}>
                        {provider}
                    </div>

                    {/* Episode Badge (if not history or even if history) */}
                    {episode && (
                        <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-sm shrink-0">
                            EP {episode}
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-medium text-gray-200 line-clamp-1 group-hover:text-[#00cc55] transition-colors">
                    {title}
                </h3>
                {type === 'history' && episode && (
                    <p className="text-xs text-gray-500">
                        Melanjutkan Episode {episode}
                    </p>
                )}
            </div>
        </Link>
    );
}
