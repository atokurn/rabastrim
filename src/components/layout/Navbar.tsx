"use client";

import { Search, History, Globe, User, Crown, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isWatchPage = pathname.startsWith("/watch");
    const isSearchPage = pathname.startsWith("/search");

    return (
        <header
            className={cn(
                "navbar fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
                scrolled ? "bg-[#111319]" : "bg-gradient-to-b from-black/80 to-transparent",
                isWatchPage ? "hidden lg:block" : ""
            )}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo & Left Menu */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-2xl font-bold text-[#00cc55]">
                        Rabastrim
                    </Link>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
                        <Link href="/" className="text-white hover:text-[#00cc55] transition-colors">
                            For You
                        </Link>
                        <Link href="/drama" className="hover:text-white transition-colors">
                            Drama
                        </Link>
                        <Link href="/movie" className="hover:text-white transition-colors">
                            Movie
                        </Link>
                        <Link href="/k-drama" className="hover:text-white transition-colors">
                            K-Drama
                        </Link>
                        <Link href="/anime" className="hover:text-white transition-colors">
                            Anime
                        </Link>
                    </nav>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
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
                        <button className="hover:text-white">
                            <History className="w-5 h-5" />
                        </button>
                        <button className="hover:text-white">
                            <Globe className="w-5 h-5" />
                        </button>
                        <button className="hover:text-white">
                            <User className="w-6 h-6 bg-gray-700 rounded-full p-1" />
                        </button>
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
        </header>
    );
}
