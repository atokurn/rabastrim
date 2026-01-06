/**
 * Multi-Source Data Aggregation
 * 
 * Unified interface for fetching data from multiple providers:
 * - DramaBox (weight: 100)
 * - FlickReels (weight: 80)
 * - Melolo (weight: 50)
 */

// Main exports
export { SourceAggregator } from "./aggregator";
export type {
    UnifiedDrama,
    UnifiedDetail,
    UnifiedEpisode,
    SearchResult,
    ProviderName,
} from "./aggregator";

// Types
export type {
    SourceAdapter,
    SearchOptions,
    AggregatorConfig,
    ProviderConfig,
} from "./types";

// Individual adapters (for direct access if needed)
export { DramaBoxAdapter } from "./adapters/dramabox";
export { FlickReelsAdapter } from "./adapters/flickreels";
export { MeloloAdapter } from "./adapters/melolo";
