"use server";

import { SansekaiApi } from "@/lib/api/sansekai";
import { DramaBoxApi } from "@/lib/api/dramabox";
import { FlickReelsApi } from "@/lib/api/flickreels";

export async function getVideoUrl(
    dramaId: string,
    provider: string,
    episodeNumber: number
): Promise<string | null> {
    try {
        if (provider === "netshort") {
            const data = await fetch(`https://api.sansekai.my.id/api/netshort/allepisode?shortPlayId=${dramaId}`, {
                next: { revalidate: 300 },
            }).then(r => r.json()).catch(() => null);

            if (!data?.shortPlayEpisodeInfos) return null;

            const episode = data.shortPlayEpisodeInfos.find((ep: any) => ep.episodeNo === episodeNumber);
            return episode?.playVoucher || null;
        }

        if (provider === "melolo") {
            // Needed to get the video ID first
            const detailData = await fetch(`https://api.sansekai.my.id/api/melolo/detail?bookId=${dramaId}`, {
                next: { revalidate: 300 },
            }).then(r => r.json()).catch(() => null);

            const videoData = detailData?.data?.video_data?.video_list;
            if (!videoData) return null;

            // Melolo episodes might use 1-based index or array index
            // Assuming sorted by index or relying on finding by index
            const episode = videoData.find((ep: any) => (ep.vid_index || 0) === episodeNumber) || videoData[episodeNumber - 1];

            if (episode?.vid) {
                const streamData = await fetch(`https://api.sansekai.my.id/api/melolo/stream?videoId=${episode.vid}`, {
                    next: { revalidate: 60 },
                }).then(r => r.json()).catch(() => null);
                return streamData?.data?.backup_url || streamData?.data?.url || null;
            }
            return null;
        }

        if (provider === "anime") {
            const detailData = await fetch(`https://api.sansekai.my.id/api/anime/detail?urlId=${encodeURIComponent(dramaId)}`, {
                next: { revalidate: 300 },
            }).then(r => r.json()).catch(() => null);

            const animeData = detailData?.data?.[0] || detailData;
            const chapters = animeData?.chapter || [];
            const episode = chapters[episodeNumber - 1];

            if (episode?.url) {
                const videoData = await fetch(`https://api.sansekai.my.id/api/anime/getvideo?url=${encodeURIComponent(episode.url)}`, {
                    next: { revalidate: 60 },
                }).then(r => r.json()).catch(() => null);
                return videoData?.url || videoData?.video?.url || null;
            }
            return null;
        }

        if (provider === "flickreels") {
            const episodes = await FlickReelsApi.getEpisodes(dramaId);
            const episode = episodes.find(e => e.chapter_num === episodeNumber);
            // Use videoUrl (VIP bypass) first, then fallback to hls_url or down_url
            return episode?.videoUrl || episode?.hls_url || episode?.down_url || null;
        }

        // DramaBox (Default)
        const episodes = await DramaBoxApi.getEpisodes(dramaId);
        const episode = episodes.find(e => e.number === episodeNumber);
        return episode?.videoUrl || null;

    } catch (error) {
        console.error("Error fetching video URL:", error);
        return null;
    }
}

