"use client";

import { useUserStore } from "@/lib/auth/store";
import { useTranslation } from "@/lib/i18n/use-translation";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

export function GuestWarning() {
    const { user } = useUserStore();
    const { t } = useTranslation();
    const [visible, setVisible] = useState(true);

    if (!visible || user?.type !== 'guest') return null;

    return (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-8 flex items-start gap-3 relative">
            <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div className="flex-1 pr-6">
                <h4 className="text-orange-400 font-medium text-sm mb-1">
                    {t("user.guest_title")}
                </h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                    {t("user.guest_description")}
                    <button className="text-orange-400 hover:text-orange-300 ml-1 underline">
                        {t("user.guest_login_prompt")}
                    </button>
                    .
                </p>
            </div>
            <button
                onClick={() => setVisible(false)}
                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
