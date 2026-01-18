/**
 * Language Detection Utilities
 * 
 * Detects if a title matches the expected language.
 * Used during content sync and query-time filtering.
 * 
 * Performance: O(1) for non-Latin scripts (regex), O(n) for Latin-based (word matching)
 * where n = number of indicator words. Very fast, typically <1ms per title.
 */

// Script-based detection (non-Latin languages) - very fast regex matching
const SCRIPT_PATTERNS: Record<string, RegExp> = {
    'zh': /[\u4e00-\u9fff]/,           // Chinese (CJK Unified Ideographs)
    'zh-TW': /[\u4e00-\u9fff]/,        // Traditional Chinese (same range)
    'ja': /[\u3040-\u309f\u30a0-\u30ff]/, // Japanese (Hiragana + Katakana)
    'ko': /[\uac00-\ud7af]/,           // Korean (Hangul)
    'th': /[\u0e00-\u0e7f]/,           // Thai
    'ar': /[\u0600-\u06ff]/,           // Arabic
    'vi': /[\u00c0-\u01b0\u1ea0-\u1ef9]/, // Vietnamese (Latin with diacritics)
};

// Indonesian word indicators (common words and patterns)
const INDONESIAN_INDICATORS = new Set([
    'yang', 'dan', 'atau', 'dari', 'untuk', 'dengan', 'pada', 'ke', 'di', 'itu',
    'ini', 'adalah', 'akan', 'tidak', 'bukan', 'aku', 'kamu', 'dia', 'kami', 'kita',
    'sang', 'si', 'cinta', 'hati', 'takdir', 'malam', 'dewi', 'raja', 'ratu', 'putri',
    'pahlawan', 'jiwa', 'bintang', 'bulan', 'jodoh', 'rahasia', 'kisah', 'sulih',
    'suara', 'dubbing', 'pernikahan', 'perceraian', 'keluarga', 'anak', 'ibu', 'ayah',
    'kakak', 'adik', 'kakek', 'nenek', 'tiga', 'dua', 'satu', 'empat', 'lima',
    'salah', 'benar', 'kembali', 'pergi', 'datang', 'pulang', 'mencari'
]);

// English word indicators
const ENGLISH_INDICATORS = new Set([
    'the', 'a', 'an', 'of', 'in', 'on', 'at', 'for', 'to', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that',
    'love', 'heart', 'wife', 'husband', 'boss', 'ceo', 'pregnant', 'baby',
    'secret', 'hidden', 'revenge', 'betrayal', 'forbidden', 'destiny',
    'billionaire', 'marriage', 'divorce', 'affair', 'contract', 'fake',
    'from', 'after', 'before', 'through', 'into', 'onto', 'you', 'me', 'him',
    'prophecy', 'hooked', 'stunning', 'golden', 'sweet', 'pursuit', 'stand',
    'world', 'shall', 'tremble', 'meets', 'match', 'reborn', 'brother', 'foe',
    'holy', 'king', 'queen', 'prince', 'princess', 'step', 'fall', 'way'
]);

// Spanish word indicators
const SPANISH_INDICATORS = new Set([
    'el', 'la', 'los', 'las', 'de', 'del', 'en', 'con', 'por', 'para',
    'que', 'es', 'un', 'una', 'mi', 'tu', 'su', 'amor', 'corazón'
]);

// Portuguese word indicators
const PORTUGUESE_INDICATORS = new Set([
    'o', 'a', 'os', 'as', 'de', 'do', 'da', 'em', 'com', 'por', 'para',
    'que', 'um', 'uma', 'meu', 'seu', 'amor', 'coração', 'dublado'
]);

// French word indicators
const FRENCH_INDICATORS = new Set([
    'le', 'la', 'les', 'de', 'du', 'des', 'en', 'avec', 'pour', 'par',
    'que', 'un', 'une', 'mon', 'ton', 'son', 'amour', 'coeur'
]);

// German word indicators  
const GERMAN_INDICATORS = new Set([
    'der', 'die', 'das', 'ein', 'eine', 'und', 'in', 'mit', 'von', 'für',
    'ist', 'sind', 'mein', 'dein', 'sein', 'liebe', 'herz'
]);

