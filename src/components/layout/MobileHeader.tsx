"use client";

import { cn } from "@/lib/utils";
import { Search, Menu } from "lucide-react";
import Link from "next/link";

interface MobileHeaderProps {
    className?: string;
}

export function MobileHeader({ className }: MobileHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between px-4 py-4 bg-[#111319]", className)}>
            <Link href="/" className="text-2xl font-bold text-[#00cc55]">
                Rabastrim
            </Link>
            <div className="flex items-center gap-4 text-white">
                <Link href="/search">
                    <Search className="w-6 h-6" />
                </Link>
                <button>
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
