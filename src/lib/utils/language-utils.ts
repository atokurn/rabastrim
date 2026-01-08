/**
 * Language Utilities
 * 
 * Provides language code normalization and mapping between
 * different provider formats and internal ISO 639-1 codes.
 */

/**
 * Map of internal language codes to provider aliases
 * All provider-specific codes should be added here
 */
export const LANGUAGE_MAP: Record<string, string[]> = {
    "id": ["id-ID", "id", "6", "Indonesian", "4", "indo"],
    "en": ["en-US", "en", "1", "English", "3", "eng"],
    "zh": ["zh-CN", "zh-Hans", "Chinese", "Mandarin", "cn"],
    "zh-TW": ["zh-TW", "zh-Hant", "2", "Traditional Chinese"],
    "ja": ["ja-JP", "7", "Japanese", "jp"],
    "ko": ["ko-KR", "8", "Korean", "kr"],
    "es": ["es-ES", "es", "Spanish", "español"],
    "fr": ["fr-FR", "fr", "French", "français"],
    "th": ["th-TH", "th", "Thai"],
    "vi": ["vi-VN", "vi", "Vietnamese"],
};

/**
 * Human-readable labels for each language
 */
export const LANGUAGE_LABELS: Record<string, string> = {
    "id": "Bahasa Indonesia",
    "en": "English",
    "zh": "中文 (Chinese)",
    "zh-TW": "繁體中文",
    "ja": "日本語",
    "ko": "한국어",
    "es": "Español",
    "fr": "Français",
    "th": "ภาษาไทย",
    "vi": "Tiếng Việt",
    "unknown": "Unknown",
};

/**
 * Normalize a provider-specific language code to internal ISO 639-1 format
 * 
 * @example
 * normalizeLanguage("Indonesian") // returns "id"
 * normalizeLanguage("4") // returns "id" (StartShort format)
 * normalizeLanguage("id-ID") // returns "id" (DramaWave format)
 */
export function normalizeLanguage(providerCode: string): string {
    if (!providerCode) return "unknown";

    const code = providerCode.toLowerCase().trim();

    for (const [internal, aliases] of Object.entries(LANGUAGE_MAP)) {
        if (aliases.some(alias => alias.toLowerCase() === code)) {
            return internal;
        }
    }

    return "unknown";
}

/**
 * Get human-readable label for a language code
 */
export function getLanguageLabel(code: string): string {
    return LANGUAGE_LABELS[code] || LANGUAGE_LABELS["unknown"];
}

/**
 * Check if a language code is valid/known
 */
export function isValidLanguageCode(code: string): boolean {
    return code in LANGUAGE_MAP;
}
