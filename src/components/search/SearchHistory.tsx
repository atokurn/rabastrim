"use client";

import { useState } from "react";
import { Trash2, X, ChevronDown, ChevronUp, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchHistoryProps {
    history: string[];
    onSelect: (term: string) => void;
    onClear: () => void;
    onRemove?: (term: string) => void;
}

export function SearchHistory({ history, onSelect, onClear, onRemove }: SearchHistoryProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (history.length === 0) return null;

    const visibleHistory = isExpanded ? history : history.slice(0, 3);
    const hasMore = history.length > 3;

    return (
        <div className="px-4 py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#facc15] text-sm font-bold">Sejarah</h3>
                <button
                    onClick={onClear}
                    className="text-gray-500 hover:text-white transition-colors p-1"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* List Layout */}
            <ul className="flex flex-col gap-1">
                {visibleHistory.map((term, index) => (
                    <li key={`${term}-${index}`} className="group flex items-center justify-between py-2">
                        <button
                            onClick={() => onSelect(term)}
                            className="flex-1 text-left text-gray-300 text-sm hover:text-white transition-colors line-clamp-1 mr-4"
                        >
                            {term}
                        </button>

                        {onRemove && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(term);
                                }}
                                className="text-gray-600 hover:text-gray-400 p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            {/* Expand/Collapse Toggle */}
            {hasMore && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full mt-2 py-2 text-gray-400 hover:text-white transition-colors"
                >
                    <span className="text-sm font-medium">
                        {isExpanded ? "Sembunyikan" : "Lihat Semua"}
                    </span>
                    {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </button>
            )}
        </div>
    );
}
