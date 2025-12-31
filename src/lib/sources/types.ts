/**
 * Unified Types for Multi-Source Data Aggregation
 * 
 * All source adapters must normalize their data to these interfaces.
 */

// =====================
// Provider Types
// =====================
export type ProviderName = "dramabox" | "flickreels" | "netshort" | "melolo";

export interface ProviderConfig {
    name: ProviderName;
    enabled: boolean;
    weight: number;      // Higher = more priority (0-100)
    timeout: number;     // ms
}

// =====================
// Unified Data Models
// =====================
export interface UnifiedDrama {
    id: string;
    title: string;
    cover: string;
    description?: string;
    episodes?: number;
    score?: number;
    tags?: string[];
    year?: string;
    playCount?: string;
    provider: ProviderName;
    // For ranking
    _weight?: number;
    _score?: number;
}

export interface UnifiedEpisode {
    id: string;
    number: number;
    title: string;
    videoUrl: string;
    thumbnail?: string;
    duration?: number;
    isVip?: boolean;
    isLocked?: boolean;
    provider: ProviderName;
}

export interface UnifiedDetail extends UnifiedDrama {
    cast?: string[];
    director?: string;
    releaseDate?: string;
    status?: string;
    totalEpisodes?: number;
}

// =====================
// Search Types
// =====================
export interface SearchOptions {
    limit?: number;
    page?: number;
    type?: "all" | "drama" | "movie";
    providers?: ProviderName[];  // Filter by specific providers
}

export interface SearchResult {
    results: UnifiedDrama[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    sources: {
        provider: ProviderName;
        count: number;
        success: boolean;
    }[];
}

// =====================
// Source Adapter Interface
// =====================
export interface SourceAdapter {
    name: ProviderName;
    weight: number;

    // Core methods
    search(query: string): Promise<UnifiedDrama[]>;
    getTrending(): Promise<UnifiedDrama[]>;
    getLatest(): Promise<UnifiedDrama[]>;
    getDetail(id: string): Promise<UnifiedDetail | null>;
    getEpisodes(id: string): Promise<UnifiedEpisode[]>;
}

// =====================
// Aggregator Config
// =====================
export interface AggregatorConfig {
    providers: ProviderConfig[];
    defaultTimeout: number;
    enableCache: boolean;
    cacheTTL: number;
    enableAnalytics: boolean;
}

export const DEFAULT_CONFIG: AggregatorConfig = {
    providers: [
        { name: "dramabox", enabled: true, weight: 100, timeout: 5000 },
        { name: "flickreels", enabled: true, weight: 80, timeout: 5000 },
        { name: "netshort", enabled: true, weight: 60, timeout: 5000 },
        { name: "melolo", enabled: true, weight: 50, timeout: 5000 },
    ],
    defaultTimeout: 5000,
    enableCache: true,
    cacheTTL: 120,
    enableAnalytics: true,
};
