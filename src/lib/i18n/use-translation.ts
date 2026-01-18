"use client";

import { useCallback, useMemo, useSyncExternalStore, useState, useEffect } from "react";

// Preload ALL 16 languages synchronously for best performance
// Trade-off: ~192KB bundle size, but ZERO translation flash
import idTranslations from "./translations/id.json";
import enTranslations from "./translations/en.json";
import zhTranslations from "./translations/zh.json";
import zhTWTranslations from "./translations/zh-TW.json";
import jaTranslations from "./translations/ja.json";
import koTranslations from "./translations/ko.json";
import thTranslations from "./translations/th.json";
import viTranslations from "./translations/vi.json";
import esTranslations from "./translations/es.json";
import ptTranslations from "./translations/pt.json";
import frTranslations from "./translations/fr.json";
import deTranslations from "./translations/de.json";
import itTranslations from "./translations/it.json";
import plTranslations from "./translations/pl.json";
import trTranslations from "./translations/tr.json";
import arTranslations from "./translations/ar.json";

// RTL languages
const RTL_LANGUAGES = ["ar"];

// Type for language codes
export type LanguageCode = "id" | "en" | "zh" | "zh-TW" | "ja" | "ko" | "th" | "vi" | "es" | "pt" | "fr" | "de" | "it" | "pl" | "tr" | "ar";

// Cookie name for language
const LANGUAGE_COOKIE = "user-language";

// All translations preloaded - instant access, no async loading
const translations: Record<string, Record<string, unknown>> = {
    id: idTranslations as unknown as Record<string, unknown>,
    en: enTranslations as unknown as Record<string, unknown>,
    zh: zhTranslations as unknown as Record<string, unknown>,
    "zh-TW": zhTWTranslations as unknown as Record<string, unknown>,
    ja: jaTranslations as unknown as Record<string, unknown>,
    ko: koTranslations as unknown as Record<string, unknown>,
    th: thTranslations as unknown as Record<string, unknown>,
    vi: viTranslations as unknown as Record<string, unknown>,
    es: esTranslations as unknown as Record<string, unknown>,
    pt: ptTranslations as unknown as Record<string, unknown>,
    fr: frTranslations as unknown as Record<string, unknown>,
    de: deTranslations as unknown as Record<string, unknown>,
    it: itTranslations as unknown as Record<string, unknown>,
    pl: plTranslations as unknown as Record<string, unknown>,
    tr: trTranslations as unknown as Record<string, unknown>,
    ar: arTranslations as unknown as Record<string, unknown>,
};

// Current language state
let currentLanguage: LanguageCode = "id";
const listeners = new Set<() => void>();

// Helper to read cookie
function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

// Helper to set cookie
function setCookie(name: string, value: string) {
    if (typeof document === "undefined") return;
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Lax`;
}

// Initialize from cookie/localStorage
if (typeof window !== "undefined") {
    const cookieLang = getCookie(LANGUAGE_COOKIE) as LanguageCode | null;
    if (cookieLang && translations[cookieLang]) {
        currentLanguage = cookieLang;
    } else {
        try {
            const stored = localStorage.getItem("language-storage");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed?.state?.language && translations[parsed.state.language]) {
                    currentLanguage = parsed.state.language;
                    setCookie(LANGUAGE_COOKIE, currentLanguage);
                }
            }
        } catch { /* ignore */ }
    }
}

// Subscribe/notify pattern
function subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

function getSnapshot(): LanguageCode {
    return currentLanguage;
}

function getServerSnapshot(): LanguageCode {
    return "id";
}

// Set language - instant, no async loading needed
export function setLanguage(lang: LanguageCode) {
    if (lang === currentLanguage || !translations[lang]) return;

    currentLanguage = lang;
    setCookie(LANGUAGE_COOKIE, lang);
    try {
        localStorage.setItem("language-storage", JSON.stringify({ state: { language: lang } }));
    } catch { /* ignore */ }

    // Notify immediately - translations already loaded
    listeners.forEach(cb => cb());
}

/**
 * Get nested value from object using dot notation
 */
function get(obj: Record<string, unknown>, path: string): string {
    const keys = path.split(".");
    let result: unknown = obj;

    for (const key of keys) {
        if (result && typeof result === "object" && key in result) {
            result = (result as Record<string, unknown>)[key];
        } else {
            return path;
        }
    }

    return typeof result === "string" ? result : path;
}

/**
 * Translation hook - FAST, no async loading
 */
export function useTranslation() {
    const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const effectiveLanguage = isHydrated ? language : "id";
    const trans = translations[effectiveLanguage] || translations.id;

    const t = useCallback(
        (key: string, fallback?: string): string => {
            const value = get(trans, key);
            if (value !== key) return value;

            // Fallback to Indonesian
            if (effectiveLanguage !== "id") {
                const idValue = get(translations.id, key);
                if (idValue !== key) return idValue;
            }

            return fallback || key;
        },
        [trans, effectiveLanguage]
    );

    return useMemo(() => ({
        t,
        language: effectiveLanguage,
        isRTL: RTL_LANGUAGES.includes(effectiveLanguage),
        isHydrated,
    }), [t, effectiveLanguage, isHydrated]);
}

/**
 * Get translation for server components
 */
export function getTranslation(language: LanguageCode = "id") {
    const trans = translations[language] || translations.id;

    return (key: string, fallback?: string): string => {
        const value = get(trans, key);
        if (value !== key) return value;

        if (language !== "id") {
            const idValue = get(translations.id, key);
            if (idValue !== key) return idValue;
        }

        return fallback || key;
    };
}

/**
 * Hook to get current language
 */
export function useCurrentLanguage(): LanguageCode {
    const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    return isHydrated ? language : "id";
}
