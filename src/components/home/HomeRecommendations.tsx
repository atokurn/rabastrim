"use client";

import { Section } from "@/components/shared/Section";
import { useTranslation } from "@/lib/i18n/use-translation";

interface SectionItem {
    id: string;
    title: string;
    image: string;
    badge?: string;
    provider?: string;
    progress?: number;
    episodes?: string;
}

interface HomeRecommendationsProps {
    items: SectionItem[];
}

export function HomeRecommendations({ items }: HomeRecommendationsProps) {
    const { t } = useTranslation();

    if (items.length === 0) return null;

    return (
        <div className="pt-0">
            <Section
                title={t("sections.recommend")}
                items={items}
                variant="portrait"
            />
        </div>
    );
}
