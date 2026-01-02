import { getDramaBoxHero } from "./dramabox";
import { getFlickReelsHero } from "./flickreels";
import { getNetShortHero, getMeloloHero } from "./others";
import { HeroItem } from "./types";

export const HeroService = {
    /**
     * Aggregates hero content from multiple providers
     */
    getHeroContent: async (): Promise<HeroItem[]> => {
        // Fetch from all providers in parallel
        // We fetching slightly more than needed to ensure we have enough good quality items
        const results = await Promise.allSettled([
            getDramaBoxHero(3),
            getFlickReelsHero(3),
            getNetShortHero(2),
            getMeloloHero(2),
        ]);

        let allItems: HeroItem[] = [];

        // Collect successful results
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                allItems = [...allItems, ...result.value];
            }
        });

        // Ranking Sorting Logic
        // 1. Prioritize items with High Resolution or Backdrop (though we assume all have covers)
        // 2. Mix providers to show variety
        // 3. Fallback to basic shuffle if no detailed score

        // Simple interleaving strategy for variety
        const providers = ['dramabox', 'flickreels', 'netshort', 'melolo'];
        const sortedItems: HeroItem[] = [];

        // Group by provider
        const byProvider: Record<string, HeroItem[]> = {};
        allItems.forEach(item => {
            if (!byProvider[item.provider]) byProvider[item.provider] = [];
            byProvider[item.provider].push(item);
        });

        // Round-robin selection
        let hasItems = true;
        while (hasItems) {
            hasItems = false;
            for (const p of providers) {
                if (byProvider[p] && byProvider[p].length > 0) {
                    sortedItems.push(byProvider[p].shift()!);
                    hasItems = true;
                }
            }
            // Add remaining from any custom provider added later logic? 
            // Loop handles generic round robin.
        }

        // Return top 8 items
        return sortedItems.slice(0, 8);
    }
};
