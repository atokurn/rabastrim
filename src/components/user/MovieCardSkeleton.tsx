import { cn } from "@/lib/utils";

export function MovieCardSkeleton() {
    return (
        <div className="flex flex-col gap-2 w-full animate-pulse">
            {/* Image Placeholder */}
            <div className="aspect-[3/4] rounded-lg bg-[#1f2126]/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>

            {/* Title Placeholder */}
            <div className="flex flex-col gap-1.5 pt-1">
                <div className="h-4 bg-[#1f2126] rounded w-3/4" />
                <div className="h-3 bg-[#1f2126] rounded w-1/2" />
            </div>
        </div>
    );
}
