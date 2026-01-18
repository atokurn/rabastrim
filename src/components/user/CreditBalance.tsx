"use client";

import { useEffect, useState } from "react";
import { Coins, Plus } from "lucide-react";
import Link from "next/link";

interface CreditData {
    balance: number;
    costPerEpisode: number;
}

interface CreditBalanceProps {
    compact?: boolean;
}

export function CreditBalance({ compact }: CreditBalanceProps) {
    const [data, setData] = useState<CreditData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCredits() {
            try {
                const res = await fetch("/api/credits");
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (error) {
                console.error("Failed to fetch credits:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCredits();
    }, []);

    if (loading) {
        if (compact) {
            return <div className="w-16 h-6 bg-gray-700 rounded animate-pulse" />;
        }
        return (
            <div className="bg-[#1f2126] rounded-xl p-4 animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-2" />
                <div className="h-8 bg-gray-700 rounded w-1/2" />
            </div>
        );
    }

    const balance = data?.balance ?? 0;

    if (compact) {
        return (
            <Link href="/topup">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full hover:from-yellow-500/30 hover:to-orange-500/30 transition-colors cursor-pointer">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-400">{balance}</span>
                </div>
            </Link>
        );
    }

    return (
        <div className="bg-gradient-to-r from-[#1f2126] to-[#252830] rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-gray-400 mb-1">Saldo Credit</div>
                    <div className="flex items-center gap-2">
                        <Coins className="w-6 h-6 text-yellow-400" />
                        <span className="text-2xl font-bold text-white">{balance}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        ≈ {Math.floor(balance / (data?.costPerEpisode ?? 10))} episode
                    </div>
                </div>
                <Link href="/topup">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-lg font-semibold hover:opacity-90 transition-opacity">
                        <Plus className="w-4 h-4" />
                        <span>Top Up</span>
                    </button>
                </Link>
            </div>
        </div>
    );
}
