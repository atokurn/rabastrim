/**
 * Filter Adapters Registry
 * 
 * Central registry for provider-specific filter configurations
 */

import { FilterGroup, ProviderSource } from "@/lib/explore/types";
import { getDramaboxFilters } from "./dramabox";
import { getFlickreelsFilters } from "./flickreels";
import { getMeloloFilters } from "./melolo";

/**
 * Get filter configuration for a specific provider
 */
export function getProviderFilters(provider: ProviderSource): FilterGroup[] {
    switch (provider) {
        case "dramabox":
            return getDramaboxFilters();
        case "flickreels":
            return getFlickreelsFilters();
        case "melolo":
            return getMeloloFilters();
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
export { getMeloloFilters } from "./melolo";
