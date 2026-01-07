export type HeroProvider = 'dramabox' | 'flickreels' | 'melolo' | 'netshort';

export interface HeroItem {
    id: string;
    title: string;
    cover: string;       // Poster/Cover image
    backdrop?: string;   // Widescreen image (if available)
    provider: HeroProvider;
    score?: number;      // 0-10
    tags?: string[];
    description?: string;
    episodeCount?: string;
    year?: number;
    isVip?: boolean;
}

export interface HeroFetchOptions {
    limit?: number;
}
