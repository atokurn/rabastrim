/**
 * Keyword → Tag Mapping
 * 
 * Maps user search terms to relevant tags for fallback search
 * when text search returns no results.
 */

export const KEYWORD_TAG_MAP: Record<string, string[]> = {
    // Romance
    "cinta": ["romance", "romansa", "romantis", "love"],
    "romantis": ["romance", "romansa", "sweet", "manis"],
    "love": ["romance", "love", "romansa"],

    // Business/CEO
    "ceo": ["ceo", "boss", "business", "pengusaha"],
    "bos": ["boss", "ceo", "business"],
    "pengusaha": ["business", "ceo", "boss", "rich"],
    "kaya": ["rich", "wealthy", "business", "ceo"],

    // Revenge/Action
    "balas dendam": ["revenge", "balas dendam", "serangan balik"],
    "dendam": ["revenge", "balas dendam", "serangan balik"],
    "revenge": ["revenge", "balas dendam"],
    "bangkit": ["rebirth", "bangkit", "kelahiran kembali"],

    // Family
    "keluarga": ["family", "keluarga", "drama keluarga"],
    "ibu": ["mother", "ibu", "kasih ibu", "family"],
    "ayah": ["father", "ayah", "family"],
    "anak": ["child", "anak", "family"],

    // Genre
    "dewa": ["cultivation", "immortal", "fantasy", "dewa"],
    "sakti": ["power", "superpower", "martial arts"],
    "mistis": ["mystic", "supernatural", "ilmu mistis"],
    "horor": ["horror", "scary", "supernatural"],

    // Setting
    "sekolah": ["school", "campus", "sekolah"],
    "kampus": ["campus", "university", "school"],
    "dokter": ["doctor", "medical", "hospital"],
    "rumah sakit": ["hospital", "medical", "doctor"],

    // Tropes
    "nikah": ["marriage", "wedding", "married"],
    "pernikahan": ["marriage", "wedding", "contract marriage"],
    "hamil": ["pregnancy", "hamil", "baby"],
    "identitas": ["hidden identity", "identitas tersembunyi", "secret identity"],
};

/**
 * Map a search query to relevant tags
 */
export function mapQueryToTags(query: string): string[] {
    const normalizedQuery = query.toLowerCase().trim();
    const matchedTags: Set<string> = new Set();

    // Check each keyword
    for (const [keyword, tags] of Object.entries(KEYWORD_TAG_MAP)) {
        if (normalizedQuery.includes(keyword)) {
            tags.forEach(tag => matchedTags.add(tag));
        }
    }

    // If no specific mapping found, use query as potential tag
    if (matchedTags.size === 0) {
        matchedTags.add(normalizedQuery);
    }

    return Array.from(matchedTags);
}

/**
 * Check if a drama matches any of the given tags
 */
export function matchesTags(dramaTags: string[] | undefined, searchTags: string[]): boolean {
    if (!dramaTags || dramaTags.length === 0) return false;

    const normalizedDramaTags = dramaTags.map(t => t.toLowerCase());
    const normalizedSearchTags = searchTags.map(t => t.toLowerCase());

    return normalizedSearchTags.some(searchTag =>
        normalizedDramaTags.some(dramaTag =>
            dramaTag.includes(searchTag) || searchTag.includes(dramaTag)
        )
    );
}
