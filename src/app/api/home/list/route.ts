
import { NextResponse } from "next/server";
import { DramaBoxApi, Drama as DramaBoxDrama } from "@/lib/api/dramabox";
import { FlickReelsApi, FlickReelsDrama } from "@/lib/api/flickreels";
import { MeloloApi, MeloloDrama } from "@/lib/api/melolo";
import { DramaQueenApi, DramaQueenDrama } from "@/lib/api/dramaqueen";

export const dynamic = 'force-dynamic';

interface NormalizedItem {
    id: string;
    title: string;
    image: string;
    badge?: string;
    episodes?: string;
    provider: string;
    isVip?: boolean;
}

function normalizeDramaBox(item: DramaBoxDrama): NormalizedItem {
    return {
        id: item.bookId,
        title: item.bookName,
        image: item.coverWap || item.cover || "",
        episodes: item.chapterCount ? `${item.chapterCount} Eps` : undefined,
        provider: "dramabox",
    };
}

function normalizeFlickReels(item: FlickReelsDrama): NormalizedItem {
    return {
        id: String(item.playlet_id),
        title: item.playlet_title || item.title || "Untitled",
        image: item.cover || item.process_cover || "",
        episodes: item.chapter_num ? `${item.chapter_num} Eps` : undefined,
        provider: "flickreels",
    };
}

function normalizeMelolo(item: MeloloDrama): NormalizedItem {
    // Convert HEIC if needed (Melolo specific)
    const rawImage = item.thumb_url || item.cover_url || "";
    const image = rawImage && rawImage.includes(".heic")
        ? `https://wsrv.nl/?url=${encodeURIComponent(rawImage)}&output=webp&q=85`
        : rawImage;

    return {
        id: item.book_id,
        title: item.book_name,
        image,
        episodes: item.serial_count ? `${item.serial_count} Eps` : undefined,
        provider: "melolo",
    };
}

function normalizeDramaQueen(item: DramaQueenDrama): NormalizedItem {
    return {
        id: item.id,
        title: item.title,
        image: item.cover || "",
        episodes: item.episodes ? `${item.episodes} Eps` : undefined,
        provider: "dramaqueen",
        isVip: false, // DramaQueen is usually free/scraped
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "Semua";
    const page = parseInt(searchParams.get("page") || "1");
    // Should return [] if no more data, but we'll try to return something as long as we can

    let items: NormalizedItem[] = [];

    try {
        if (category === "Short Drama") {
            // Strategy: Rotate providers based on page
            // Page 1: DramaBox Trending
            // Page 2: FlickReels ForYou
            // Page 3: Melolo Trending
            // Page 4: DramaBox Latest
            // etc.
            const rotation = (page - 1) % 3;

            if (rotation === 0) {
                const data = page === 1 ? await DramaBoxApi.getTrending() : await DramaBoxApi.getLatest();
                items = data.map(normalizeDramaBox);
            } else if (rotation === 1) {
                const data = await FlickReelsApi.getForYou(); // FlickReels foryou is good for infinite
                items = data.map(normalizeFlickReels);
            } else {
                const data = page <= 3 ? await MeloloApi.getTrending() : await MeloloApi.getLatest();
                items = data.map(normalizeMelolo);
            }
        }
        else if (category === "Drama China") {
            // Fetch List from DramaQueen and filter by country 'China'
            // Since filtering reduces count, we might get fewer items.
            // We fetch a larger list or specific page.
            const data = await DramaQueenApi.getList(page, 40); // Fetch 40 to have buffer for filtering
            const filtered = data.filter(d =>
                d.country?.toLowerCase() === "china" ||
                d.country === "Tiongkok" ||  // Indonesian
                !d.country // Include undefined as fallback? No, simpler to be strict or loose.
            );
            items = filtered.map(normalizeDramaQueen);
        }
        else if (category === "Drama Korea") {
            const data = await DramaQueenApi.getList(page, 40);
            const filtered = data.filter(d =>
                d.country?.toLowerCase() === "south korea" ||
                d.country?.toLowerCase() === "korea" ||
                d.country === "Korea Selatan"
            );
            items = filtered.map(normalizeDramaQueen);
        }
        else if (category === "Anime") {
            const data = await DramaQueenApi.getDonghuaList(page);
            // Use provider "donghua" so watch page calls correct API endpoint
            items = data.map(item => ({
                id: item.id,
                title: item.title,
                image: item.cover || "",
                episodes: item.episodes ? `${item.episodes} Eps` : undefined,
                provider: "donghua", // Important: use "donghua" not "dramaqueen"
                isVip: false,
            }));
        }
        else {
            // "Semua" or unknown
            // Mix: Fetch trending from one random provider each page to keep it varied
            // or just strictly rotate like Short Drama but include DramaQueen
            const rotation = (page - 1) % 4;
            if (rotation === 0) {
                const data = await DramaBoxApi.getHome();
                items = data.map(normalizeDramaBox);
            } else if (rotation === 1) {
                const data = await FlickReelsApi.getForYou();
                items = data.map(normalizeFlickReels);
            } else if (rotation === 2) {
                const data = await DramaQueenApi.getPopular();
                items = data.map(normalizeDramaQueen);
            } else {
                const data = await MeloloApi.getTrending();
                items = data.map(normalizeMelolo);
            }
        }

        return NextResponse.json({
            success: true,
            data: items,
            page,
            hasMore: items.length > 0
        });

    } catch (error) {
        console.error("Home List API Error:", error);
        return NextResponse.json({ success: false, data: [], hasMore: false }, { status: 500 });
    }
}