// Italian word indicators
const ITALIAN_INDICATORS = new Set([
    'il', 'la', 'lo', 'i', 'gli', 'le', 'di', 'del', 'della', 'in', 'con',
    'per', 'un', 'una', 'mio', 'tuo', 'suo', 'amore', 'cuore'
]);

/**
 * Check if title matches the expected language
 * Returns true if title appears to be in the expected language
 */
export function titleMatchesLanguage(title: string, expectedLang: string): boolean {
    if (!title || !expectedLang) return true; // Permissive on missing data

    const normalizedLang = expectedLang.toLowerCase();

    // For non-Latin script languages, check if title contains that script
    if (SCRIPT_PATTERNS[normalizedLang]) {
        return SCRIPT_PATTERNS[normalizedLang].test(title);
    }

    // For Latin-based languages, use word matching
    const lowerTitle = title.toLowerCase();
    const words = new Set(lowerTitle.split(/[\s\-\:\,\.\!\?\'\"]+/).filter(w => w.length > 1));

    switch (normalizedLang) {
        case 'id':
            return isLikelyIndonesian(title);
        case 'en':
            return hasIndicators(words, ENGLISH_INDICATORS);
        case 'es':
            return hasIndicators(words, SPANISH_INDICATORS);
        case 'pt':
            return hasIndicators(words, PORTUGUESE_INDICATORS) || lowerTitle.includes('dublado');
        case 'fr':
            return hasIndicators(words, FRENCH_INDICATORS);
        case 'de':
            return hasIndicators(words, GERMAN_INDICATORS);
        case 'it':
            return hasIndicators(words, ITALIAN_INDICATORS);
        default:
            // Unknown language - be permissive
            return true;
    }
}

/**
 * Check if a title is likely Indonesian
 */
export function isLikelyIndonesian(title: string): boolean {
    if (!title) return false;

    const lowerTitle = title.toLowerCase();

    // If contains non-Latin script, definitely not Indonesian
    for (const pattern of Object.values(SCRIPT_PATTERNS)) {
        if (pattern.test(title)) return false;
    }

    const words = new Set(lowerTitle.split(/[\s\-\:\,\.\!\?\'\"]+/).filter(w => w.length > 1));

    // Count Indonesian vs English indicators
    let indonesianScore = 0;
    let englishScore = 0;

    for (const word of words) {
        if (INDONESIAN_INDICATORS.has(word)) indonesianScore++;
        if (ENGLISH_INDICATORS.has(word)) englishScore++;
    }

    // Check for Indonesian-specific patterns
    if (lowerTitle.includes('sulih suara')) indonesianScore += 3;
    if (lowerTitle.includes('(dubbing)')) indonesianScore += 2;
    if (/nya$|ku$|mu$/.test(lowerTitle)) indonesianScore++;

    // If has Indonesian indicators and more than English, likely Indonesian
    if (indonesianScore > englishScore) return true;

    // If purely ASCII with no Indonesian indicators but has English indicators, not Indonesian
    if (indonesianScore === 0 && englishScore > 0) return false;

    // If starts with English articles, likely English
    if (/^(the|a|an|my|his|her|our|their)\s+/i.test(title)) return false;

    // Default: if no clear indicators, be conservative
    return indonesianScore > 0;
}

/**
 * Check if word set has any indicators from the target set
 */
function hasIndicators(words: Set<string>, indicators: Set<string>): boolean {
    for (const word of words) {
        if (indicators.has(word)) return true;
    }
    return false;
}

/**
 * Detect the language of a title (best effort)
 */
export function detectTitleLanguage(title: string): string {
    if (!title) return 'unknown';

    // Check script-based languages first (most accurate)
    for (const [lang, pattern] of Object.entries(SCRIPT_PATTERNS)) {
        if (pattern.test(title)) return lang;
    }

    // Check Indonesian
    if (isLikelyIndonesian(title)) return 'id';

    // Check for English indicators
    const words = new Set(title.toLowerCase().split(/[\s\-\:\,\.\!\?\'\"]+/));
    if (hasIndicators(words, ENGLISH_INDICATORS)) return 'en';

    return 'unknown';
}
