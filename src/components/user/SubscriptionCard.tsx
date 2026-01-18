"use client";

import { useEffect, useState } from "react";
import { Crown, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

interface SubscriptionData {
    active: boolean;
    subscription: {
        id: string;
        plan: string;
        planSlug: string;
        status: string;
        startDate: string;
        endDate: string;
        daysRemaining: number;
    } | null;
}

export function SubscriptionCard() {
    const [data, setData] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSubscription() {
            try {
                const res = await fetch("/api/vip");
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to fetch subscription:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSubscription();
    }, []);

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-[#1f2126] to-[#2a2d35] rounded-xl p-4 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-700 rounded w-1/2" />
            </div>
        );
    }

    if (!data || !data.active) {
        return (
            <Link href="/vip">
                <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-amber-500/30 rounded-xl p-4 group hover:border-amber-500/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <Crown className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Upgrade ke VIP</h3>
                                <p className="text-sm text-gray-400">Akses semua konten premium</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                </div>
            </Link>
        );
    }

    const { subscription } = data;

    return (
        <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-black" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-amber-400">VIP Member</h3>
                        <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full font-medium">
                            {subscription?.plan}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{subscription?.daysRemaining} hari tersisa</span>
                    </div>
                </div>
            </div>
            <Link href="/vip">
                <button className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm font-medium transition-colors">
                    Perpanjang Langganan
                </button>
            </Link>
        </div>
    );
}
