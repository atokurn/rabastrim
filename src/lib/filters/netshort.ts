/**
 * NetShort Filter Configuration
 */

import { FilterGroup } from "@/lib/explore/types";

export function getNetshortFilters(): FilterGroup[] {
    return [
        {
            key: "category",
            label: "Genre",
            type: "single",
            options: [
                { id: "romance", name: "Romance" },
                { id: "drama", name: "Drama" },
                { id: "comedy", name: "Comedy" },
                { id: "action", name: "Action" },
            ],
        },
        {
            key: "region",
            label: "Negara",
            type: "single",
            options: [
                { id: "id", name: "Indonesia" },
                { id: "cn", name: "China" },
                { id: "in", name: "India" },
            ],
        },
    ];
}
