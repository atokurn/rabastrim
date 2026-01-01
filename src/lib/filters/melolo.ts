/**
 * Melolo Filter Configuration
 */

import { FilterGroup } from "@/lib/explore/types";

export function getMeloloFilters(): FilterGroup[] {
    return [
        {
            key: "category",
            label: "Kategori",
            type: "single",
            options: [
                { id: "romance", name: "Romantis" },
                { id: "drama", name: "Drama" },
                { id: "comedy", name: "Komedi" },
                { id: "horror", name: "Horor" },
            ],
        },
        {
            key: "status",
            label: "Status",
            type: "single",
            options: [
                { id: "premium", name: "Premium" },
                { id: "free", name: "Gratis" },
            ],
        },
    ];
}
