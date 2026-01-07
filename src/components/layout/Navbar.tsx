"use client";

import { Search, History, Globe, User, Crown, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect, Suspense, useRef } from "react";
import { HistoryPopup } from "./HistoryPopup";
import { ProfilePopup } from "./ProfilePopup";
import { AuthDialog } from "@/components/user/AuthDialog";
import { useUserStore } from "@/lib/auth/store";

function NavbarContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const source = searchParams.get("source");
    const [scrolled, setScrolled] = useState(false);
    const { login } = useUserStore();

    // History Popup State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleHistoryEnter = () => {
        if (historyTimeoutRef.current) {
            clearTimeout(historyTimeoutRef.current);
        }
        setIsHistoryOpen(true);
    };

    const handleHistoryLeave = () => {
        historyTimeoutRef.current = setTimeout(() => {
            setIsHistoryOpen(false);
        }, 300); // Small delay to prevent flickering when moving between button and popup
    };

    // Profile Popup State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const profileTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleProfileEnter = () => {
        if (profileTimeoutRef.current) {
            clearTimeout(profileTimeoutRef.current);
        }
        setIsProfileOpen(true);
    };

    const handleProfileLeave = () => {
        profileTimeoutRef.current = setTimeout(() => {
            setIsProfileOpen(false);
        }, 300);
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isWatchPage = pathname.startsWith("/watch");
    const isSearchPage = pathname.startsWith("/search");
    const isUserPage = pathname.startsWith("/user");
    const isHistoryPage = pathname.startsWith("/history");
    const shouldHideOnMobile = isUserPage || isHistoryPage;

    const navItems = [
        { label: "For You", href: "/", isActive: pathname === "/" },
        { label: "DramaBox", href: "/explore?source=dramabox", isActive: pathname === "/explore" && (source === "dramabox" || source === null) },
        { label: "FlickReels", href: "/explore?source=flickreels", isActive: pathname === "/explore" && source === "flickreels" },
        { label: "Melolo", href: "/explore?source=melolo", isActive: pathname === "/explore" && source === "melolo" },
        { label: "Drama Queen", href: "/explore?source=dramaqueen", isActive: pathname === "/explore" && source === "dramaqueen" },
        { label: "Anime", href: "/explore?source=anime", isActive: pathname === "/explore" && source === "anime" },
    ];

    return (
        <header
            className={cn(
                "navbar fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
                scrolled ? "bg-[#111319]" : "bg-gradient-to-b from-black/80 to-transparent",
                isWatchPage ? "hidden lg:block" : "",
                shouldHideOnMobile ? "hidden md:block" : ""
            )}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold text-[#00cc55] shrink-0 mr-4">
                    Rabastrim
                </Link>

                {/* Scrollable Menu */}
                <div className="flex-1 overflow-hidden mx-2">
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300 overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] mask-linear-fade">
                        {navItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "transition-colors whitespace-nowrap relative px-1 py-1",
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
                    </nav>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4 shrink-0">
                    {/* Hide navbar search on /search page to avoid duplicate */}
                    {!isSearchPage && (
                        <Link
                            href="/search"
                            className="hidden md:flex items-center bg-[#1f2126] rounded-full px-3 py-1.5 w-64 border border-transparent hover:border-gray-600 cursor-pointer"
                        >
                            <span className="text-sm text-gray-500 w-full">Cari drama...</span>
                            <Search className="w-4 h-4 text-gray-400" />
                        </Link>
                    )}

                    <Link href="/search" className="text-gray-300 hover:text-white md:hidden">
                        <Search className="w-6 h-6" />
                    </Link>

                    <div className="hidden md:flex items-center gap-4 text-gray-300">
                        <div
                            className="relative"
                            onMouseEnter={handleHistoryEnter}
                            onMouseLeave={handleHistoryLeave}
                        >
                            <button className={cn(
                                "hover:text-white transition-colors flex items-center justify-center p-1 rounded-full",
                                isHistoryOpen ? "text-white bg-gray-800" : ""
                            )}>
                                <History className="w-5 h-5" />
                            </button>
                            <HistoryPopup
                                isVisible={isHistoryOpen}
                                onMouseEnter={handleHistoryEnter}
                                onMouseLeave={handleHistoryLeave}
                            />
                        </div>
                        <button className="hover:text-white">
                            <Globe className="w-5 h-5" />
                        </button>
                        <div
                            className="relative"
                            onMouseEnter={handleProfileEnter}
                            onMouseLeave={handleProfileLeave}
                        >
                            <button
                                className={cn(
                                    "hover:text-white transition-colors",
                                    isProfileOpen ? "text-white" : ""
                                )}
                                onClick={() => setIsAuthDialogOpen(true)}
                            >
                                <User className="w-6 h-6 bg-gray-700 rounded-full p-1" />
                            </button>
                            <ProfilePopup
                                isVisible={isProfileOpen}
                                onMouseEnter={handleProfileEnter}
                                onMouseLeave={handleProfileLeave}
                                onLoginClick={() => {
                                    setIsProfileOpen(false);
                                    setIsAuthDialogOpen(true);
                                }}
                            />
                        </div>
                    </div>

                    <button className="md:hidden text-white">
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="hidden md:flex gap-2">
                        <button className="bg-[#cba46a] text-black px-3 py-1 rounded text-xs font-bold flex items-center gap-1 hover:bg-[#d4b078]">
                            <Crown className="w-3 h-3 fill-black" /> VIP
                        </button>
                    </div>
                </div>
            </div>

            <AuthDialog
                isOpen={isAuthDialogOpen}
                onClose={() => setIsAuthDialogOpen(false)}
                onLogin={(provider) => {
                    login(provider);
                    setIsAuthDialogOpen(false);
                }}
            />
        </header>
    );
}

export function Navbar() {
    return (
        <Suspense fallback={null}>
            <NavbarContent />
        </Suspense>
    );
}
