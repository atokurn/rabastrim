import { Play, Share2, Heart, Download, Loader2 } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { cn } from "@/lib/utils";
import { DramaBoxApi } from "@/lib/api/dramabox";
import { FlickReelsApi } from "@/lib/api/flickreels";
import { SansekaiApi } from "@/lib/api/sansekai";
import Link from "next/link";
import { VideoPlayer } from "@/components/watch/VideoPlayer";

interface WatchPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ ep?: string; provider?: string }>;
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
    if (provider === "netshort") {
        // NetShort: Use allepisode API which returns episodes with playVoucher
        const data = await fetch(`https://api.sansekai.my.id/api/netshort/allepisode?shortPlayId=${id}`, {
            next: { revalidate: 300 },
        }).then(r => r.json()).catch(() => null);

        if (!data) return { drama: null, episodes: [], currentVideoUrl: null };

        const episodes: EpisodeInfo[] = (data.shortPlayEpisodeInfos || []).map((ep: {
            episodeId: string;
            episodeNo: number;
            playVoucher?: string;
        }) => ({
            id: ep.episodeId,
            number: ep.episodeNo,
            videoUrl: ep.playVoucher || null,
        }));

        const currentEp = episodes.find(e => e.number === episodeNum) || episodes[0];

        return {
            drama: {
                title: data.shortPlayName || "Untitled",
                cover: data.shortPlayCover || "",
                description: data.shotIntroduce,
                tags: data.shortPlayLabels,
                totalEpisodes: data.totalEpisode || episodes.length,
            },
            episodes,
            currentVideoUrl: currentEp?.videoUrl || null,
        };
    }

    if (provider === "melolo") {
        // Melolo: Get detail for drama info, then stream API for video
        const detailData = await fetch(`https://api.sansekai.my.id/api/melolo/detail?bookId=${id}`, {
            next: { revalidate: 300 },
        }).then(r => r.json()).catch(() => null);

        const videoData = detailData?.data?.video_data;
        if (!videoData) return { drama: null, episodes: [], currentVideoUrl: null };

        const episodes: EpisodeInfo[] = (videoData.video_list || []).map((ep: {
            vid: string;
            vid_index: number;
            title?: string;
        }, idx: number) => ({
            id: ep.vid,
            number: ep.vid_index || idx + 1,
            videoUrl: null, // Will fetch separately
        }));

        // Get video URL for current episode
        const currentEp = episodes.find(e => e.number === episodeNum) || episodes[0];
        let currentVideoUrl: string | null = null;

        if (currentEp?.id) {
            const streamData = await fetch(`https://api.sansekai.my.id/api/melolo/stream?videoId=${currentEp.id}`, {
                next: { revalidate: 60 },
            }).then(r => r.json()).catch(() => null);

            currentVideoUrl = streamData?.data?.backup_url || streamData?.data?.url || null;
        }

        return {
            drama: {
                title: videoData.series_title || "Untitled",
                cover: videoData.series_cover || "",
                description: videoData.series_intro,
                totalEpisodes: videoData.episode_cnt || episodes.length,
            },
            episodes,
            currentVideoUrl,
        };
    }

    if (provider === "anime") {
        // Anime: Get detail with urlId parameter
        const detailData = await fetch(`https://api.sansekai.my.id/api/anime/detail?urlId=${encodeURIComponent(id)}`, {
            next: { revalidate: 300 },
        }).then(r => r.json()).catch(() => null);

        // Handle potential error response
        if (!detailData || detailData.error) {
            return { drama: null, episodes: [], currentVideoUrl: null };
        }

        const animeData = detailData?.data?.[0] || detailData;
        const chapters = animeData?.chapter || [];

        const episodes: EpisodeInfo[] = chapters.map((ch: { url?: string; judul?: string }, idx: number) => ({
            id: ch.url || String(idx + 1),
            number: idx + 1,
            videoUrl: null, // Need to call getvideo API
        }));

        // Get video URL for current episode
        const currentEp = episodes[episodeNum - 1] || episodes[0];
        let currentVideoUrl: string | null = null;

        if (currentEp?.id) {
            const videoData = await fetch(`https://api.sansekai.my.id/api/anime/getvideo?url=${encodeURIComponent(currentEp.id)}`, {
                next: { revalidate: 60 },
            }).then(r => r.json()).catch(() => null);

            currentVideoUrl = videoData?.url || videoData?.video?.url || null;
        }

        return {
            drama: {
                title: animeData?.judul || "Untitled",
                cover: animeData?.cover || "",
                description: animeData?.sinopsis,
                totalEpisodes: chapters.length,
            },
            episodes,
            currentVideoUrl,
        };
    }

    if (provider === "flickreels") {
        // FlickReels: Use foryou API for drama info, episodes API for video
        const [allDramas, episodesData] = await Promise.all([
            FlickReelsApi.getForYou(),
            FlickReelsApi.getEpisodes(id),
        ]);

        const drama = allDramas.find(d => d.playlet_id === id);

        const episodes: EpisodeInfo[] = episodesData.map((ep) => ({
            id: ep.chapter_id,
            number: ep.chapter_num,
            videoUrl: ep.videoUrl || ep.hls_url || ep.down_url || null, // Use videoUrl for VIP bypass
        }));

        const currentEpisode = episodes.find(e => e.number === episodeNum) || episodes[0];

        return {
            drama: drama ? {
                title: drama.playlet_title || "Untitled",
                cover: drama.cover || drama.process_cover || "",
                description: undefined,
                tags: drama.tag_list?.map(t => t.tag_name),
                totalEpisodes: drama.chapter_num || episodes.length,
            } : null,
            episodes,
            currentVideoUrl: currentEpisode?.videoUrl || null,
        };
    }

    // Default: DramaBox
    const [allDramas, episodes] = await Promise.all([
        DramaBoxApi.getHome(),
        DramaBoxApi.getEpisodes(id),
    ]);

    const drama = allDramas.find(d => d.bookId === id);
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
    const { ep = "1", provider = "dramabox" } = await searchParams;
    const currentEp = parseInt(ep) || 1;

    const { drama, episodes, currentVideoUrl } = await fetchProviderData(id, provider, currentEp);
    const totalEps = drama?.totalEpisodes || episodes.length;
    const nextEpisode = episodes.find(e => e.number === currentEp + 1);

    // Get recommendations based on provider
    let recommendations: Array<{ id: string; title: string; image: string; provider: string }> = [];
    try {
        if (provider === "netshort") {
            const theaters = await SansekaiApi.netshort.getTheaters();
            recommendations = theaters.slice(0, 8).map((d: { shortPlayId?: string; shortPlayName?: string; shortPlayCover?: string }) => ({
                id: d.shortPlayId || "",
                title: d.shortPlayName || "Untitled",
                image: d.shortPlayCover || "",
                provider: "netshort",
            }));
        } else if (provider === "melolo") {
            const trending = await SansekaiApi.melolo.getTrending();
            recommendations = trending.slice(0, 8).map((d: { book_id?: string; book_name?: string; thumb_url?: string; cover?: string }) => {
                const rawImage = d.thumb_url || d.cover || "";
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
            recommendations = forYou.filter(d => d.playlet_id !== id).slice(0, 8).map(d => ({
                id: d.playlet_id,
                title: d.playlet_title || "Untitled",
                image: d.cover || d.process_cover || "",
                provider: "flickreels",
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
                poster={drama?.cover}
                title={drama?.title || "Untitled"}
                dramaId={id}
                provider={provider}
                currentEpisodeNumber={currentEp}
                totalEpisodes={totalEps}
                episodes={episodes}
                nextEpisode={nextEpisode}
                drama={drama}
                recommendations={recommendations}
            />

            <div className="container mx-auto px-0 md:px-4 py-4 hidden lg:grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Info */}
                <div className="lg:col-span-2 px-4 md:px-0 space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                {drama?.title || `Drama ID: ${id}`}
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
                            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
                                <Heart className="w-5 h-5" />
                                <span className="text-xs">Collect</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-white">
                                <Download className="w-5 h-5" />
                                <span className="text-xs">Download</span>
                            </button>
                        </div>
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

                        <div className="grid grid-cols-5 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {totalEps > 0 ? (
                                Array.from({ length: totalEps }, (_, i) => i + 1).map(epNum => (
                                    <Link
                                        key={epNum}
                                        href={`/watch/${id}?ep=${epNum}&provider=${provider}`}
                                        className={cn(
                                            "aspect-square rounded flex items-center justify-center text-sm font-medium transition-colors border",
                                            currentEp === epNum
                                                ? "bg-[#00cc55] text-black border-[#00cc55] font-bold"
                                                : "bg-[#2e3036] text-gray-300 border-transparent hover:border-gray-500"
                                        )}
                                    >
                                        {epNum}
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-5 text-center text-gray-400 py-4">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Loading episodes...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
