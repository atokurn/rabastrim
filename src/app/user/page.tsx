"use client";

import { FavoritesList } from "@/components/user/FavoritesList";
import { GuestWarning } from "@/components/user/GuestWarning";
import { HistoryList } from "@/components/user/HistoryList";
import { UserHeader } from "@/components/user/UserHeader";
import { useUserStore } from "@/lib/auth/store";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar"; // Assuming Navbar exists

export default function UserPage() {
    const { initGuest } = useUserStore();

    useEffect(() => {
        initGuest();
    }, [initGuest]);

    return (
        <div className="min-h-screen bg-[#121418] pb-20">
            {/* We might need a Navbar here if not provided by layout */}
            {/* Assuming global layout handles Navbar, but if this page needs specific one: */}
            {/* <Navbar /> */}

            <UserHeader />

            <main className="container mx-auto px-4 py-8">
                <GuestWarning />

                <div className="flex flex-col gap-12">
                    <HistoryList />
                    <FavoritesList />
                </div>
            </main>
        </div>
    );
}
