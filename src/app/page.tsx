import { Hero } from "@/components/ui/Hero";
import { Section } from "@/components/ui/Section";
import { DramaBoxApi } from "@/lib/api/dramabox";
import { HeroService } from "@/lib/services/hero";
import { HomeFeed } from "@/components/home/HomeFeed";

// Use Hero types
import { HeroItem } from "@/lib/services/hero/types";

// Fetcher for Hero (client-side fallback handled in component) and Popular/Trending for server side
async function getHeroContent(): Promise<HeroItem[]> {
  // We can fetch from API or imported service if available. 
  // Since Hero component handles SWR, we can just pass partial initial data or let it fetch.
  // For now let's try to fetch from API URL if possible, or just return empty to let client fetch.
  // Actually existing code imported HeroService. 
  // Let's standard usage.
  try {
    const res = await fetch("http://localhost:3000/api/home/hero", { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
  } catch (e) { }
  return [];
}

interface SectionItem {
  id: string;
  title: string;
  image: string;
  badge?: string;
  provider?: string;
  progress?: number;
  episodes?: string;
}

export default async function Home() {
  // 1. Fetch Hero Data (optional, Hero component fetches itself too but refined SSR is better)
  // 2. Fetch "Rekomendasi Populer" (Trending from DramaBox as a good default)
  const popularData = await DramaBoxApi.getTrending().catch(() => []);

  const popularItems: SectionItem[] = popularData.slice(0, 10).map((d, i) => ({
    id: d.bookId,
    title: d.bookName,
    image: d.coverWap || d.cover || "",
    badge: i < 3 ? `TOP ${i + 1}` : undefined,
    provider: "dramabox",
    episodes: d.chapterCount ? `${d.chapterCount} Eps` : undefined,
  }));

  return (
    <div className="pb-20 bg-[#121418]">
      {/* 1. Hero Banner */}
      <Hero />

      <div className="relative z-10 space-y-6 -mt-20">
        {/* 2. Rekomendasi Populer */}
        {popularItems.length > 0 && (
          <div className="pt-10"> {/* Add padding to separate from hero gradient if needed, or rely on z-index */}
            <Section
              title="Rekomendasi populer"
              items={popularItems}
              variant="portrait"
            />
          </div>
        )}

        {/* 3. Category Tabs & 4. Filtered Grid (Infinite Scroll) */}
        <HomeFeed />
      </div>
    </div>
  );
}

