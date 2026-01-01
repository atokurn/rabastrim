/**
 * Filter Adapters Registry
 * 
 * Central registry for provider-specific filter configurations
 */

import { FilterGroup, ProviderSource } from "@/lib/explore/types";
import { getDramaboxFilters } from "./dramabox";
import { getFlickreelsFilters } from "./flickreels";
import { getNetshortFilters } from "./netshort";
import { getMeloloFilters } from "./melolo";
import { getAnimeFilters } from "./anime";

/**
 * Get filter configuration for a specific provider
 */
export function getProviderFilters(provider: ProviderSource): FilterGroup[] {
    switch (provider) {
        case "dramabox":
            return getDramaboxFilters();
        case "flickreels":
            return getFlickreelsFilters();
        case "netshort":
            return getNetshortFilters();
        case "melolo":
            return getMeloloFilters();
        case "anime":
            return getAnimeFilters();
        default:
            return [];
    }
}

// Default sort options (shared across all providers)
export const DEFAULT_SORT_FILTER: FilterGroup = {
    key: "sort",
    label: "Urutkan",
    type: "single",
    options: [
        { id: "popular", name: "Popularitas" },
        { id: "latest", name: "Terbaru" },
    ],
};

// Re-export individual filter getters
export { getDramaboxFilters } from "./dramabox";
export { getFlickreelsFilters } from "./flickreels";
export { getNetshortFilters } from "./netshort";
export { getMeloloFilters } from "./melolo";
export { getAnimeFilters } from "./anime";
