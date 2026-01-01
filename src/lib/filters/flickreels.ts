/**
 * FlickReels Filter Configuration
 */

import { FilterGroup } from "@/lib/explore/types";

export function getFlickreelsFilters(): FilterGroup[] {
    return [
        {
            key: "category",
            label: "Kategori",
            type: "single",
            options: [
                { id: "romance", name: "Romantis" },
                { id: "ceo", name: "CEO" },
                { id: "revenge", name: "Balas Dendam" },
                { id: "family", name: "Keluarga" },
                { id: "mystery", name: "Misteri" },
                { id: "fantasy", name: "Fantasi" },
            ],
        },
        {
            key: "status",
            label: "Status",
            type: "single",
            options: [
                { id: "completed", name: "Tamat" },
                { id: "ongoing", name: "Ongoing" },
            ],
        },
        {
            key: "year",
            label: "Tahun",
            type: "single",
            options: [
                { id: "2025", name: "2025" },
                { id: "2024", name: "2024" },
                { id: "2023", name: "2023" },
            ],
        },
    ];
}
