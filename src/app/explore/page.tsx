"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExploreTabs, ExploreSection, ExploreFeedSection } from "@/components/explore";
import { ProviderSource } from "@/lib/explore";
import { getProviderSections } from "@/lib/explore/sections";
import { Suspense } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";

function ExploreContent() {
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const source = (searchParams.get("source") || "dramabox") as ProviderSource;

    // Get sections for current provider
    const sections = getProviderSections(source);

    return (
        <div className="min-h-screen bg-[#0d0f14] pb-20">
            {/* Header (Mobile) */}
            <div className="bg-[#0d0f14] px-4 py-3 flex items-center justify-between md:hidden border-b border-[#1f2126]">
                <h1 className="text-lg font-bold text-white">{t("explore.video_collection")}</h1>
                <Link href="/search">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </Link>
            </div>

            {/* Provider Tabs (Mobile only) */}
            <ExploreTabs className="top-0 md:hidden" />

            {/* Carousel Sections */}
            <div className="mt-4 md:mt-24">
                {sections.map((section) => (
                    <ExploreSection key={section.id} section={section} />
                ))}
            </div>

            {/* Lihat Semua - Infinite Scroll Grid */}
            <ExploreFeedSection provider={source} />
        </div>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0d0f14]" />}>
            <ExploreContent />
        </Suspense>
    );
}
