"use client";

import { useUserStore } from "@/lib/auth/store";
import { User, LogOut, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { TelegramLoginButton } from "@/components/auth/TelegramLoginButton";

export function UserHeader() {
    const { user: clerkUser, isSignedIn, isLoaded } = useUser();
    const { user, syncWithClerkUser, loginWithTelegram, initGuest, logout, history, favorites } = useUserStore();
    const [showTelegramLogin, setShowTelegramLogin] = useState(false);
    const [isLoadingTelegram, setIsLoadingTelegram] = useState(false);

    // Get bot name from env (should be just the username, not the token)
    const telegramBotName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "RabastrimBot";

    // Sync Clerk user with Zustand store
    useEffect(() => {
        if (isLoaded) {
            if (isSignedIn && clerkUser) {
                syncWithClerkUser({
                    id: clerkUser.id,
                    firstName: clerkUser.firstName,
                    lastName: clerkUser.lastName,
                    imageUrl: clerkUser.imageUrl,
                });
            } else if (!user || user.type === 'guest') {
                initGuest();
            }
        }
    }, [isLoaded, isSignedIn, clerkUser, syncWithClerkUser, initGuest, user]);

    // Handle Telegram login callback
    const handleTelegramAuth = async (telegramUser: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        photo_url?: string;
        auth_date: number;
        hash: string;
    }) => {
        setIsLoadingTelegram(true);
        try {
            const response = await fetch('/api/auth/telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(telegramUser),
            });

            if (response.ok) {
                const data = await response.json();
                loginWithTelegram({
                    id: data.user.id,
                    name: data.user.name,
                    avatar: data.user.avatar,
                    username: data.user.username,
                });
                setShowTelegramLogin(false);
            } else {
                console.error('Telegram auth failed');
            }
        } catch (error) {
            console.error('Telegram auth error:', error);
        } finally {
            setIsLoadingTelegram(false);
        }
    };

    // Check if user is logged in via any provider
    const isLoggedIn = isSignedIn || (user && user.type !== 'guest');

    const displayUser = isSignedIn && clerkUser
        ? {
            name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'User',
            avatar: clerkUser.imageUrl,
            id: clerkUser.id,
            type: 'google' as const
        }
        : user;

    return (
        <div className="bg-[#1f2126] border-b border-gray-800">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-[#121418]">
                            {displayUser?.avatar ? (
                                <img src={displayUser.avatar} alt={displayUser.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10 text-gray-500" />
                            )}
                        </div>
                        {isLoggedIn ? (
                            <div className="absolute bottom-0 right-0 bg-[#00cc55] p-1.5 rounded-full border-4 border-[#121418]">
                                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                            </div>
                        ) : (
                            <div className="absolute bottom-0 right-0 bg-gray-500 p-1.5 rounded-full border-4 border-[#121418]">
                                <div className="w-3 h-3 bg-white rounded-full" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl font-bold text-white mb-1">
                            {isLoggedIn ? displayUser?.name : 'Pengunjung Tamu'}
                        </h1>
                        <p className="text-gray-400 text-sm mb-4">
                            ID: <span className="font-mono text-gray-500">{displayUser?.id?.substring(0, 16) || 'Generating...'}</span>
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            {!isLoggedIn ? (
                                <>
                                    {/* Google Login via Clerk */}
                                    <SignInButton mode="modal">
                                        <button className="px-4 py-2 bg-white text-gray-800 font-bold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            Google
                                        </button>
                                    </SignInButton>

                                    {/* Telegram Login - Redirect Mode */}
                                    {showTelegramLogin ? (
                                        <div className="flex items-center gap-2">
                                            <TelegramLoginButton
                                                botName={telegramBotName}
                                                onAuth={handleTelegramAuth}
                                                buttonSize="medium"
                                                useRedirect={true}
                                                redirectUrl={typeof window !== 'undefined' ? `${window.location.origin}/auth/telegram` : '/auth/telegram'}
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowTelegramLogin(true)}
                                            className="px-4 py-2 bg-[#0088cc] text-white font-bold rounded-lg hover:bg-[#0077b5] transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                            </svg>
                                            Telegram
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button className="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                                        <Settings className="w-4 h-4" />
                                        Pengaturan
                                    </button>
                                    {isSignedIn ? (
                                        <SignOutButton>
                                            <button className="px-4 py-2 bg-red-500/10 text-red-400 font-medium rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2">
                                                <LogOut className="w-4 h-4" />
                                                Keluar
                                            </button>
                                        </SignOutButton>
                                    ) : (
                                        <button
                                            onClick={() => { logout(); initGuest(); }}
                                            className="px-4 py-2 bg-red-500/10 text-red-400 font-medium rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Keluar
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 border-t md:border-t-0 md:border-l border-gray-800 pt-6 md:pt-0 md:pl-8 mt-4 md:mt-0">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{history.length}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Ditonton</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">{favorites.length}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider">Favorit</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
