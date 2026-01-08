"use server";

import { DramaBoxApi } from "@/lib/api/dramabox";
import { FlickReelsApi } from "@/lib/api/flickreels";

export async function getVideoUrl(
    dramaId: string,
    provider: string,
    episodeNumber: number
): Promise<string | null> {
    try {
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

        if (provider === "dramawave") {
            try {
                const { DramaWaveApi } = await import("@/lib/api/dramawave");
                const videoUrl = await DramaWaveApi.getStream(dramaId, episodeNumber);
                return videoUrl;
            } catch (error) {
                console.error("[DramaWave] Video fetch failed:", error);
                return null;
            }
        }

        if (provider === "flickreels") {
            const episodes = await FlickReelsApi.getEpisodes(dramaId);
            const episode = episodes.find(e => e.chapter_num === episodeNumber);
            // Use videoUrl (VIP bypass) first, then fallback to hls_url or down_url
            return episode?.videoUrl || episode?.hls_url || episode?.down_url || null;
        }

        if (provider === "dramaqueen") {
            try {
                const { DramaQueenApi } = await import("@/lib/api/dramaqueen");
                const episodes = await DramaQueenApi.getEpisodes(dramaId);
                const episode = episodes.find(e => e.number === episodeNumber);

                if (!episode?.videoUrl) return null;

                // Drama Queen URLs often contain embedded credentials (user:pass@host)
                // Modern browsers block these for security, so we proxy through our server
                const videoUrl = episode.videoUrl;
                if (videoUrl.includes("@")) {
                    // URL has credentials - use proxy
                    return `/api/video-proxy?url=${encodeURIComponent(videoUrl)}`;
                }

                // URL without credentials - use directly
                return videoUrl;
            } catch (error) {
                console.error("[DramaQueen] Video fetch failed:", error);
                return null;
            }
        }

        if (provider === "donghua") {
            try {
                const { DramaQueenApi } = await import("@/lib/api/dramaqueen");
                const episodes = await DramaQueenApi.getDonghuaEpisodes(dramaId);
                const episode = episodes.find(e => e.number === episodeNumber);

                if (!episode?.videoUrl) return null;

                // Donghua URLs often contain embedded credentials (user:pass@host)
                // Modern browsers block these for security, so we proxy through our server
                const videoUrl = episode.videoUrl;
                if (videoUrl.includes("@")) {
                    // URL has credentials - use proxy
                    return `/api/video-proxy?url=${encodeURIComponent(videoUrl)}`;
                }

                // URL without credentials - use directly
                return videoUrl;
            } catch (error) {
                console.error("[Donghua] Video fetch failed:", error);
                return null;
            }
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
