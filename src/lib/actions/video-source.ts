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
            try {
                // Get directory/episodes to find the video ID
                const { MeloloApi } = await import("@/lib/api/melolo");
                const episodes = await MeloloApi.getDirectory(dramaId);

                // Episodes use 0-based vid_index, so subtract 1 from episodeNumber
                const episode = episodes.find(ep => ep.vid_index === episodeNumber - 1);

                if (episode?.vid) {
                    const stream = await MeloloApi.getStream(episode.vid);
                    return stream?.main_url || stream?.backup_url || stream?.url || null;
                }
                return null;
            } catch (error) {
                console.error("[Melolo] Video fetch failed:", error);
                return null;
            }
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

