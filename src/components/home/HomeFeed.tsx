"use client";

import { useState, useEffect, useRef } from "react";
import { HomeCategories } from "./HomeCategories";
import { HomeContent } from "./HomeContent";

const CATEGORIES = ["Semua", "Short Drama", "Drama China", "Drama Korea", "Drama Jepang", "Drama Thailand", "Anime"];

export function HomeFeed() {
    const [activeCategory, setActiveCategory] = useState("Semua");

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
    }, [activeCategory]);

    return (
        <div className="min-h-screen" ref={containerRef}>
            <HomeCategories
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onSelect={setActiveCategory}
            />
            <div className="pt-4">
                <HomeContent category={activeCategory} />
            </div>
        </div>
    );
}
