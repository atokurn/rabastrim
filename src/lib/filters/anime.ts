/**
 * Anime Filter Configuration
 */

import { FilterGroup } from "@/lib/explore/types";

export function getAnimeFilters(): FilterGroup[] {
    return [
        {
            key: "category",
            label: "Genre",
            type: "single",
            options: [
                { id: "action", name: "Action" },
                { id: "adventure", name: "Adventure" },
                { id: "comedy", name: "Comedy" },
                { id: "drama", name: "Drama" },
                { id: "fantasy", name: "Fantasy" },
                { id: "romance", name: "Romance" },
                { id: "isekai", name: "Isekai" },
                { id: "slice-of-life", name: "Slice of Life" },
            ],
        },
        {
            key: "status",
            label: "Status",
            type: "single",
            options: [
                { id: "ongoing", name: "Ongoing" },
                { id: "completed", name: "Completed" },
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
                { id: "2022", name: "2022" },
            ],
        },
    ];
}
