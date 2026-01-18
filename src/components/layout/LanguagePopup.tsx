"use client";

import { Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/i18n";
import { useTranslation, useCurrentLanguage, setLanguage } from "@/lib/i18n/use-translation";

interface LanguagePopupProps {
    isVisible: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export function LanguagePopup({ isVisible, onMouseEnter, onMouseLeave }: LanguagePopupProps) {
    const language = useCurrentLanguage();
    const { t } = useTranslation();

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "absolute right-0 top-full mt-2 w-56 z-50",
                "bg-[#1f2126] rounded-xl shadow-xl border border-gray-800",
                "overflow-hidden",
                "animate-in fade-in-0 zoom-in-95 duration-200"
            )}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-800">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Globe className="w-4 h-4" />
                    <span>{t("settings.language_title")}</span>
                </div>
            </div>

            {/* Language Options */}
            <div className="py-2 max-h-80 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={cn(
                            "w-full px-4 py-2.5 flex items-center justify-between",
                            "hover:bg-gray-800 transition-colors text-left",
                            language === lang.code ? "bg-gray-800/50" : ""
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">{lang.flag}</span>
                            <span className={cn(
                                "text-sm",
                                language === lang.code ? "text-[#00cc55] font-medium" : "text-gray-200"
                            )}>
                                {lang.label}
                            </span>
                        </div>
                        {language === lang.code && (
                            <Check className="w-4 h-4 text-[#00cc55]" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
