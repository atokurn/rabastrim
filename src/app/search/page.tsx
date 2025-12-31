import { SearchClient } from "@/components/search";

export default async function SearchPage() {
    // Pre-fetch popular items on server for faster initial load
    let initialPopular = [];

    try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/search/popular`, {
            next: { revalidate: 60 },
        });
        if (res.ok) {
            const data = await res.json();
            initialPopular = data.popular || [];
        }
    } catch (error) {
        console.error("Failed to fetch initial popular:", error);
        // Will fetch on client side as fallback
    }

    return <SearchClient initialPopular={initialPopular} />;
}
