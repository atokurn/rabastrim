import { FlickReelsApi } from "@/lib/api/flickreels";
import { HeroItem } from "./types";

export async function getFlickReelsHero(limit: number = 3): Promise<HeroItem[]> {
    try {
        const data = await FlickReelsApi.getForYou();

        return data.slice(0, limit).map(item => ({
            id: String(item.playlet_id),
            title: item.playlet_title || "Untitled",
            cover: item.cover,
            backdrop: item.cover, // Use cover as fallback
            provider: 'flickreels',
            score: 0, // Not typically provided in list view
            tags: item.tag_list?.map(t => t.tag_name) || [],
            description: item.introduce,
            episodeCount: item.chapter_num ? `${item.chapter_num} Eps` : undefined,
            year: undefined, // online_time not available
        }));
    } catch (error) {
        console.error("Error fetching FlickReels hero:", error);
        return [];
    }
}
