/**
 * Normalize country names to standard ISO codes
 */
export function normalizeCountry(country?: string | null): string | null {
    if (!country) return null;
    const lower = country.toLowerCase();
    if (lower.includes("china") || lower === "tiongkok") return "CN";
    if (lower.includes("korea")) return "KR";
    if (lower.includes("japan") || lower === "jepang") return "JP";
    if (lower.includes("thailand")) return "TH";
    if (lower.includes("taiwan")) return "TW";
    return country; // Keep original if no match
}
