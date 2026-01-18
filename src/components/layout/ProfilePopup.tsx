"use client";

import { useUserStore } from "@/lib/auth/store";
import { useTranslation } from "@/lib/i18n/use-translation";
import Link from "next/link";
import { User, LogOut, Settings, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfilePopupProps {
    isVisible: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onLoginClick: () => void;
}

export function ProfilePopup({ isVisible, onMouseEnter, onMouseLeave, onLoginClick }: ProfilePopupProps) {
    const { user, logout } = useUserStore();
    const { t } = useTranslation();

    if (!isVisible) return null;

    return (
        <div
            className={cn(
                "absolute top-full right-0 mt-2 w-64 bg-[#1a1c22] rounded-lg shadow-xl border border-gray-800 overflow-hidden z-50 transition-opacity duration-200",
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* Arrow pointing up */}
            <div className="absolute -top-1.5 right-2 w-3 h-3 bg-[#1a1c22] border-t border-l border-gray-800 transform rotate-45" />

            <div className="p-2">
                {user ? (
                    <>
                        <div className="px-3 py-3 border-b border-gray-800 mb-1">
                            <p className="text-white font-medium truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">ID: {user.id.slice(0, 8)}...</p>
                        </div>

                        <Link
                            href="/user"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-[#23252b] rounded-md transition-colors"
                        >
                            <User className="w-4 h-4" />
                            <span>{t("user.my_profile")}</span>
                        </Link>

                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-[#23252b] rounded-md transition-colors text-left"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>{t("buttons.logout")}</span>
                        </button>
                    </>
                ) : (
                    <div className="p-2">
                        <p className="text-gray-400 text-xs mb-3 text-center px-4">
                            Log in to sync your history across devices
                        </p>
                        <button
                            onClick={onLoginClick}
                            className="w-full bg-[#00cc55] hover:bg-[#00b34a] text-black font-bold py-2 rounded-md text-sm transition-colors"
                        >
                            Log In / Sign Up
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
