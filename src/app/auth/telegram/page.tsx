"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/lib/auth/store";
import { Loader2 } from "lucide-react";

function TelegramCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { loginWithTelegram } = useUserStore();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const processAuth = async () => {
            // Extract Telegram auth data from URL params
            const id = searchParams.get('id');
            const firstName = searchParams.get('first_name');
            const authDate = searchParams.get('auth_date');
            const hash = searchParams.get('hash');

            if (!id || !firstName || !authDate || !hash) {
                setError("Data autentikasi tidak lengkap");
                setIsProcessing(false);
                return;
            }

            const telegramData = {
                id: parseInt(id),
                first_name: firstName,
                last_name: searchParams.get('last_name') || undefined,
                username: searchParams.get('username') || undefined,
                photo_url: searchParams.get('photo_url') || undefined,
                auth_date: parseInt(authDate),
                hash: hash,
            };

            try {
                // Verify with backend
                const response = await fetch('/api/auth/telegram', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(telegramData),
                });

                if (response.ok) {
                    const data = await response.json();
                    loginWithTelegram({
                        id: data.user.id,
                        name: data.user.name,
                        avatar: data.user.avatar,
                        username: data.user.username,
                    });

                    // Redirect to user page
                    router.push('/user');
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || "Autentikasi gagal");
                }
            } catch (err) {
                console.error("Telegram auth error:", err);
                setError("Terjadi kesalahan saat autentikasi");
            } finally {
                setIsProcessing(false);
            }
        };

        processAuth();
    }, [searchParams, loginWithTelegram, router]);

    if (isProcessing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#111319]">
                <Loader2 className="w-12 h-12 text-[#0088cc] animate-spin mb-4" />
                <p className="text-white text-lg">Memproses login Telegram...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#111319]">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md text-center">
                    <p className="text-red-400 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/user')}
                        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    return null;
}

export default function TelegramCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#111319]">
                <Loader2 className="w-12 h-12 text-[#0088cc] animate-spin mb-4" />
                <p className="text-white text-lg">Memuat...</p>
            </div>
        }>
            <TelegramCallbackContent />
        </Suspense>
    );
}
