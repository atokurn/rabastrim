import { Play, Share2, Download, Loader2 } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import { DramaBoxApi } from "@/lib/api/dramabox";
import { FlickReelsApi } from "@/lib/api/flickreels";
import { MeloloApi } from "@/lib/api/melolo";
import { DramaWaveApi } from "@/lib/api/dramawave";
import { DramaQueenApi } from "@/lib/api/dramaqueen";
import Link from "next/link";
import { VideoPlayer } from "@/components/watch/VideoPlayer";
import { FavoriteButton } from "@/components/watch/FavoriteButton";
import { EpisodeList } from "@/components/watch/EpisodeList";

/**
 * Proxy video URLs with embedded credentials (user:pass@host) through /api/video-proxy
 * This is needed because browsers block credential-embedded URLs for security.
 */
function proxyCredentialUrl(url: string | null): string | null {
    if (!url) return null;
    // Check if URL contains embedded credentials (user:pass@host)
    if (url.includes("@") && (url.startsWith("http://") || url.startsWith("https://"))) {
        return `/api/video-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
}

interface WatchPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ ep?: string; provider?: string; title?: string; cover?: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DramaInfo {
    title: string;
    cover: string;
    description?: string;
    score?: string;
    tags?: string[];
    totalEpisodes: number;
}

interface EpisodeInfo {
    id: string;
    number: number;
    videoUrl: string | null;
}

// Fetch drama and episodes based on provider
async function fetchProviderData(id: string, provider: string, episodeNum: number): Promise<{
    drama: DramaInfo | null;
    episodes: EpisodeInfo[];
    currentVideoUrl: string | null;
}> {
    if (provider === "melolo") {
        // Melolo: Use new MeloloApi for detail and stream
        const [detail, directory] = await Promise.all([
            MeloloApi.getDetail(id),
            MeloloApi.getDirectory(id),
        ]);

        if (!detail) return { drama: null, episodes: [], currentVideoUrl: null };

        const episodes: EpisodeInfo[] = directory.map((ep, idx: number) => ({
            id: ep.vid,
            number: (ep.vid_index ?? idx) + 1,
            videoUrl: null, // Will fetch separately
        }));

        // Get video URL for current episode
        const currentEp = episodes.find(e => e.number === episodeNum) || episodes[0];
        let currentVideoUrl: string | null = null;

        if (currentEp?.id) {
            const stream = await MeloloApi.getStream(currentEp.id);
            currentVideoUrl = stream?.main_url || stream?.backup_url || stream?.url || null;
        }

        // Convert HEIC cover to WebP for browser compatibility
        const rawCover = detail.thumb_url || detail.cover_url || "";
        const cover = rawCover && rawCover.includes(".heic")
            ? `https://wsrv.nl/?url=${encodeURIComponent(rawCover)}&output=webp&q=85`
            : rawCover;

        return {
            drama: {
                title: detail.book_name || "Untitled",
                cover,
                description: detail.abstract || detail.introduction,
                totalEpisodes: detail.serial_count || episodes.length,
            },
            episodes,
            currentVideoUrl,
        };
    }

    if (provider === "dramawave") {
        // DramaWave: Use getDetail for drama info and getStream for episode video
        const detail = await DramaWaveApi.getDetail(id);

        if (!detail) return { drama: null, episodes: [], currentVideoUrl: null };

        const episodeCount = detail.episodeCount || 0;
        const episodes: EpisodeInfo[] = [];

        // Generate episode list
        for (let i = 1; i <= episodeCount; i++) {
            episodes.push({
                id: `${id}-ep-${i}`,
                number: i,
                videoUrl: null, // Will be fetched via stream when playing
            });
        }

        // Get video URL for requested episode number using play endpoint
        let currentVideoUrl: string | null = null;
        if (episodeNum === 1 && detail.currentEpisode?.videoUrl) {
            // For episode 1, use detail.currentEpisode if available
            currentVideoUrl = detail.currentEpisode.videoUrl;
        } else {
            // For other episodes, fetch via getStream
            currentVideoUrl = await DramaWaveApi.getStream(id, episodeNum);
        }

        return {
            drama: {
                title: detail.title || "Untitled",
                cover: detail.cover || "",
                description: detail.description,
                tags: detail.tags,
                totalEpisodes: episodeCount,
            },
            episodes,
            currentVideoUrl,
        };
    }

    if (provider === "flickreels") {
        // FlickReels: Use getDetail for drama info (merges detail + episodes endpoints)
        // and getEpisodes for full episode list
        const [drama, episodesData] = await Promise.all([
            FlickReelsApi.getDetail(id),
            FlickReelsApi.getEpisodes(id),
        ]);

        const episodes: EpisodeInfo[] = episodesData.map((ep) => ({
            id: ep.chapter_id,
            number: ep.chapter_num,
            videoUrl: ep.videoUrl || ep.hls_url || ep.down_url || null, // Use videoUrl for VIP bypass
        }));

        const currentEpisode = episodes.find(e => e.number === episodeNum) || episodes[0];

        return {
            drama: drama ? {
                title: drama.playlet_title || drama.title || "Untitled",
                cover: drama.cover || drama.process_cover || "",
                description: drama.introduce,
                tags: drama.tag_list?.map(t => t.tag_name),
                // Use episodes.length as primary source since API chapter_num is current episode (not total)
                totalEpisodes: episodes.length || drama.upload_num || drama.chapter_num || 0,
            } : null,
            episodes,
            currentVideoUrl: currentEpisode?.videoUrl || null,
        };
    }

    if (provider === "dramaqueen") {
        // Drama Queen: Use getDetail for drama info and getEpisodes for episodes
        const [detail, episodesData] = await Promise.all([
            DramaQueenApi.getDetail(id),
            DramaQueenApi.getEpisodes(id),
        ]);

        if (!detail) return { drama: null, episodes: [], currentVideoUrl: null };

        const episodes: EpisodeInfo[] = episodesData.map((ep) => ({
            id: String(ep.id),
            number: ep.number,
            videoUrl: ep.videoUrl || null,
        }));

        const currentEpisode = episodes.find(e => e.number === episodeNum) || episodes[0];

        return {
            drama: {
                title: detail.title || "Untitled",
                cover: detail.cover || detail.landscapeCover || "",
                description: detail.description,
                score: detail.rating,
                tags: detail.genres,
                totalEpisodes: detail.totalEpisodes || detail.episodes || episodes.length,
            },
            episodes,
            currentVideoUrl: proxyCredentialUrl(currentEpisode?.videoUrl || null),
        };
    }

    if (provider === "donghua") {
        // Donghua: Use getDonghuaDetail for info and getDonghuaEpisodes for episodes
        const detail = await DramaQueenApi.getDonghuaDetail(id);

        if (!detail) return { drama: null, episodes: [], currentVideoUrl: null };

        // Donghua episodes are embedded in detail response, use getDonghuaEpisodes
        const episodesData = await DramaQueenApi.getDonghuaEpisodes(id);

        const episodes: EpisodeInfo[] = episodesData.map((ep) => ({
            id: String(ep.id),
            number: ep.number,
            videoUrl: ep.videoUrl || null,
        }));

        const currentEpisode = episodes.find(e => e.number === episodeNum) || episodes[0];

        return {
            drama: {
                title: detail.title || "Untitled",
                cover: detail.cover || "",
                description: detail.description,
                score: detail.rating,
                tags: detail.genres,
                totalEpisodes: detail.totalEpisodes || detail.episodes || episodes.length,
            },
            episodes,
            currentVideoUrl: proxyCredentialUrl(currentEpisode?.videoUrl || null),
        };
    }

    // Default: DramaBox - Use getDetail directly instead of searching in home list
    const [drama, episodes] = await Promise.all([
        DramaBoxApi.getDetail(id),
        DramaBoxApi.getEpisodes(id),
    ]);

    const currentEpisode = episodes.find(e => e.number === episodeNum) || episodes[0];

    return {
        drama: drama ? {
            title: drama.bookName || "Untitled",
            cover: drama.coverWap || drama.cover || "",
            description: drama.introduction,
            score: drama.score,
            tags: drama.tags,
            totalEpisodes: episodes.length || drama.chapterCount || 0,
        } : null,
        episodes: episodes.map(e => ({
            id: e.id,
            number: e.number,
            videoUrl: e.videoUrl || null,
        })),
        currentVideoUrl: currentEpisode?.videoUrl || null,
    };
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
    const { id } = await params;
    const { ep = "1", provider = "dramabox", title: urlTitle, cover: urlCover } = await searchParams;
    const currentEp = parseInt(ep) || 1;

    const { drama, episodes, currentVideoUrl } = await fetchProviderData(id, provider, currentEp);

    // Use URL title as fallback if API returned null/Untitled
    const displayTitle = drama?.title && drama.title !== "Untitled"
        ? drama.title
        : (urlTitle ? decodeURIComponent(urlTitle) : drama?.title || "Untitled");

    // Use URL cover as fallback if API returned null/empty cover
    const displayCover = drama?.cover || (urlCover ? decodeURIComponent(urlCover) : "");

    const totalEps = drama?.totalEpisodes || episodes.length;
    const nextEpisode = episodes.find(e => e.number === currentEp + 1);

    // Get recommendations based on provider
    let recommendations: Array<{ id: string; title: string; image: string; provider: string }> = [];
    try {
        if (provider === "melolo") {
            const trending = await MeloloApi.getTrending();
            recommendations = trending.slice(0, 8).map((d) => {
                const rawImage = d.thumb_url || d.cover_url || "";
                const image = rawImage.includes(".heic")
                    ? `https://wsrv.nl/?url=${encodeURIComponent(rawImage)}&output=webp&q=85`
                    : rawImage;
                return {
                    id: d.book_id || "",
                    title: d.book_name || "Untitled",
                    image,
                    provider: "melolo",
                };
            });
        } else if (provider === "flickreels") {
            const forYou = await FlickReelsApi.getForYou();
            recommendations = forYou.filter(d => String(d.playlet_id) !== id).slice(0, 8).map(d => ({
                id: String(d.playlet_id),
                title: d.playlet_title || "Untitled",
                image: d.cover || d.process_cover || "",
                provider: "flickreels",
            }));
        } else if (provider === "dramaqueen") {
            const popular = await DramaQueenApi.getPopular();
            recommendations = popular.filter(d => String(d.id) !== id).slice(0, 8).map(d => ({
                id: String(d.id),
                title: d.title || "Untitled",
                image: d.cover || d.landscapeCover || "",
                provider: "dramaqueen",
            }));
        } else {
            const allDramas = await DramaBoxApi.getHome();
            recommendations = allDramas.filter(d => d.bookId !== id).slice(0, 8).map(d => ({
                id: d.bookId,
                title: d.bookName || "Untitled",
                image: d.coverWap || d.cover || "",
                provider: "dramabox",
            }));
        }
    } catch (e) {
        console.error("Failed to fetch recommendations:", e);
    }

    return (
        <div className="pt-16 pb-20">
            {/* New Video Player with Client Logic */}
            <VideoPlayer
                src={currentVideoUrl || ""}
                poster={displayCover}
                title={displayTitle}
                dramaId={id}
                provider={provider}
                currentEpisodeNumber={currentEp}
                totalEpisodes={totalEps}
                episodes={episodes}
                nextEpisode={nextEpisode}
                drama={drama ? { ...drama, cover: displayCover } : null}
                recommendations={recommendations}
            />

            <div className="container mx-auto px-0 md:px-4 py-4 hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Info */}
                <div className="lg:col-span-2 px-4 md:px-0 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                {displayTitle}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                {drama?.score && (
                                    <span className="text-[#00cc55] font-bold">{drama.score}</span>
                                )}
                                {totalEps > 0 && <span>{totalEps} Episodes</span>}
                                {drama?.tags && drama.tags.length > 0 && (
                                    <span>{drama.tags.slice(0, 3).join(", ")}</span>
                                )}
                                <span className="capitalize text-xs bg-[#2e3036] px-2 py-1 rounded">{provider}</span>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
                                <Share2 className="w-5 h-5" />
                                <span className="text-xs">Share</span>
                            </button>
                            <FavoriteButton
                                bookId={id}
                                provider={provider}
                                title={displayTitle}
                                cover={displayCover}
                                variant="with-label"
                            />
                            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
                                <Download className="w-5 h-5" />
                                <span className="text-xs">Download</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile/Tablet Episode List (Hidden on Desktop) */}
                    <div className="lg:hidden bg-[#1f2126] p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-white">Episodes</h3>
                            <span className="text-xs text-gray-400">Total {totalEps}</span>
                        </div>

                        <EpisodeList
                            totalEpisodes={totalEps}
                            currentEpisode={currentEp}
                            dramaId={id}
                            provider={provider}
                            gridClassName="grid-cols-5 sm:grid-cols-8 md:grid-cols-10"
                            maxHeightClassName="max-h-[300px]"
                        />
                    </div>

                    {drama?.description && (
                        <div className="bg-[#1f2126] p-4 rounded-lg">
                            <h3 className="font-bold text-lg mb-2 text-white">Deskripsi</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {drama.description}
                            </p>
                        </div>
                    )}

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <Section
                            title="Kamu Mungkin Suka"
                            items={recommendations}
                        />
                    )}
                </div>

                {/* Sidebar: Episode List (Desktop only) */}
                <div className="px-4 md:px-0 hidden lg:block">
                    <div className="bg-[#1f2126] rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-white">Episodes</h3>
                            <span className="text-xs text-gray-400">Total {totalEps}</span>
                        </div>

                        <EpisodeList
                            totalEpisodes={totalEps}
                            currentEpisode={currentEp}
                            dramaId={id}
                            provider={provider}
                            gridClassName="grid-cols-5"
                            maxHeightClassName="max-h-[500px]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
