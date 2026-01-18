import { Hero } from "@/components/home/Hero";
import { HomeRecommendations } from "@/components/home/HomeRecommendations";
import { DramaBoxApi } from "@/lib/api/dramabox";
import { HeroService } from "@/lib/services/hero";
import { HomeFeed } from "@/components/home/HomeFeed";

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
  // 1. Fetch Hero Data on server for SSR (prevents "FATED HEARTS" fallback)
  // 2. Fetch "Rekomendasi Populer" (Trending from DramaBox as a good default)
  const [heroData, popularData] = await Promise.all([
    HeroService.getHeroContent().catch(() => []),
    DramaBoxApi.getTrending().catch(() => []),
  ]);

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
      {/* 1. Hero Banner - pre-fetched on server */}
      <Hero initialData={heroData} />

      <div className="relative z-10 space-y-6 -mt-20">
        {/* 2. Rekomendasi Populer - uses client component for translated title */}
        <HomeRecommendations items={popularItems} />

        {/* 3. Category Tabs & 4. Filtered Grid (Infinite Scroll) */}
        <HomeFeed />
      </div>
    </div>
  );
}
