/**
 * Language Utilities
 * 
 * Provides language code normalization and mapping between
 * different provider formats and internal ISO 639-1 codes.
 */

/**
 * Map of internal language codes to provider aliases
 * All provider-specific codes should be added here
 * IMPORTANT: Each entry MUST include the key itself as first alias for proper lookup
 */
export const LANGUAGE_MAP: Record<string, string[]> = {
    "id": ["id", "id-ID", "6", "Indonesian", "4", "indo"],
    "en": ["en", "en-US", "1", "English", "3", "eng"],
    "zh": ["zh", "zh-CN", "zh-Hans", "Chinese", "Mandarin", "cn"],
    "zh-TW": ["zh-TW", "zh-Hant", "2", "Traditional Chinese"],
    "ja": ["ja", "ja-JP", "7", "Japanese", "jp"],
    "ko": ["ko", "ko-KR", "8", "Korean", "kr"],
    "es": ["es", "es-ES", "Spanish", "español"],
    "fr": ["fr", "fr-FR", "French", "français"],
    "th": ["th", "th-TH", "Thai"],
    "vi": ["vi", "vi-VN", "Vietnamese"],
    "pt": ["pt", "pt-BR", "pt-PT", "Portuguese", "português"],
    "de": ["de", "de-DE", "German", "Deutsch"],
    "it": ["it", "it-IT", "Italian", "Italiano"],
    "ar": ["ar", "ar-SA", "Arabic", "العربية"],
    "tr": ["tr", "tr-TR", "Turkish", "Türkçe"],
    "pl": ["pl", "pl-PL", "Polish", "Polski"],
    "my": ["my", "Burmese", "Myanmar"],
    "km": ["km", "Khmer", "Cambodian"],
    "ms": ["ms", "Malay", "Melayu"],
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
    "pt": "Português",
    "de": "Deutsch",
    "it": "Italiano",
    "ar": "العربية",
    "tr": "Türkçe",
    "pl": "Polski",
    "my": "မြန်မာ",
    "km": "ភាសាខ្មែរ",
    "ms": "Bahasa Melayu",
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
