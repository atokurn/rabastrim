import { MeloloApi } from "@/lib/api/melolo";
import { HeroItem } from "./types";

export async function getMeloloHero(limit: number = 2): Promise<HeroItem[]> {
    try {
        const data = await MeloloApi.getTrending();

        return data.slice(0, limit).map((item: any) => {
            const rawImage = item.thumb_url || item.cover || "";
            // Handle HEIC if necessary, similar to main page
            const image = rawImage && rawImage.includes(".heic")
                ? `https://wsrv.nl/?url=${encodeURIComponent(rawImage)}&output=webp&q=85`
                : rawImage;

            return {
                id: item.book_id || item.id || `melolo-${Math.random()}`,
                title: item.book_name || item.title || "Untitled",
                cover: image,
                backdrop: image,
                provider: 'melolo',
                description: item.introduction || item.abstract,
                tags: item.tags ? (typeof item.tags === 'string' ? item.tags.split(',') : item.tags) : [],
                score: item.score,
            };
        });
    } catch (error) {
        console.error("Error fetching Melolo hero:", error);
        return [];
    }
}
