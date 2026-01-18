"use client";

import { Check, ArrowLeft, Globe } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/i18n";
import { useTranslation, useCurrentLanguage, setLanguage } from "@/lib/i18n/use-translation";

export default function LanguageSettingsPage() {
    const language = useCurrentLanguage();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-[#121418] pb-24 md:pt-16">
            {/* Header */}
            <div className="border-b border-gray-800 bg-[#1f2126]">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/user"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-[#00cc55]" />
                            <h1 className="text-xl font-bold text-white">
                                {t("settings.language_title")}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="container mx-auto px-4 py-6">
                <p className="text-gray-400 text-sm mb-6">
                    {t("settings.language_description")}
                </p>

                {/* Language Options */}
                <div className="bg-[#1f2126] rounded-xl overflow-hidden">
                    {SUPPORTED_LANGUAGES.map((lang, index) => (
                        <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={cn(
                                "w-full px-4 py-4 flex items-center justify-between",
                                "hover:bg-gray-800 transition-colors text-left",
                                language === lang.code ? "bg-gray-800/50" : "",
                                index !== SUPPORTED_LANGUAGES.length - 1 ? "border-b border-gray-800" : ""
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">{lang.flag}</span>
                                <div>
                                    <span className={cn(
                                        "text-base block",
                                        language === lang.code ? "text-[#00cc55] font-semibold" : "text-gray-200"
                                    )}>
                                        {lang.label}
                                    </span>
                                    {language === lang.code && (
                                        <span className="text-xs text-gray-500">
                                            {t("settings.current_language")}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {language === lang.code && (
                                <Check className="w-5 h-5 text-[#00cc55]" />
                            )}
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
}
