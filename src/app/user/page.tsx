"use client";

import { GuestWarning } from "@/components/user/GuestWarning";
import { RecentHistory } from "@/components/user/RecentHistory";
import { UserHeader } from "@/components/user/UserHeader";
import { useUserStore } from "@/lib/auth/store";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";



export default function UserPage() {
    const { initGuest } = useUserStore();

    // Initialize guest if not logged in
    useEffect(() => {
        initGuest();
    }, [initGuest]);

    // Note: Sync is handled globally by UserSyncProvider in layout.tsx

    const menuItems = [
        { label: "Unduhan Saya", href: "/downloads" },
        { label: "Bahasa", href: "/settings/language" },
        { label: "Akun & Pengaturan", href: "/settings" },
        { label: "Bantuan & Umpan Balik", href: "/support" },
    ];

    return (
        <div className="min-h-screen bg-[#121418] pb-24 md:pt-16">
            <div className="hidden md:block border-b border-gray-800 bg-[#1f2126]">
                <UserHeader />
            </div>

            <div className="md:hidden">
                <UserHeader />
            </div>

            <main className="container mx-auto px-4 py-6">
                <GuestWarning />

                <div className="mt-6 md:grid md:grid-cols-[280px_1fr] md:gap-8 md:items-start">
                    {/* Desktop Sidebar / Menu */}
                    <div className="hidden md:flex flex-col gap-2 bg-[#1f2126] p-4 rounded-xl sticky top-24 h-fit">
                        <h3 className="text-gray-500 text-sm font-semibold mb-2 px-2 uppercase tracking-wider">Menu</h3>
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors group"
                            >
                                <span className="text-gray-200 group-hover:text-white font-medium">{item.label}</span>
                                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                            </Link>
                        ))}
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* Recent History Section */}
                        <RecentHistory />

                        {/* Mobile Menu Links (Visible only on mobile) */}
                        <div className="flex flex-col gap-6 px-1 md:hidden">
                            {menuItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className="flex items-center justify-between group"
                                >
                                    <span className="text-white text-base font-medium">{item.label}</span>
                                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
