"use client";

import { Home, Compass, PlayCircle, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
    const pathname = usePathname();

    if (pathname.startsWith("/watch") || pathname.startsWith("/search")) return null;

    const navs = [
        { name: "Home", href: "/", icon: Home },
        { name: "Explore", href: "/explore", icon: Compass },
        { name: "VIP", href: "/vip", icon: PlayCircle }, // Reusing PlayCircle for VIP/Shorts feel
        { name: "Me", href: "/profile", icon: User },
    ];

    return (
        <div className="mobile-nav md:hidden fixed bottom-0 left-0 right-0 bg-[#111319] border-t border-[#1f2126] z-50">
            <div className="flex items-center justify-around h-16">
                {navs.map((nav) => {
                    const isActive = pathname === nav.href;
                    const Icon = nav.icon;
                    return (
                        <Link
                            key={nav.name}
                            href={nav.href}
                            className={cn(
                                "flex flex-col items-center gap-1 text-xs",
                                isActive ? "text-[#00cc55]" : "text-gray-500 hover:text-gray-300"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
                            <span>{nav.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
