"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Supported languages for the website
 * Based on DramaBox supported languages
 */
export const SUPPORTED_LANGUAGES = [
    { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "zh", label: "简体中文", flag: "🇨🇳" },
    { code: "zh-TW", label: "繁体中文", flag: "🇹🇼" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
    { code: "ko", label: "한국어", flag: "🇰🇷" },
    { code: "th", label: "ภาษาไทย", flag: "🇹🇭" },
    { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "pt", label: "Português", flag: "🇧🇷" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "it", label: "Italiano", flag: "🇮🇹" },
    { code: "pl", label: "Polski", flag: "🇵🇱" },
    { code: "tr", label: "Türkçe", flag: "🇹🇷" },
    { code: "ar", label: "العربية", flag: "🇸🇦" },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]["code"];

interface LanguageState {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
}

// Cross-tab sync channel name
const SYNC_CHANNEL_NAME = "rabastrim_language_sync";

// Helper to broadcast language changes to other tabs
function broadcastLanguageChange(language: LanguageCode) {
    if (typeof window === "undefined") return;
    try {
        const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channel.postMessage({ type: "language_change", language });
        channel.close();
    } catch {
        // BroadcastChannel not supported, ignore
    }
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: "id", // Default to Indonesian
            setLanguage: (lang: LanguageCode) => {
                set({ language: lang });
                broadcastLanguageChange(lang);
            },
        }),
        {
            name: 'language-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Setup cross-tab listener (call once in app layout)
export function setupLanguageSyncListener() {
    if (typeof window === "undefined") return () => { };

    try {
        const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        const handler = (event: MessageEvent) => {
            if (event.data?.type === "language_change" && event.data?.language) {
                useLanguageStore.setState({ language: event.data.language });
            }
        };
        channel.addEventListener("message", handler);
        return () => {
            channel.removeEventListener("message", handler);
            channel.close();
        };
    } catch {
        return () => { };
    }
}

/**
 * Get language info by code
 */
export function getLanguageInfo(code: LanguageCode) {
    return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
}
