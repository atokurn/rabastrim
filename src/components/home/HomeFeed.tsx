"use client";

import { useState, useEffect, useRef } from "react";
import { HomeCategories } from "./HomeCategories";
import { HomeContent } from "./HomeContent";
import { useTranslation } from "@/lib/i18n/use-translation";

// Category keys for translation
const CATEGORY_KEYS = ["all", "short_drama", "drama_china", "drama_korea", "drama_japan", "drama_thailand", "anime"];

export function HomeFeed() {
    const { t } = useTranslation();

    // Translate categories dynamically
    const categories = CATEGORY_KEYS.map(key => t(`categories.${key}`));

    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
    const activeCategory = categories[activeCategoryIndex];

    const containerRef = useRef<HTMLDivElement>(null);

    // Scroll to section top when category changes, but only if we are below it
    useEffect(() => {
        if (!containerRef.current) return;

        const containerTop = containerRef.current.getBoundingClientRect().top + window.scrollY;
        // Offset for sticky header (approx 60px) + some breathing room
        const targetPosition = containerTop - 70;

        if (window.scrollY > targetPosition) {
            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });
        }
    }, [activeCategoryIndex]);

    return (
        <div className="min-h-screen" ref={containerRef}>
            <HomeCategories
                categories={categories}
                activeCategory={activeCategory}
                onSelect={(cat) => setActiveCategoryIndex(categories.indexOf(cat))}
            />
            <div className="pt-4">
                <HomeContent category={CATEGORY_KEYS[activeCategoryIndex]} />
            </div>
        </div>
    );
}

