"use client";

import { GuestWarning } from "@/components/user/GuestWarning";
import { RecentHistory } from "@/components/user/RecentHistory";
import { UserHeader } from "@/components/user/UserHeader";
import { UserMenu } from "@/components/user/UserMenu";
import { useUserStore } from "@/lib/auth/store";
import { useEffect } from "react";

export default function UserPage() {
    const { initGuest } = useUserStore();

    // Initialize guest if not logged in
    useEffect(() => {
        initGuest();
    }, [initGuest]);

    // Note: Sync is handled globally by UserSyncProvider in layout.tsx

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
                    <div className="hidden md:flex flex-col gap-2">
                        <UserMenu desktopOnly />
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* Recent History Section */}
                        <RecentHistory />

                        {/* Mobile Menu Links (Visible only on mobile) */}
                        <div className="md:hidden">
                            <UserMenu mobileOnly />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
