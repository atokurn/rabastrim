/**
 * Hybrid Scoring System
 * 
 * Calculates relevance scores for search results based on:
 * 1. Title match (exact > partial > none)
 * 2. Provider weight
 * 3. Popularity
 * 4. Recency (if available)
 */

import type { UnifiedDrama } from "@/lib/sources/types";

interface ScoringConfig {
    weights: {
        exactTitle: number;      // Exact title match
        startsWithTitle: number; // Title starts with query
        containsTitle: number;   // Title contains query
        providerWeight: number;  // From provider config
        popularity: number;      // Based on play count
        episodeCount: number;    // More episodes = higher score
        hasDescription: number;  // Has description
        hasCover: number;        // Has cover image
    };
}

const DEFAULT_SCORING_CONFIG: ScoringConfig = {
    weights: {
        exactTitle: 50,
        startsWithTitle: 35,
        containsTitle: 20,
        providerWeight: 0.3,  // Multiplier for _weight (0-100)
        popularity: 10,
        episodeCount: 5,
        hasDescription: 3,
        hasCover: 2,
    },
};

/**
 * Parse play count string to number
 * Examples: "35.5M" -> 35500000, "1.2K" -> 1200
 */
function parsePlayCount(playCount: string | undefined): number {
    if (!playCount) return 0;

    const match = playCount.match(/^([\d.]+)([KMB])?$/i);
    if (!match) return parseInt(playCount, 10) || 0;

    const num = parseFloat(match[1]);
    const suffix = match[2]?.toUpperCase();

    switch (suffix) {
        case 'K': return num * 1000;
        case 'M': return num * 1000000;
        case 'B': return num * 1000000000;
        default: return num;
    }
}

/**
 * Calculate title match score
 */
function calculateTitleMatchScore(title: string, query: string, config: ScoringConfig): number {
    const titleLower = title.toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact match
    if (titleLower === queryLower) {
        return config.weights.exactTitle;
    }

    // Starts with query
    if (titleLower.startsWith(queryLower)) {
        return config.weights.startsWithTitle;
    }

    // Contains query
    if (titleLower.includes(queryLower)) {
        return config.weights.containsTitle;
    }

    // Word match (any word in title matches query)
    const titleWords = titleLower.split(/\s+/);
    const queryWords = queryLower.split(/\s+/);
    const hasWordMatch = queryWords.some(qw =>
        titleWords.some(tw => tw.includes(qw) || qw.includes(tw))
    );

    if (hasWordMatch) {
        return config.weights.containsTitle * 0.5;
    }

    return 0;
}

/**
 * Calculate popularity score (normalized 0-10)
 */
function calculatePopularityScore(playCount: string | undefined): number {
    const count = parsePlayCount(playCount);
    if (count === 0) return 0;

    // Logarithmic scale: 1M = 6, 10M = 7, 100M = 8
    return Math.min(10, Math.log10(count + 1));
}

/**
 * Calculate episode count score (normalized 0-5)
 */
function calculateEpisodeScore(episodes: number | undefined): number {
    if (!episodes || episodes <= 0) return 0;

    // More episodes = higher score, capped at 5
    return Math.min(5, episodes / 20);
}

/**
 * Calculate total relevance score for a search result
 */
export function calculateRelevanceScore(
    item: UnifiedDrama,
    query: string,
    config: ScoringConfig = DEFAULT_SCORING_CONFIG
): number {
    let score = 0;

    // 1. Title match (0-50)
    score += calculateTitleMatchScore(item.title, query, config);

    // 2. Provider weight (0-30)
    score += (item._weight || 0) * config.weights.providerWeight;

    // 3. Popularity (0-10)
    score += calculatePopularityScore(item.playCount) * (config.weights.popularity / 10);

    // 4. Episode count (0-5)
    score += calculateEpisodeScore(item.episodes) * (config.weights.episodeCount / 5);

    // 5. Metadata bonuses
    if (item.description) score += config.weights.hasDescription;
    if (item.cover) score += config.weights.hasCover;

    return Math.round(score * 10) / 10;
}

/**
 * Sort results by relevance score
 */
export function sortByRelevance(
    results: UnifiedDrama[],
    query: string
): UnifiedDrama[] {
    return results
        .map(item => ({
            ...item,
            _score: calculateRelevanceScore(item, query),
        }))
        .sort((a, b) => (b._score || 0) - (a._score || 0));
}

/**
 * Deduplicate results by title (keep highest scored)
 */
export function deduplicateResults(results: UnifiedDrama[]): UnifiedDrama[] {
    const seen = new Map<string, UnifiedDrama>();

    for (const item of results) {
        const key = item.title.toLowerCase().trim();
        const existing = seen.get(key);

        if (!existing || (item._score || 0) > (existing._score || 0)) {
            seen.set(key, item);
        }
    }

    return Array.from(seen.values());
}
