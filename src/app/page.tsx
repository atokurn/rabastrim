import { Hero } from "@/components/ui/Hero";
import { Section } from "@/components/ui/Section";
import { DramaBoxApi } from "@/lib/api/dramabox";
import { FlickReelsApi } from "@/lib/api/flickreels";
import { SansekaiApi } from "@/lib/api/sansekai";
import { MeloloApi } from "@/lib/api/melolo";
import { getWatchHistory } from "@/lib/actions/history";
import { HeroService } from "@/lib/services/hero";

// Transform API data to Section item format
interface SectionItem {
  id: string;
  title: string;
  image: string;
  badge?: string;
  isVip?: boolean;
  episodes?: string;
  progress?: number;
  provider?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformDramaBox(drama: any, index?: number): SectionItem {
  return {
    id: drama.bookId || drama.book_id || String(index),
    title: drama.bookName || drama.book_name || drama.title || "Untitled",
    image: drama.coverWap || drama.cover || "",
    badge: index !== undefined && index < 10 ? `TOP ${index + 1}` : undefined,
    episodes: drama.chapterCount ? `${drama.chapterCount} Eps` : undefined,
    provider: "dramabox",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformFlickReels(drama: any, index?: number): SectionItem {
  return {
    id: drama.playlet_id || String(index),
    title: drama.playlet_title || "Untitled",
    image: drama.cover || drama.process_cover || "",
    badge: index !== undefined && index < 10 ? `TOP ${index + 1}` : undefined,
    episodes: drama.chapter_num ? `${drama.chapter_num} Eps` : undefined,
    provider: "flickreels",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformNetShort(drama: any): SectionItem {
  return {
    id: drama.shortPlayId || drama.id || "",
    title: drama.shortPlayName || drama.title || "Untitled",
    image: drama.shortPlayCover || drama.coverUrl || drama.cover || "",
    provider: "netshort",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformMelolo(drama: any, index?: number): SectionItem {
  // Melolo images are in .heic format which Chrome doesn't support
  // Use wsrv.nl image proxy to convert to WebP
  const rawImage = drama.thumb_url || drama.cover || "";
  const image = rawImage && rawImage.includes(".heic")
    ? `https://wsrv.nl/?url=${encodeURIComponent(rawImage)}&output=webp&q=85`
    : rawImage;

  return {
    id: drama.book_id || drama.id || String(index),
    title: drama.book_name || drama.title || "Untitled",
    image,
    badge: index !== undefined && index < 10 ? `TOP ${index + 1}` : undefined,
    provider: "melolo",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformAnime(drama: any): SectionItem {
  return {
    id: drama.url || drama.id || "",
    title: drama.judul || drama.title || "Untitled",
    image: drama.cover || "",
    provider: "anime",
  };
}

export default async function Home() {
  // Fetch data from all providers in parallel
  const [
    heroData,
    dramaboxTrending,
    flickreelsForYou,
    netshortTheaters,
    meloloTrending,
    animeLatest,
    history,
  ] = await Promise.all([
    HeroService.getHeroContent().catch(() => []),
    DramaBoxApi.getTrending().catch(() => []),
    FlickReelsApi.getForYou().catch(() => []),
    SansekaiApi.netshort.getTheaters().catch(() => []),
    MeloloApi.getTrending().catch(() => []),
    SansekaiApi.anime.getLatest().catch(() => []),
    getWatchHistory(10).catch(() => []),
  ]);

  // Transform data
  const dramaboxItems = dramaboxTrending.slice(0, 12).map((d, i) => transformDramaBox(d, i));
  const flickreelsItems = flickreelsForYou.slice(0, 12).map((d, i) => transformFlickReels(d, i));
  const netshortItems = netshortTheaters.slice(0, 12).map(d => transformNetShort(d));
  const meloloItems = meloloTrending.slice(0, 12).map((d, i) => transformMelolo(d, i));
  const animeItems = animeLatest.slice(0, 12).map(d => transformAnime(d));

  // Transform watch history from database
  const continueWatching: SectionItem[] = history.map(item => ({
    id: item.dramaId,
    title: item.dramaTitle || "Untitled",
    image: item.dramaCover || "",
    progress: item.progress || 0,
    episodes: item.episodeNumber ? `Ep ${item.episodeNumber}` : undefined,
  }));

  return (
    <div className="pb-20">
      <Hero initialData={heroData} />

      <div className="relative z-10 -mt-20 space-y-2">
        {continueWatching.length > 0 && (
          <Section
            title="Lanjut Tonton"
            variant="landscape"
            items={continueWatching}
          />
        )}

        {flickreelsItems.length > 0 && (
          <Section
            title="FlickReels - For You"
            items={flickreelsItems}
          />
        )}

        {dramaboxItems.length > 0 && (
          <Section
            title="DramaBox - Trending"
            items={dramaboxItems}
          />
        )}

        {netshortItems.length > 0 && (
          <Section
            title="NetShort - Drama Viral"
            items={netshortItems}
          />
        )}

        {meloloItems.length > 0 && (
          <Section
            title="Melolo - Trending"
            items={meloloItems}
          />
        )}

        {animeItems.length > 0 && (
          <Section
            title="Anime - Terbaru"
            items={animeItems}
          />
        )}
      </div>
    </div>
  );
}

