import Link from "next/link";
import { Play } from "lucide-react";

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

                {/* Overlay Play Icon */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-10 h-10 rounded-full bg-[#00cc55] flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                    </div>
                </div>

                {/* Progress Bar for History */}
                {type === 'history' && progress !== undefined && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div
                            className="h-full bg-[#00cc55]"
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                        />
                    </div>
                )}

                {/* Episode Badge (if not history or even if history) */}
                {episode && (
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded">
                        EP {episode}
                    </div>
                )}

                {/* Provider Badge */}
                <div className="absolute top-2 left-2 bg-purple-500/80 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded capitalize">
                    {provider}
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
