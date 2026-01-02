"use client";

import { useEffect, useRef, useCallback } from "react";

interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

interface TelegramLoginButtonProps {
    botName: string;
    onAuth: (user: TelegramUser) => void;
    buttonSize?: "large" | "medium" | "small";
    cornerRadius?: number;
    showUserPhoto?: boolean;
    requestAccess?: "write";
    useRedirect?: boolean; // Use redirect mode instead of popup
    redirectUrl?: string;
}

declare global {
    interface Window {
        TelegramLoginWidget?: {
            dataOnauth: (user: TelegramUser) => void;
        };
    }
}

export function TelegramLoginButton({
    botName,
    onAuth,
    buttonSize = "large",
    cornerRadius = 8,
    showUserPhoto = true,
    useRedirect = false,
    redirectUrl,
}: TelegramLoginButtonProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const onAuthRef = useRef(onAuth);
    onAuthRef.current = onAuth;

    // Stable callback wrapped in useCallback
    const handleAuth = useCallback((user: TelegramUser) => {
        onAuthRef.current(user);
    }, []);

    useEffect(() => {
        // Set up global callback
        window.TelegramLoginWidget = {
            dataOnauth: handleAuth,
        };

        // Create and inject script
        const script = document.createElement("script");
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.async = true;
        script.setAttribute("data-telegram-login", botName);
        script.setAttribute("data-size", buttonSize);
        script.setAttribute("data-radius", String(cornerRadius));
        script.setAttribute("data-userpic", String(showUserPhoto));
        script.setAttribute("data-request-access", "write");

        if (useRedirect && redirectUrl) {
            // Redirect mode: Telegram redirects back to your URL with auth data in query params
            script.setAttribute("data-auth-url", redirectUrl);
        } else {
            // Callback mode: Uses popup
            script.setAttribute("data-onauth", "TelegramLoginWidget.dataOnauth(user)");
        }

        if (containerRef.current) {
            containerRef.current.innerHTML = "";
            containerRef.current.appendChild(script);
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
            delete window.TelegramLoginWidget;
        };
    }, [botName, buttonSize, cornerRadius, showUserPhoto, handleAuth, useRedirect, redirectUrl]);

    return <div ref={containerRef} className="telegram-login-container" />;
}

// Helper to parse Telegram auth data from URL query params (for redirect mode)
export function parseTelegramAuthFromUrl(): TelegramUser | null {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);

    const id = params.get('id');
    const firstName = params.get('first_name');
    const authDate = params.get('auth_date');
    const hash = params.get('hash');

    if (!id || !firstName || !authDate || !hash) return null;

    return {
        id: parseInt(id),
        first_name: firstName,
        last_name: params.get('last_name') || undefined,
        username: params.get('username') || undefined,
        photo_url: params.get('photo_url') || undefined,
        auth_date: parseInt(authDate),
        hash: hash,
    };
}
