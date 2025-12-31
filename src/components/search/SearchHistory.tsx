"use client";

import { Trash2 } from "lucide-react";

interface SearchHistoryProps {
    history: string[];
    onSelect: (term: string) => void;
    onClear: () => void;
}

export function SearchHistory({ history, onSelect, onClear }: SearchHistoryProps) {
    if (history.length === 0) return null;

    return (
        <div className="px-4 py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white text-sm font-medium">Histori pencarian</h3>
                <button
                    onClick={onClear}
                    className="text-gray-500 hover:text-white transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-2">
                {history.map((term, index) => (
                    <button
                        key={`${term}-${index}`}
                        onClick={() => onSelect(term)}
                        className="px-4 py-2 bg-[#1f2126] hover:bg-[#2a2d32] text-gray-300 text-sm rounded-full border border-gray-700 transition-colors"
                    >
                        {term}
                    </button>
                ))}
            </div>
        </div>
    );
}
