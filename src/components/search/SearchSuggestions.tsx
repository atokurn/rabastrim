"use client";

import { cn } from "@/lib/utils";

interface SearchSuggestion {
    id: string;
    title: string;
    provider: string;
}

interface SearchSuggestionsProps {
    suggestions: SearchSuggestion[];
    query: string;
    onSelect: (suggestion: SearchSuggestion) => void;
    isVisible: boolean;
    className?: string;
}

export function SearchSuggestions({
    suggestions,
    query,
    onSelect,
    isVisible,
    className,
}: SearchSuggestionsProps) {
    if (!isVisible || suggestions.length === 0) return null;

    // Highlight matching text in green
    const highlightMatch = (text: string) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, "gi");
        const parts = text.split(regex);

        return parts.map((part, i) =>
            regex.test(part) ? (
                <span key={i} className="text-[#00cc55]">
                    {part}
                </span>
            ) : (
                <span key={i}>{part}</span>
            )
        );
    };

    return (
        <div className={cn("absolute top-full left-0 right-0 z-50 bg-[#0f1014] border-t border-gray-800", className)}>
            <ul className="divide-y divide-gray-800/50">
                {suggestions.map((suggestion) => (
                    <li key={`${suggestion.provider}-${suggestion.id}`}>
                        <button
                            onClick={() => onSelect(suggestion)}
                            className="w-full px-6 py-4 text-left hover:bg-white/5 transition-colors"
                        >
                            <span className="text-white text-sm">
                                {highlightMatch(suggestion.title)}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
