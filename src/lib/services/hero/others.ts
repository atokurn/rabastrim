import { SansekaiApi } from "@/lib/api/sansekai";
import { MeloloApi } from "@/lib/api/melolo";
import { HeroItem } from "./types";

export async function getNetShortHero(limit: number = 2): Promise<HeroItem[]> {
    try {
        const data = await SansekaiApi.netshort.getTheaters();

        return data.slice(0, limit).map((item: any) => ({
            id: item.shortPlayId || item.id || `netshort-${Math.random()}`,
            title: item.shortPlayName || item.title || "Untitled",
            cover: item.shortPlayCover || item.cover,
            backdrop: item.shortPlayCover || item.cover,
            provider: 'netshort',
            description: item.synopsis || item.description,
            tags: item.keywords,
        }));
    } catch (error) {
        console.error("Error fetching NetShort hero:", error);
        return [];
    }
}

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
