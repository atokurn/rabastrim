"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

interface NavItem {
    label: string;
    href: string;
    isActive: boolean;
}

interface ResponsiveNavProps {
    items: NavItem[];
    className?: string;
}

export function ResponsiveNav({ items, className }: ResponsiveNavProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(items.length);
    const [isMeasuring, setIsMeasuring] = useState(true);
    const { t } = useTranslation();

    // We need to measure widths. 
    // Strategy: Render all items invisible first to get their natural widths.
    // Then calculate how many fit.

    useLayoutEffect(() => {
        const calculateVisibleItems = () => {
            if (!containerRef.current) return;

            const containerWidth = containerRef.current.clientWidth;
            // Get all measuring children (the invisible full list)
            const children = Array.from(containerRef.current.children) as HTMLElement[];
            // The last child includes the "More" button if we render it for measurement, 
            // but simpler: we just render the list items for measurement + a dummy "More" button.

            // However, we are swapping between rendering "All" (for measure) vs "Partitioned".
            // To avoid flash, we can always render the full list "hidden" and the visible list "absolute" or vice versa.
            // A simpler robust way: 
            // 1. Render specific "measuring" container that is hidden but has width.
            // 2. Or, just iterate the rendered children if we start with ALL.

            // Let's assume we render ALL items initially (or always in a hidden layer).

            // For this implementation, let's use a "measure mode" where we render everything hidden?
            // No, that's complex.
            // Let's just iterate the children width.

            // We need to know the width of the "More" button. Let's estimate or measure.
            const MORE_BTN_WIDTH = 90; // "Lainnya" + Icon + Padding + Gap
            const GAP = 24; // gap-6 is 24px

            let currentWidth = 0;
            let count = 0;
            let allFit = true;

            // We look at the children that correspond to the items.
            // Since we might be in a "partitioned" state, checking .children is tricky if we don't render all.
            // Better: Render a separate hidden container with all items just for measurement.
        };

        // Actually, a simpler approach often used:
        // Render the container. On Resize, loop through items widths (cached or remeasured).
        // If we don't render them, we can't measure. 
        // So we will render TWO lists:
        // 1. The "Real" list (visibleItems + Dropdown)
        // 2. The "Shadow" list (All items, invisible, absolute, pointer-events-none) used for measurement.

        const measureAndCalculate = () => {
            if (!containerRef.current) return;

            // The shadow list is the first child div
            const shadowContainer = containerRef.current.querySelector('.nav-shadow-list');
            if (!shadowContainer) return;

            const containerWidth = containerRef.current.clientWidth;
            const itemElements = Array.from(shadowContainer.children) as HTMLElement[];
            const MORE_BTN_WIDTH = 100; // Safety buffer
            const GAP = 24;

            let usedWidth = 0;
            let possibleCount = 0;
            let fitsAll = true;

            for (let i = 0; i < itemElements.length; i++) {
                const itemWidth = itemElements[i].offsetWidth;
                // Add item width
                usedWidth += itemWidth;
                // Add gap if not first item
                if (i > 0) usedWidth += GAP;

                if (usedWidth > containerWidth) {
                    fitsAll = false;
                    // This item makes it overflow.
                    // But wait, if we stop here, we need to check if we need space for "More".
                    // If we are overflowing, we DEFINITELY need space for "More".
                    // So we actually needed to stop earlier.
                    break;
                }
                possibleCount++;
            }

            if (fitsAll) {
                setVisibleCount(items.length);
                return;
            }

            // If we don't fit all, we re-calculate requiring the "More" button.
            // Reset
            usedWidth = 0;
            possibleCount = 0;

            for (let i = 0; i < itemElements.length; i++) {
                const itemWidth = itemElements[i].offsetWidth;
                let nextWidth = usedWidth + itemWidth;
                if (i > 0) nextWidth += GAP;

                // Check if adding this item + More Button exceeds container
                // We only need to check "More Button" if this isn't the last item (but we know not all fit).
                if (nextWidth + GAP + MORE_BTN_WIDTH <= containerWidth) {
                    usedWidth = nextWidth;
                    possibleCount++;
                } else {
                    break;
                }
            }

            // Ensure at least 1 item or 0 if space is tiny?
            // possibleCount = Math.max(0, possibleCount);
            setVisibleCount(possibleCount);
        };

        measureAndCalculate();

        const observer = new ResizeObserver(measureAndCalculate);
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [items]); // Re-run if items change

    const visibleItems = items.slice(0, visibleCount);
    const hiddenItems = items.slice(visibleCount);

    // Helper to determine if an overflow item is active (to highlight the More button)
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const source = searchParams.get("source");

    const isMoreActive = hiddenItems.some(item =>
        item.isActive || (pathname.startsWith("/explore") && item.href.includes(source || "xxx"))
    );

    return (
        <div ref={containerRef} className={cn("relative w-full h-full flex items-center", className)}>

            {/* Shadow List for Measurement - Invisible but rendered to take up space (absolute) to measure natural widths */}
            {/* Wrapped in a zero-size overflow-hidden container to prevent page scrollbars, but inner list is free to have width */}
            <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', visibility: 'hidden' }} aria-hidden="true">
                <div className="nav-shadow-list flex items-center gap-6">
                    {items.map((item) => (
                        <span key={item.label} className="whitespace-nowrap px-1 py-1 text-sm font-medium">
                            {item.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Visible Items */}
            <div className="flex items-center gap-6 w-full text-sm font-medium text-gray-300">
                {visibleItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "transition-colors whitespace-nowrap relative px-1 py-1 group shrink-0",
                            item.isActive
                                ? "text-[#00cc55] font-bold"
                                : "text-gray-300 hover:text-white"
                        )}
                    >
                        {item.label}
                        {item.isActive && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00cc55] rounded-full" />
                        )}
                    </Link>
                ))}

                {/* Dropdown for More Items */}
                {hiddenItems.length > 0 && (
                    <div className="relative group/more shrink-0">
                        <div className={cn(
                            "flex items-center gap-1 cursor-pointer hover:text-white px-1 py-1 transition-colors",
                            isMoreActive ? "text-[#00cc55] font-bold" : "text-gray-300"
                        )}>
                            <span>{t("common.more")}</span>
                            <ChevronDown className="w-4 h-4" />
                            {isMoreActive && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00cc55] rounded-full" />
                            )}
                        </div>

                        {/* Dropdown Menu */}
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[#1f2126] border border-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all duration-200 transform translate-y-2 group-hover/more:translate-y-0 z-50">
                            <div className="py-2 flex flex-col">
                                {hiddenItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={cn(
                                            "px-4 py-2 hover:bg-white/5 transition-colors text-left text-sm",
                                            item.isActive
                                                ? "text-[#00cc55] font-bold"
                                                : "text-gray-300 hover:text-white"
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
