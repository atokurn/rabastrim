import { DramaBoxApi } from "@/lib/api/dramabox";
import { HeroItem } from "./types";

export async function getDramaBoxHero(limit: number = 3): Promise<HeroItem[]> {
    try {
        const data = await DramaBoxApi.getHome();

        // Take top items from homepage (usually banners)
        // DramaBox data often mixes portrait and landscape, we try to prefer landscape or high quality
        return data.slice(0, limit).map(item => ({
            id: item.bookId,
            title: item.bookName,
            cover: item.coverWap || item.cover || "",
            backdrop: item.cover || item.coverWap, // DramaBox often uses 'cover' for landscape
            provider: 'dramabox',
            score: item.score ? parseFloat(item.score) : undefined,
            tags: item.tags,
            description: item.introduction,
            episodeCount: item.chapterCount ? `${item.chapterCount} Eps` : undefined,
        }));
    } catch (error) {
        console.error("Error fetching DramaBox hero:", error);
        return [];
    }
}
