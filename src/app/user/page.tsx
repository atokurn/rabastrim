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

    useEffect(() => {
        initGuest();
    }, [initGuest]);

    const menuItems = [
        { label: "Unduhan Saya", href: "/downloads" },
        { label: "Bahasa", href: "/settings/language" },
        { label: "Akun & Pengaturan", href: "/settings" },
        { label: "Bantuan & Umpan Balik", href: "/support" },
    ];

    return (
        <div className="min-h-screen bg-[#121418] pb-24">
            <div className="hidden md:block">
                <UserHeader />
            </div>
            {/* Mobile UserHeader needs to be rendered too. 
                UserHeader is the profile info card. We want that.
                So keep UserHeader, just control its layout if necessary. 
            */}
            <div className="md:hidden">
                <UserHeader />
            </div>

            <main className="container mx-auto px-4 py-6">
                <GuestWarning />

                <div className="flex flex-col gap-8 mt-4">
                    {/* Recent History Section */}
                    <RecentHistory />

                    {/* Menu Links */}
                    <div className="flex flex-col gap-6 px-1">
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
            </main>
        </div>
    );
}
