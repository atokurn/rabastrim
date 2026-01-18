"use client";

import { useTranslation } from "@/lib/i18n/use-translation";
import { Share2, Download } from "lucide-react";

interface ActionButtonsProps {
    className?: string;
}

export function ShareButton({ className = '' }: ActionButtonsProps) {
    const { t } = useTranslation();

    return (
        <button className={`flex flex-col items-center gap-1 text-gray-400 hover:text-white ${className}`}>
            <Share2 className="w-5 h-5" />
            <span className="text-xs">{t('player.share')}</span>
        </button>
    );
}

export function DownloadButton({ className = '' }: ActionButtonsProps) {
    const { t } = useTranslation();

    return (
        <button className={`flex flex-col items-center gap-1 text-gray-400 hover:text-white ${className}`}>
            <Download className="w-5 h-5" />
            <span className="text-xs">{t('player.download')}</span>
        </button>
    );
}

interface TextLabelProps {
    textKey: string;
    className?: string;
}

export function TranslatedText({ textKey, className = '' }: TextLabelProps) {
    const { t } = useTranslation();
    return <span className={className}>{t(textKey)}</span>;
}

interface SectionTitleProps {
    titleKey: string;
    className?: string;
}

export function TranslatedTitle({ titleKey, className = '' }: SectionTitleProps) {
    const { t } = useTranslation();
    return <h3 className={className}>{t(titleKey)}</h3>;
}
