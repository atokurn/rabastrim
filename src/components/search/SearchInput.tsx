"use client";

import { Search, X, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onClear: () => void;
    onFocus?: () => void;
    placeholder?: string;
    autoFocus?: boolean;
    showBackButton?: boolean;
    className?: string;
}

export function SearchInput({
    value,
    onChange,
    onSubmit,
    onClear,
    onFocus,
    placeholder = "Cari drama, film, anime...",
    autoFocus = true,
    showBackButton = false,
    className,
}: SearchInputProps) {
    const router = useRouter();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onSubmit();
        }
    };

    return (
        <div className={cn("flex items-center gap-3 px-4 py-3 bg-[#0f1014]", className)}>
            {/* Back Button - only on mobile */}
            {showBackButton && (
                <button
                    onClick={() => router.back()}
                    className="text-gray-400 hover:text-white transition-colors shrink-0"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}

            {/* Search Input Container */}
            <div className="flex-1 relative flex items-center bg-[#1f2126] rounded-full px-4 py-2.5">
                <Search className="w-5 h-5 text-gray-500 shrink-0" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={onFocus}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="flex-1 bg-transparent border-none outline-none text-white text-sm px-3 placeholder:text-gray-500"
                />
                {value && (
                    <button
                        onClick={onClear}
                        className="text-gray-400 hover:text-white transition-colors shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}
