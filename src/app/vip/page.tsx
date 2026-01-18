"use client";

// Reading file first to understand styling

import { useEffect, useState } from "react";
import { ArrowLeft, HelpCircle, Check, Crown, Zap, Coins, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Plan {
    id: string;
    slug: string;
    name: string;
    price: number;
    priceFormatted: string;
    durationDays: number;
    bonusCredit: number;
}

export default function VipPage() {
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"subscription" | "coins">("subscription");
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        async function fetchPlans() {
            try {
                const res = await fetch("/api/vip/plans");
                if (res.ok) {
                    const data = await res.json();
                    setPlans(data.plans);
                }
            } catch (err) {
                console.error("Failed to fetch plans:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchPlans();
    }, []);


    const [payment, setPayment] = useState<{
        orderId: string;
        method: string;
        paymentNumber: string;
        totalPayment: number;
        expiredAt: string;
    } | null>(null);

    const [paymentStatus, setPaymentStatus] = useState<"pending" | "completed" | "expired">("pending");

    // Poll payment status when payment is active
    useEffect(() => {
        if (!payment || paymentStatus !== "pending") return;

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/vip/status?orderId=${payment.orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === "completed") {
                        setPaymentStatus("completed");
                        clearInterval(pollInterval);
                    }
                }

                // Check if expired
                if (new Date(payment.expiredAt) < new Date()) {
                    setPaymentStatus("expired");
                    clearInterval(pollInterval);
                }
            } catch (err) {
                console.error("Failed to check payment status:", err);
            }
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(pollInterval);
    }, [payment, paymentStatus]);

    async function handlePurchase(planSlug: string) {
        setPurchasing(true);
        setPaymentStatus("pending"); // Reset status
        try {
            const res = await fetch("/api/vip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planSlug, paymentMethod: "qris" }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setPayment(data.payment);
            } else {
                console.error(data.error || "Gagal membuat pesanan");
            }
        } catch (err) {
            console.error("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setPurchasing(false);
        }
    }

    // Sort plans to match design: 1 day, 7 day, 30 day, 90 day
    const sortedPlans = [...plans].sort((a, b) => a.price - b.price);
    const topPlan = sortedPlans.find(p => p.slug === "90_day");
    const otherPlans = sortedPlans.filter(p => p.slug !== "90_day");

    if (loading) {
        return (
            <div className="min-h-screen bg-[#181818] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#d4af72] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Payment Success View
    if (payment && paymentStatus === "completed") {
        return (
            <div className="min-h-screen bg-[#121418] text-white font-sans p-4">
                <div className="max-w-md mx-auto pt-10">
                    <div className="bg-[#1f2126] rounded-2xl p-6 text-center border border-green-500/30">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-green-500" />
                        </div>
                        <h1 className="text-xl font-bold mb-2 text-green-400">Pembayaran Berhasil!</h1>
                        <p className="text-gray-400 mb-6 text-sm">Order ID: {payment.orderId}</p>

                        <div className="bg-[#2a2d33] rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-300 mb-2">Langganan VIP kamu sudah aktif</p>
                            <p className="text-2xl font-bold text-[#d4af72]">
                                Rp{payment.totalPayment.toLocaleString("id-ID")}
                            </p>
                        </div>

                        <button
                            onClick={() => router.push("/")}
                            className="w-full py-3 bg-gradient-to-r from-[#d4af72] to-[#b39058] text-[#1a1d21] rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            Mulai Menonton
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Payment Expired View
    if (payment && paymentStatus === "expired") {
        return (
            <div className="min-h-screen bg-[#121418] text-white font-sans p-4">
                <div className="max-w-md mx-auto pt-10">
                    <div className="bg-[#1f2126] rounded-2xl p-6 text-center border border-red-500/30">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HelpCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <h1 className="text-xl font-bold mb-2 text-red-400">Pembayaran Kedaluwarsa</h1>
                        <p className="text-gray-400 mb-6 text-sm">Order ID: {payment.orderId}</p>

                        <p className="text-sm text-gray-400 mb-6">
                            Waktu pembayaran telah habis. Silakan buat pesanan baru.
                        </p>

                        <button
                            onClick={() => {
                                setPayment(null);
                                setPaymentStatus("pending");
                            }}
                            className="w-full py-3 bg-[#333] hover:bg-[#444] text-white rounded-xl font-semibold transition-colors"
                        >
                            Kembali ke Paket
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Payment QR View (pending)
    if (payment) {
        return (
            <div className="min-h-screen bg-[#121418] text-white font-sans p-4">
                <div className="max-w-md mx-auto pt-10">
                    <div className="bg-[#1f2126] rounded-2xl p-6 text-center border border-gray-800/50">
                        <Crown className="w-12 h-12 text-[#d4af72] mx-auto mb-4" />
                        <h1 className="text-xl font-bold mb-2">Scan QR untuk Bayar</h1>
                        <p className="text-gray-400 mb-6 text-sm">Order ID: {payment.orderId}</p>

                        <div className="bg-white p-4 rounded-xl mb-6 mx-auto max-w-[220px]">
                            <div className="aspect-square bg-gray-100 rounded flex items-center justify-center border-2 border-dashed border-gray-300">
                                <p className="text-xs text-gray-500 text-center break-all p-2 font-mono">
                                    {payment.paymentNumber.substring(0, 50)}...
                                </p>
                            </div>
                        </div>

                        <div className="text-2xl font-bold text-[#d4af72] mb-2">
                            Rp{payment.totalPayment.toLocaleString("id-ID")}
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            Berlaku sampai {new Date(payment.expiredAt).toLocaleString("id-ID")}
                        </p>

                        {/* Polling indicator */}
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-6">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Menunggu pembayaran...
                        </div>

                        <button
                            onClick={() => {
                                setPayment(null);
                                setPaymentStatus("pending");
                            }}
                            className="w-full py-3 bg-[#333] hover:bg-[#444] text-white rounded-xl font-semibold transition-colors"
                        >
                            Kembali
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#121418] text-white font-sans">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#121418]/95 backdrop-blur-sm border-b border-gray-800">
                <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-300" />
                    </button>
                    <h1 className="text-lg font-bold">Premium Shop</h1>
                    <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <HelpCircle className="w-6 h-6 text-gray-300" />
                    </button>
                </div>
            </div>

            <div className="max-w-md md:max-w-6xl mx-auto p-4 md:p-8 pb-20">
                {/* Tabs */}
                <div className="flex bg-[#1f2126] rounded-xl p-1 mb-8 md:max-w-md md:mx-auto">
                    <button
                        onClick={() => setActiveTab("subscription")}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "subscription"
                            ? "bg-[#d4af72] text-[#181818]"
                            : "text-gray-400 hover:text-gray-200"
                            }`}
                    >
                        Subscription
                    </button>
                    <button
                        onClick={() => setActiveTab("coins")}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === "coins"
                            ? "bg-[#d4af72] text-[#181818]"
                            : "text-gray-400 hover:text-gray-200"
                            }`}
                    >
                        Coins
                    </button>
                </div>

                {activeTab === "subscription" ? (
                    <>
                        {/* Title Section */}
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold mb-3">Upgrade to Premium</h2>
                            <p className="text-gray-400 text-base max-w-lg mx-auto">
                                Unlock exclusive features and bonus credits with our flexible plans.
                            </p>
                        </div>

                        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
                            {/* Standard Plans (Daily, Weekly, Monthly) */}
                            {otherPlans.map((plan) => (
                                <div key={plan.id} className="bg-[#1f2126] rounded-2xl p-6 border border-gray-800/50 hover:border-gray-700 transition-colors flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold">{plan.name}</h3>
                                            {plan.slug === "1_day" && <p className="text-gray-500 text-sm">Short term access</p>}
                                            {plan.bonusCredit > 0 && (
                                                <div className="flex items-center gap-1.5 text-[#fbbf24] text-sm font-bold mt-1">
                                                    <div className="w-4 h-4 rounded-full bg-[#fbbf24] flex items-center justify-center text-black text-[10px]">★</div>
                                                    +{plan.bonusCredit} Bonus Credits
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xl font-bold whitespace-nowrap">
                                            {plan.priceFormatted}
                                        </div>
                                    </div>

                                    <ul className="space-y-3 mb-6 flex-grow">
                                        <li className="flex items-center gap-2.5 text-sm text-gray-300">
                                            <div className="w-5 h-5 rounded-full bg-[#3e3428] flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3 h-3 text-[#d4af72]" />
                                            </div>
                                            Full access for {plan.durationDays} hours
                                        </li>
                                        {plan.bonusCredit > 0 && (
                                            <li className="flex items-center gap-2.5 text-sm text-gray-300">
                                                <div className="w-5 h-5 rounded-full bg-[#3e3428] flex items-center justify-center flex-shrink-0">
                                                    <Coins className="w-3 h-3 text-[#d4af72]" />
                                                </div>
                                                {plan.bonusCredit} Free Credits included
                                            </li>
                                        )}
                                        <li className="flex items-center gap-2.5 text-sm text-gray-300">
                                            <div className="w-5 h-5 rounded-full bg-[#3e3428] flex items-center justify-center flex-shrink-0">
                                                <Zap className="w-3 h-3 text-[#d4af72]" />
                                            </div>
                                            Hanya Rp{Math.round(plan.price / plan.durationDays).toLocaleString("id-ID")} / hari
                                        </li>
                                    </ul>

                                    <button
                                        onClick={() => handlePurchase(plan.slug)}
                                        disabled={purchasing}
                                        className="w-full py-3 bg-[#333] hover:bg-[#444] rounded-xl text-white font-semibold transition-colors text-sm mt-auto"
                                    >
                                        Choose {plan.slug === "1_day" ? "Daily" : plan.slug === "7_day" ? "Weekly" : "Monthly"}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Premium Plan (3 Months) - Highlighted */}
                        {topPlan && (
                            <div className="mt-8 md:mt-12 md:max-w-3xl md:mx-auto">
                                <div className="relative bg-[#1a1d21] rounded-2xl p-6 md:p-8 border border-[#d4af72]/50 shadow-[0_0_20px_rgba(212,175,114,0.1)]">
                                    <div className="absolute -top-3 right-5 bg-[#d4af72] text-[#1a1d21] text-xs font-bold px-3 py-1 rounded-full">
                                        Most Popular
                                    </div>

                                    <div className="md:flex md:justify-between md:items-center mb-6 mt-2">
                                        <div>
                                            <h3 className="text-2xl font-bold text-[#d4af72]">{topPlan.name}</h3>
                                            <div className="flex items-center gap-2 text-[#fbbf24] font-bold mt-2">
                                                <div className="w-5 h-5 rounded-full bg-[#fbbf24] flex items-center justify-center text-black text-xs">★</div>
                                                +{topPlan.bonusCredit} Bonus Credits
                                            </div>
                                        </div>
                                        <div className="text-3xl font-bold text-white mt-4 md:mt-0">
                                            Rp99k
                                        </div>
                                    </div>

                                    <div className="md:grid md:grid-cols-2 md:gap-x-8">
                                        <ul className="space-y-4 mb-8 md:mb-0">
                                            <li className="flex items-center gap-3 text-sm md:text-base text-gray-200">
                                                <div className="w-6 h-6 rounded-full bg-[#1e3a2f] flex items-center justify-center border border-[#166534] flex-shrink-0">
                                                    <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                                                </div>
                                                Best value for long term
                                            </li>
                                            <li className="flex items-center gap-3 text-sm md:text-base text-gray-200">
                                                <div className="w-6 h-6 rounded-full bg-[#1e3a2f] flex items-center justify-center border border-[#166534] flex-shrink-0">
                                                    <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                                                </div>
                                                Full access for {topPlan.durationDays} days
                                            </li>
                                        </ul>
                                        <ul className="space-y-4 mb-8">
                                            <li className="flex items-center gap-3 text-sm md:text-base text-gray-200">
                                                <div className="w-6 h-6 rounded-full bg-[#172e48] flex items-center justify-center border border-[#1e40af] flex-shrink-0">
                                                    <Crown className="w-3.5 h-3.5 text-[#3b82f6]" />
                                                </div>
                                                Hanya Rp{Math.round(topPlan.price / topPlan.durationDays).toLocaleString("id-ID")} / hari
                                            </li>
                                            <li className="flex items-center gap-3 text-sm md:text-base text-gray-200">
                                                <div className="w-6 h-6 rounded-full bg-[#3a2012] flex items-center justify-center border border-[#854d0e] flex-shrink-0">
                                                    <Zap className="w-3.5 h-3.5 text-[#eab308]" />
                                                </div>
                                                Massive {topPlan.bonusCredit} Free Credits
                                            </li>
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => handlePurchase(topPlan.slug)}
                                        disabled={purchasing}
                                        className="w-full py-4 bg-gradient-to-r from-[#d4af72] to-[#b39058] hover:opacity-90 rounded-xl text-[#1a1d21] font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#d4af72]/20 mt-6"
                                    >
                                        Get 3 Months Access
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="text-center mt-12 mb-4">
                            <p className="text-xs text-gray-500">
                                Subscriptions auto-renew. Cancel anytime in settings.
                                <br />
                                <Link href="/terms" className="text-gray-400 underline mt-1 inline-block">Terms & Conditions</Link>
                            </p>
                        </div>
                    </>
                ) : (
                    /* Coins Tab Content (Placeholder) */
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Coins className="w-16 h-16 mb-4 text-[#d4af72] opacity-50" />
                        <p>Coin packages coming soon</p>
                    </div>
                )}
            </div>
        </div>
    );
}
