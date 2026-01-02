import { VideoPlayerSkeleton, DesktopPlayerSkeleton } from "@/components/watch/VideoPlayerSkeleton";

export default function Loading() {
    // This loading.tsx is shown immediately when navigating to /watch/[id]
    // while the server fetches data

    // We can't access searchParams here, so show a generic skeleton
    // The actual title/cover from URL will be shown once the page loads
    return (
        <>
            {/* Mobile Skeleton (shown on mobile screens) */}
            <div className="md:hidden">
                <VideoPlayerSkeleton />
            </div>

            {/* Desktop Skeleton (shown on desktop screens) */}
            <div className="hidden md:block">
                <DesktopPlayerSkeleton />
            </div>
        </>
    );
}
