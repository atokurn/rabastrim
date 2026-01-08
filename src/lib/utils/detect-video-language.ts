/**
 * Video Language Detection Utilities
 * 
 * Detects language from video URLs and API field names.
 * Used for playback-time language detection.
 */

import { normalizeLanguage } from "./language-utils";

/**
 * URL patterns that indicate language
 */
const URL_LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
    "en": [/\/en\//, /_en\./, /\.en\./, /-en-/, /english/i],
    "id": [/\/id\//, /_id\./, /\.id\./, /-id-/, /indonesian/i, /indo/i],
    "zh": [/\/zh\//, /_zh\./, /\.zh\./, /-zh-/, /chinese/i, /mandarin/i],
    "ko": [/\/ko\//, /_ko\./, /\.ko\./, /-ko-/, /korean/i],
    "ja": [/\/ja\//, /_ja\./, /\.ja\./, /-ja-/, /japanese/i],
    "es": [/\/es\//, /_es\./, /\.es\./, /-es-/, /spanish/i],
    "fr": [/\/fr\//, /_fr\./, /\.fr\./, /-fr-/, /french/i],
    "th": [/\/th\//, /_th\./, /\.th\./, /-th-/, /thai/i],
    "vi": [/\/vi\//, /_vi\./, /\.vi\./, /-vi-/, /vietnamese/i],
};

/**
 * API field name patterns that indicate language
 */
const FIELD_LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
    "en": [/_en$/, /En$/, /_english$/i],
    "id": [/_id$/, /Id$/, /_indo$/i, /_indonesian$/i],
    "zh": [/_zh$/, /Zh$/, /_chinese$/i, /_cn$/i],
    "ko": [/_ko$/, /Ko$/, /_korean$/i, /_kr$/i],
    "ja": [/_ja$/, /Ja$/, /_japanese$/i, /_jp$/i],
    "es": [/_es$/, /Es$/, /_spanish$/i],
    "fr": [/_fr$/, /Fr$/, /_french$/i],
};

/**
 * Detect language from video URL pattern
 * 
 * @example
 * detectLanguageFromUrl("https://example.com/videos/en/movie.mp4") // "en"
 * detectLanguageFromUrl("https://example.com/video_id.mp4") // "id"
 */
export function detectLanguageFromUrl(url: string): string | null {
    if (!url) return null;

    for (const [lang, patterns] of Object.entries(URL_LANGUAGE_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(url)) {
                return lang;
            }
        }
    }

    return null;
}

/**
 * Detect language from API field name
 * 
 * @example
 * detectLanguageFromFieldName("link720_en") // "en"
 * detectLanguageFromFieldName("videoUrlId") // "id"
 */
export function detectLanguageFromFieldName(fieldName: string): string | null {
    if (!fieldName) return null;

    for (const [lang, patterns] of Object.entries(FIELD_LANGUAGE_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(fieldName)) {
                return lang;
            }
        }
    }

    return null;
}

/**
 * Detect language from multiple sources
 * Returns the first detected language or null
 */
export function detectVideoLanguage(options: {
    url?: string;
    fieldName?: string;
    providerHint?: string;
}): string | null {
    const { url, fieldName, providerHint } = options;

    // Try field name first (most reliable for API responses)
    if (fieldName) {
        const fromField = detectLanguageFromFieldName(fieldName);
        if (fromField) return fromField;
    }

    // Try URL pattern
    if (url) {
        const fromUrl = detectLanguageFromUrl(url);
        if (fromUrl) return fromUrl;
    }

    // Normalize provider hint if given
    if (providerHint) {
        const normalized = normalizeLanguage(providerHint);
        if (normalized !== "unknown") return normalized;
    }

    return null;
}
