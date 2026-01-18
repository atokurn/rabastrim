"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

interface UserMenuProps {
    desktopOnly?: boolean;
    mobileOnly?: boolean;
}

export function UserMenu({ desktopOnly, mobileOnly }: UserMenuProps) {
    const pathname = usePathname();
    const { t } = useTranslation();

    const menuItems = [
        { label: "Langganan VIP", href: "/vip" },
        { label: "Top Up Credit", href: "/topup" },
        { label: t("menu.downloads"), href: "/downloads" },
        { label: t("menu.language"), href: "/settings/language" },
        { label: t("menu.settings"), href: "/settings" },
        { label: t("menu.support"), href: "/support" },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <>
            {/* Desktop Sidebar / Menu */}
            {/* If mobileOnly is true, hide this. If desktopOnly is true or undefined, show this (responsive logic inside className) */}
            {!mobileOnly && (
                <div className={`${desktopOnly ? 'flex' : 'hidden md:flex'} flex-col gap-2 bg-[#1f2126] p-4 rounded-xl sticky top-24 h-fit`}>
                    <h3 className="text-gray-500 text-sm font-semibold mb-2 px-2 uppercase tracking-wider">Menu</h3>
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors group ${isActive(item.href) ? "bg-gray-800" : "hover:bg-gray-800"
                                }`}
                        >
                            <span className={`font-medium ${isActive(item.href) ? "text-white" : "text-gray-200 group-hover:text-white"}`}>
                                {item.label}
                            </span>
                            <ChevronRight className={`w-4 h-4 transition-colors ${isActive(item.href) ? "text-white" : "text-gray-600 group-hover:text-white"}`} />
                        </Link>
                    ))}
                </div>
            )}

            {/* Mobile Menu Links */}
            {/* If desktopOnly is true, hide this. If mobileOnly is true or undefined, show this (responsive logic inside className) */}
            {!desktopOnly && (
                <div className={`${mobileOnly ? 'flex' : 'flex md:hidden'} flex-col gap-6 px-1`}>
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="flex items-center justify-between group"
                        >
                            <span className={`text-base font-medium ${isActive(item.href) ? "text-[#00cc55]" : "text-white"}`}>
                                {item.label}
                            </span>
                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}
