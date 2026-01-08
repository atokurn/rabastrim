"use client";

import { useState, useEffect } from "react";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageOption {
    code: string;
    label: string;
    isDefault?: boolean;
}

interface LanguageSelectorProps {
    contentId?: string;
    provider?: string;
    /** Currently selected language code */
    currentLanguage?: string;
    /** Callback when language is changed */
    onLanguageChange?: (code: string) => void;
    /** Size variant */
    size?: "sm" | "md";
    /** Position of dropdown */
    position?: "top" | "bottom";
}

/**
 * Language Selector Dropdown for Video Player
 * 
 * Fetches available languages from /api/content/[id]/languages
 * and allows user to switch between them.
 */
export function LanguageSelector({
    contentId,
    provider,
    currentLanguage,
    onLanguageChange,
    size = "md",
    position = "top",
}: LanguageSelectorProps) {
    const [languages, setLanguages] = useState<LanguageOption[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(currentLanguage || null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch languages when contentId changes
    useEffect(() => {
        if (!contentId) return;

        const fetchLanguages = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/content/${contentId}/languages`);
                if (!res.ok) throw new Error("Failed to fetch languages");

                const data = await res.json();

                // Combine subtitle languages
                const subtitles: LanguageOption[] = (data.subtitle || []).map((s: any) => ({
                    code: s.code,
                    label: s.label,
                    isDefault: s.isDefault,
                }));

                setLanguages(subtitles);

                // Set default if not already selected
                if (!selectedLanguage && data.default?.subtitle) {
                    setSelectedLanguage(data.default.subtitle);
                }
            } catch (error) {
                console.error("[LanguageSelector] Error:", error);
                // Fallback: show default language based on provider
                const fallback = provider === "dramaqueen" ? "zh" : "id";
                setLanguages([{ code: fallback, label: fallback === "zh" ? "中文" : "Indonesia" }]);
                setSelectedLanguage(fallback);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLanguages();
    }, [contentId, provider]);

    const handleSelect = (code: string) => {
        setSelectedLanguage(code);
        setIsOpen(false);
        onLanguageChange?.(code);
    };

    const currentLabel = languages.find(l => l.code === selectedLanguage)?.label || "Bahasa";

    // Don't render if no languages available
    if (languages.length <= 1 && !isLoading) {
        return null;
    }

    return (
        <div className="relative group/lang">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-1.5 text-white font-medium bg-white/10 rounded hover:bg-[#00cc55] hover:text-black transition-colors",
                    size === "sm" ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-sm"
                )}
            >
                <Languages className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} />
                <span className="max-w-[60px] truncate">{currentLabel}</span>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className={cn(
                        "absolute left-1/2 -translate-x-1/2 flex flex-col bg-[#1f2126] rounded-lg p-1 shadow-xl z-50 min-w-[120px]",
                        position === "top" ? "bottom-full mb-2" : "top-full mt-2"
                    )}
                >
                    {isLoading ? (
                        <div className="px-3 py-2 text-xs text-gray-400">Loading...</div>
                    ) : (
                        languages.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={cn(
                                    "px-3 py-1.5 text-sm text-left rounded transition-colors",
                                    selectedLanguage === lang.code
                                        ? "text-[#00cc55] bg-white/10"
                                        : "text-gray-300 hover:text-white hover:bg-white/10"
                                )}
                            >
                                {lang.label}
                                {lang.isDefault && (
                                    <span className="ml-2 text-xs text-gray-500">(default)</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}

            {/* Backdrop to close dropdown */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
