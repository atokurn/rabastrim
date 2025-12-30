"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export function Drawer({ isOpen, onClose, title, children, className }: DrawerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            requestAnimationFrame(() => setIsAnimating(true));
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setIsVisible(false), 300); // Match transition duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className={cn(
                    "absolute inset-0 bg-black/60 transition-opacity duration-300 pointer-events-auto",
                    isAnimating ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* Drawer Content */}
            <div
                className={cn(
                    "relative w-full max-w-md bg-[#1f2126] rounded-t-2xl shadow-xl transition-transform duration-300 ease-out transform pointer-events-auto flex flex-col max-h-[80vh]",
                    isAnimating ? "translate-y-0" : "translate-y-full",
                    className
                )}
            >
                {/* Handle bar for visual cue */}
                <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
                </div>

                {/* Header */}
                {(title) && (
                    <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800">
                        <h3 className="font-bold text-white text-lg">{title}</h3>
                        <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}
