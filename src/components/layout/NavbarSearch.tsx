"use client";

import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PopularSearches } from "../search/PopularSearches";
import { SearchSuggestions } from "../search/SearchSuggestions";
import { cn } from "@/lib/utils";

interface PopularItem {
    id: string;
    title: string;
    cover: string;
    rank: number;
    provider: string;
}

interface SearchSuggestion {
    id: string;
    title: string;
    provider: string;
}

export function NavbarSearch() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [popular, setPopular] = useState<PopularItem[]>([]);
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    // Fetch popular searches on mount
    useEffect(() => {
        const fetchPopular = async () => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/search/popular");
                if (res.ok) {
                    const data = await res.json();
                    setPopular(data.popular || []);
                }
            } catch (error) {
                console.error("Failed to fetch popular searches:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPopular();
    }, []);

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch suggestions when query changes
    useEffect(() => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data.suggestions || []);
                }
            } catch (error) {
                console.error("Failed to fetch suggestions:", error);
            }
        }, 300);

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setIsFocused(false);
        }
    };

    return (
        <div ref={containerRef} className="relative hidden md:block">
            <form
                onSubmit={handleSubmit}
                className={cn(
                    "flex items-center bg-[#1f2126] rounded-full px-3 py-1.5 w-64 border transition-all duration-200",
                    isFocused ? "border-gray-600 bg-[#2a2d32] w-72" : "border-transparent border-gray-800/50"
                )}
            >
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-500"
                />

                {query ? (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery("");
                            // Keep focus
                            const input = containerRef.current?.querySelector('input');
                            input?.focus();
                        }}
                        className="text-gray-500 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                ) : (
                    <button type="submit" className="text-gray-500 hover:text-white">
                        <Search className="w-4 h-4" />
                    </button>
                )}
            </form>

            {/* Popular Searches Dropdown */}
            <div
                className={cn(
                    "absolute top-full right-0 mt-2 w-72 bg-[#1a1c22] rounded-lg shadow-xl border border-gray-800 overflow-hidden z-50 transition-all duration-200 origin-top-right",
                    isFocused ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                )}
            >
                {/* Use the existing PopularSearches component with 'sidebar' variant for the list style */}
                {/* Use the existing PopularSearches component with 'sidebar' variant for the list style */}
                {query.length >= 2 && suggestions.length > 0 ? (
                    <SearchSuggestions
                        suggestions={suggestions}
                        query={query}
                        isVisible={true}
                        className="static top-auto border-none bg-transparent w-full"
                        onSelect={(suggestion) => {
                            setQuery(suggestion.title);
                            router.push(`/search?q=${encodeURIComponent(suggestion.title)}`);
                            setIsFocused(false);
                        }}
                    />
                ) : (
                    <PopularSearches
                        items={popular}
                        isLoading={isLoading}
                        variant="sidebar"
                    />
                )}
            </div>
        </div>
    );
}
