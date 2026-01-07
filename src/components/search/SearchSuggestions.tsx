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
        <div className={cn(
            "absolute top-full left-0 right-0 z-50 bg-black md:bg-[#0f1014] md:border-t md:border-gray-800 shadow-xl min-h-[calc(100vh-60px)] md:min-h-0",
            className
        )}>
            <ul className="flex flex-col py-2">
                {suggestions.map((suggestion) => (
                    <li key={`${suggestion.provider}-${suggestion.id}`} className="border-b border-white/5 md:border-gray-800/50 last:border-none">
                        <button
                            onClick={() => onSelect(suggestion)}
                            className="w-full px-4 py-4 md:px-6 md:py-3 text-left hover:bg-white/5 transition-colors flex items-center justify-between group"
                        >
                            <span className="text-gray-100 text-[15px] md:text-sm font-normal line-clamp-1 group-hover:text-[#00cc55] transition-colors">
                                {highlightMatch(suggestion.title)}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
