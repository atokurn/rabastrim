"use client";

import { useState } from "react";
import { Lock, Crown, Coins, X } from "lucide-react";
import Link from "next/link";

interface VipGateProps {
    contentId: string;
    episodeNumber: number;
    creditCost: number;
    creditBalance: number;
    onUnlock?: () => void;
    onClose?: () => void;
}

export function VipGate({
    contentId,
    episodeNumber,
    creditCost,
    creditBalance,
    onUnlock,
    onClose,
}: VipGateProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canAfford = creditBalance >= creditCost;

    async function handleUnlock() {
        if (!canAfford) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/credits/use", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contentId, episodeNumber }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                onUnlock?.();
            } else {
                setError(data.error || "Gagal membuka episode");
            }
        } catch (err) {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative bg-[#1a1d21] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                {/* Close button */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Lock icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-amber-400" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-white text-center mb-2">
                    Episode Premium
                </h2>
                <p className="text-gray-400 text-center mb-6">
                    Episode {episodeNumber} memerlukan langganan VIP atau credit untuk ditonton
                </p>

                {/* Options */}
                <div className="space-y-3">
                    {/* Subscribe option */}
                    <Link href="/vip">
                        <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 rounded-xl hover:border-amber-500/60 transition-colors">
                            <div className="flex items-center gap-3">
                                <Crown className="w-6 h-6 text-amber-400" />
                                <div className="text-left">
                                    <div className="font-semibold text-white">Langganan VIP</div>
                                    <div className="text-sm text-gray-400">Akses semua episode</div>
                                </div>
                            </div>
                            <span className="text-amber-400 font-semibold">Rp2.000</span>
                        </button>
                    </Link>

                    {/* Credit option */}
                    <button
                        onClick={handleUnlock}
                        disabled={!canAfford || loading}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${canAfford
                            ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 hover:border-yellow-500/60"
                            : "bg-gray-800/50 border border-gray-700 opacity-60"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Coins className="w-6 h-6 text-yellow-400" />
                            <div className="text-left">
                                <div className="font-semibold text-white">
                                    {loading ? "Membuka..." : "Gunakan Credit"}
                                </div>
                                <div className="text-sm text-gray-400">
                                    Saldo: {creditBalance} credit
                                </div>
                            </div>
                        </div>
                        <span className={`font-semibold ${canAfford ? "text-yellow-400" : "text-gray-500"}`}>
                            {creditCost} credit
                        </span>
                    </button>

                    {!canAfford && (
                        <Link href="/topup">
                            <button className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-xl font-semibold hover:opacity-90 transition-opacity">
                                Top Up Credit
                            </button>
                        </Link>
                    )}
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-red-400 text-sm text-center mt-4">{error}</p>
                )}
            </div>
        </div>
    );
}
