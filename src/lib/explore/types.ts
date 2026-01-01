/**
 * Explore Page Types
 * 
 * Standardized types for multi-source content exploration
 */

// Available provider sources
export type ProviderSource = "dramabox" | "flickreels" | "netshort" | "melolo" | "anime";

// Standardized explore item (normalized from different providers)
export interface ExploreItem {
    id: string;
    title: string;
    poster: string;
    landscapePoster?: string;
    episodes?: number;
    tags?: string[];
    source: ProviderSource;
    isVip?: boolean;
    year?: number;
    description?: string;
    score?: number;
    views?: string;
    rating?: number;
    hotBadge?: string;
    _source?: string; // Internal: tracks which endpoint the item came from
}

// Filter option (category, sort, etc)
export interface FilterOption {
    id: string;
    name: string;
}

// Standardized filter group (per provider)
export interface FilterGroup {
    key: string;           // "region", "category", "year"
    label: string;         // "Wilayah", "Kategori", "Tahun"
    type: "single" | "multi";
    options: FilterOption[];
}

// Filter API response
export interface FiltersResponse {
    provider: ProviderSource;
    filters: FilterGroup[];
}

// Available filters per source
export interface ExploreFilters {
    categories: FilterOption[];
    sorts: FilterOption[];
    regions?: FilterOption[];
}

// API response structure
export interface ExploreResponse {
    items: ExploreItem[];
    filters: ExploreFilters;
    pagination: {
        page: number;
        limit: number;
        hasMore: boolean;
        total?: number;
    };
}

// Provider configuration
export interface ProviderConfig {
    id: ProviderSource;
    name: string;
    icon: string;
    enabled: boolean;
}

// Default provider list
export const PROVIDERS: ProviderConfig[] = [
    { id: "dramabox", name: "DramaBox", icon: "📺", enabled: true },
    { id: "flickreels", name: "FlickReels", icon: "🎬", enabled: true },
    { id: "netshort", name: "NetShort", icon: "📱", enabled: true },
    { id: "melolo", name: "Melolo", icon: "🎭", enabled: true },
    { id: "anime", name: "Anime", icon: "🎌", enabled: true },
];

// Default sort options (shared across providers)
export const DEFAULT_SORTS: FilterOption[] = [
    { id: "popular", name: "Popular" },
    { id: "latest", name: "Terbaru" },
    { id: "rating", name: "Rating" },
];
