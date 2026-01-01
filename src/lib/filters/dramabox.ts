/**
 * DramaBox Filter Configuration
 */

import { FilterGroup } from "@/lib/explore/types";

export function getDramaboxFilters(): FilterGroup[] {
    return [
        {
            key: "region",
            label: "Wilayah",
            type: "single",
            options: [
                { id: "cn", name: "China Daratan" },
                { id: "kr", name: "Korea Selatan" },
                { id: "th", name: "Thailand" },
                { id: "tw", name: "Taiwan" },
                { id: "jp", name: "Jepang" },
            ],
        },
        {
            key: "category",
            label: "Kategori",
            type: "single",
            options: [
                { id: "romance", name: "Romantis" },
                { id: "drama", name: "Drama" },
                { id: "comedy", name: "Komedi" },
                { id: "action", name: "Aksi" },
                { id: "historical", name: "Sejarah" },
                { id: "fantasy", name: "Fantasi" },
                { id: "thriller", name: "Thriller" },
            ],
        },
        {
            key: "status",
            label: "Status",
            type: "single",
            options: [
                { id: "vip", name: "VIP" },
                { id: "free", name: "Gratis" },
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
                { id: "2021", name: "2021" },
            ],
        },
    ];
}
