"use client";

import { useEffect, useRef } from "react";

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
}: TelegramLoginButtonProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Set up global callback
        window.TelegramLoginWidget = {
            dataOnauth: (user: TelegramUser) => {
                onAuth(user);
            },
        };

        // Create and inject script
        const script = document.createElement("script");
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.async = true;
        script.setAttribute("data-telegram-login", botName);
        script.setAttribute("data-size", buttonSize);
        script.setAttribute("data-radius", String(cornerRadius));
        script.setAttribute("data-userpic", String(showUserPhoto));
        script.setAttribute("data-onauth", "TelegramLoginWidget.dataOnauth(user)");
        script.setAttribute("data-request-access", "write");

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
    }, [botName, buttonSize, cornerRadius, showUserPhoto, onAuth]);

    return <div ref={containerRef} className="telegram-login-container" />;
}
