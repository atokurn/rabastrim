import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface WatchedItem {
    id: string; // "provider-bookId"
    bookId: string;
    title: string;
    cover: string;
    provider: string;
    updatedAt: number;
    progress?: number; // 0-100 percentage for UI
    episode?: number;
    lastPosition?: number; // seconds for resume
    duration?: number; // video duration in seconds
}

export interface FavoriteItem {
    id: string; // "provider-bookId"
    bookId: string;
    title: string;
    cover: string;
    provider: string;
    createdAt: number;
}

export interface LikeItem {
    id: string; // "provider-bookId-episode"
    bookId: string;
    episode: number;
    title: string;
    cover: string;
    provider: string;
    createdAt: number;
}

interface User {
    id: string;
    name: string;
    avatar?: string;
    type: 'guest' | 'google' | 'telegram';
    isGuest?: boolean;
}

interface UserState {
    user: User | null;
    history: WatchedItem[];
    favorites: FavoriteItem[];
    likes: LikeItem[];
    preferences: {
        autoplay: boolean;
        muted: boolean;
    };
    isSyncing: boolean;

    // Actions
    initGuest: () => void;
    login: (provider: 'google' | 'telegram', mockData?: Partial<User>) => void;
    logout: () => void;

    addToHistory: (item: Omit<WatchedItem, 'updatedAt'>) => void;
    addToFavorites: (item: Omit<FavoriteItem, 'id' | 'createdAt'>) => void;
    removeFromFavorites: (bookId: string, provider: string) => void;
    isFavorite: (bookId: string, provider: string) => boolean;

    addToLikes: (item: Omit<LikeItem, 'id' | 'createdAt'>) => void;
    removeFromLikes: (bookId: string, episode: number, provider: string) => void;
    isLiked: (bookId: string, episode: number, provider: string) => boolean;

    clearHistory: () => void;
    updatePreferences: (prefs: Partial<UserState['preferences']>) => void;
    syncWithClerkUser: (clerkUser: { id: string; firstName?: string | null; lastName?: string | null; imageUrl?: string }) => void;
    loginWithTelegram: (telegramUser: { id: string; name: string; avatar?: string; username?: string }) => void;

    // Server sync actions
    syncUserFromServer: () => Promise<void>;
    syncHistoryFromServer: () => Promise<void>;
    syncFavoritesFromServer: () => Promise<void>;
    syncLikesFromServer: () => Promise<void>;
    pushHistoryToServer: (item: WatchedItem) => Promise<void>;
    pushFavoriteToServer: (bookId: string, provider: string, title: string, cover: string, action: 'add' | 'remove') => Promise<void>;
    pushLikeToServer: (item: LikeItem) => Promise<void>;

    // Bulk sync: push all local data to server
    pushLocalHistoryToServer: () => Promise<{ inserted: number; updated: number; skipped: number }>;
}

// Cross-tab sync channel name
const SYNC_CHANNEL_NAME = "rabastrim_sync";

// Helper to broadcast updates to other tabs
const broadcastUpdate = (type: "history" | "favorites" | "likes") => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
    try {
        const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channel.postMessage({ type: "DATA_UPDATED", dataType: type, timestamp: Date.now() });
        channel.close();
    } catch (error) {
        // Silent fail - cross-tab sync is optional
    }
};

// Helper to push to server with retry
const pushToServer = async (url: string, data: Record<string, unknown>, retries = 2): Promise<Response | null> => {
    for (let i = 0; i <= retries; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (response.ok) return response;
        } catch (error) {
            console.warn(`[Store] Push attempt ${i + 1} failed:`, error);
            if (i === retries) return null;
            await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
        }
    }
    return null;
};

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            history: [],
            favorites: [],
            likes: [],
            preferences: {
                autoplay: true,
                muted: false,
            },
            isSyncing: false,

            initGuest: () => {
                const { user } = get();
                if (!user) {
                    set({
                        user: {
                            id: `guest_${uuidv4().substring(0, 8)}`,
                            name: 'Guest',
                            type: 'guest',
                            isGuest: true,
                        }
                    });
                }
            },

            login: (provider, mockData) => {
                const newUser: User = {
                    id: mockData?.id || `user_${uuidv4().substring(0, 8)}`,
                    name: mockData?.name || (provider === 'google' ? 'Google User' : 'Telegram User'),
                    avatar: mockData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
                    type: provider,
                    isGuest: false,
                };
                set({ user: newUser });
            },

            logout: () => {
                set({
                    user: null,
                });
                get().initGuest();
            },

            addToHistory: (item) => {
                const id = `${item.provider}-${item.bookId}`;
                const newItem: WatchedItem = {
                    ...item,
                    id,
                    updatedAt: Date.now(),
                };

                set((state) => {
                    const filtered = state.history.filter((h) => h.id !== id);
                    return { history: [newItem, ...filtered] };
                });

                // Push to server in background (PUSH mode)
                get().pushHistoryToServer(newItem);

                // Notify other tabs
                broadcastUpdate("history");
            },

            addToFavorites: (item) => {
                const id = `${item.provider}-${item.bookId}`;
                const newItem: FavoriteItem = {
                    ...item,
                    id,
                    createdAt: Date.now(),
                };

                set((state) => {
                    if (state.favorites.some(f => f.id === id)) return state;
                    return { favorites: [newItem, ...state.favorites] };
                });

                // Push to server
                get().pushFavoriteToServer(item.bookId, item.provider, item.title, item.cover, 'add');

                // Notify other tabs
                broadcastUpdate("favorites");
            },

            removeFromFavorites: (bookId, provider) => {
                const id = `${provider}-${bookId}`;
                set((state) => ({
                    favorites: state.favorites.filter((f) => f.id !== id)
                }));

                // Push to server
                get().pushFavoriteToServer(bookId, provider, '', '', 'remove');
            },

            isFavorite: (bookId, provider) => {
                const id = `${provider}-${bookId}`;
                return get().favorites.some(f => f.id === id);
            },

            addToLikes: (item) => {
                const id = `${item.provider}-${item.bookId}-${item.episode}`;
                const newItem: LikeItem = {
                    ...item,
                    id,
                    createdAt: Date.now(),
                };

                set((state) => {
                    if (state.likes.some(l => l.id === id)) return state;
                    return { likes: [newItem, ...state.likes] };
                });

                // Push to server
                get().pushLikeToServer(newItem);

                // Notify other tabs
                broadcastUpdate("likes");
            },

            removeFromLikes: (bookId, episode, provider) => {
                const id = `${provider}-${bookId}-${episode}`;
                set((state) => ({
                    likes: state.likes.filter((l) => l.id !== id)
                }));
            },

            isLiked: (bookId, episode, provider) => {
                const id = `${provider}-${bookId}-${episode}`;
                return get().likes.some(l => l.id === id);
            },

            clearHistory: () => set({ history: [] }),

            updatePreferences: (prefs) => set((state) => ({
                preferences: { ...state.preferences, ...prefs }
            })),

            syncWithClerkUser: (clerkUser) => {
                const { user } = get();
                if (user?.id !== clerkUser.id) {
                    set({
                        user: {
                            id: clerkUser.id,
                            name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'User',
                            avatar: clerkUser.imageUrl,
                            type: 'google',
                            isGuest: false,
                        }
                    });
                }
            },

            loginWithTelegram: (telegramUser) => {
                set({
                    user: {
                        id: telegramUser.id,
                        name: telegramUser.name,
                        avatar: telegramUser.avatar,
                        type: 'telegram',
                        isGuest: false,
                    }
                });
            },

            // Server sync: Pull user profile from server
            syncUserFromServer: async () => {
                try {
                    const response = await fetch('/api/user/me');
                    if (!response.ok) throw new Error('Failed to fetch user profile');

                    const data = await response.json();

                    // Update user in store with server-side ID if guest
                    if (data.isGuest) {
                        set({
                            user: {
                                id: data.id,
                                name: data.name || 'Guest',
                                avatar: data.avatar,
                                type: 'guest',
                                isGuest: true,
                            }
                        });
                    } else if (!data.isGuest && data.email) {
                        set({
                            user: {
                                id: data.id,
                                name: data.name || 'User',
                                avatar: data.avatar,
                                type: 'google',
                                isGuest: false,
                            }
                        });
                    }
                } catch (error) {
                    console.error('[Store] Failed to sync user profile:', error);
                }
            },

            // Server sync: Pull history from server
            syncHistoryFromServer: async () => {
                set({ isSyncing: true });
                try {
                    const response = await fetch('/api/history?limit=50');
                    if (!response.ok) throw new Error('Failed to fetch history');

                    const data = await response.json();
                    const serverHistory: WatchedItem[] = data.items.map((item: {
                        id: string;
                        title: string;
                        image: string;
                        provider: string;
                        watchedAt: string;
                        progress: number;
                        episodeNumber: number;
                        lastPosition: number;
                        duration: number;
                    }) => ({
                        id: `${item.provider}-${item.id}`,
                        bookId: item.id,
                        title: item.title,
                        cover: item.image,
                        provider: item.provider,
                        updatedAt: new Date(item.watchedAt).getTime(),
                        progress: item.progress,
                        episode: item.episodeNumber,
                        lastPosition: item.lastPosition,
                        duration: item.duration,
                    }));

                    // Merge: server data takes precedence for same items
                    set((state) => {
                        const localMap = new Map(state.history.map(h => [h.id, h]));
                        const merged = [...serverHistory];

                        // Add local items not in server
                        for (const local of state.history) {
                            if (!serverHistory.some(s => s.id === local.id)) {
                                merged.push(local);
                            }
                        }

                        // Sort by updatedAt DESC
                        merged.sort((a, b) => b.updatedAt - a.updatedAt);

                        return { history: merged };
                    });
                } catch (error) {
                    console.error('[Store] Failed to sync history:', error);
                } finally {
                    set({ isSyncing: false });
                }
            },

            // Server sync: Pull favorites from server
            syncFavoritesFromServer: async () => {
                set({ isSyncing: true });
                try {
                    const response = await fetch('/api/favorites?limit=50');
                    if (!response.ok) throw new Error('Failed to fetch favorites');

                    const data = await response.json();
                    const serverFavorites: FavoriteItem[] = data.items.map((item: {
                        id: string;
                        title: string;
                        image: string;
                        provider: string;
                        createdAt: string;
                    }) => ({
                        id: `${item.provider}-${item.id}`,
                        bookId: item.id,
                        title: item.title,
                        cover: item.image,
                        provider: item.provider,
                        createdAt: new Date(item.createdAt).getTime(),
                    }));

                    // Replace with server data (server is source of truth after login)
                    set({ favorites: serverFavorites });
                } catch (error) {
                    console.error('[Store] Failed to sync favorites:', error);
                } finally {
                    set({ isSyncing: false });
                }
            },

            // Push history to server
            pushHistoryToServer: async (item) => {
                await pushToServer('/api/progress', {
                    dramaId: item.bookId,
                    dramaTitle: item.title,
                    dramaCover: item.cover,
                    provider: item.provider,
                    episodeNumber: item.episode,
                    position: item.lastPosition || 0,
                    duration: item.duration || 0,
                });
            },

            // Push favorite to server
            pushFavoriteToServer: async (bookId, provider, title, cover, action) => {
                await pushToServer('/api/favorites', {
                    dramaId: bookId,
                    dramaTitle: title,
                    dramaCover: cover,
                    provider,
                });
            },

            // Server sync: Pull likes from server
            syncLikesFromServer: async () => {
                set({ isSyncing: true });
                try {
                    const response = await fetch('/api/likes?limit=50');
                    if (!response.ok) throw new Error('Failed to fetch likes');

                    const data = await response.json();
                    const serverLikes: LikeItem[] = data.items.map((item: {
                        dramaId: string;
                        title: string;
                        image: string;
                        provider: string;
                        episodeNumber: number;
                        createdAt: string;
                    }) => ({
                        id: `${item.provider}-${item.dramaId}-${item.episodeNumber}`,
                        bookId: item.dramaId,
                        title: item.title,
                        cover: item.image,
                        provider: item.provider,
                        episode: item.episodeNumber,
                        createdAt: new Date(item.createdAt).getTime(),
                    }));

                    // Replace with server data
                    set({ likes: serverLikes });
                } catch (error) {
                    console.error('[Store] Failed to sync likes:', error);
                } finally {
                    set({ isSyncing: false });
                }
            },

            // Push like to server
            pushLikeToServer: async (item) => {
                await pushToServer('/api/likes', {
                    dramaId: item.bookId,
                    dramaTitle: item.title,
                    dramaCover: item.cover,
                    provider: item.provider,
                    episodeNumber: item.episode,
                });
            },

            // Bulk push all local history to server
            pushLocalHistoryToServer: async () => {
                const { history } = get();

                if (history.length === 0) {
                    return { inserted: 0, updated: 0, skipped: 0 };
                }

                console.log(`[Store] Pushing ${history.length} local history items to server...`);

                try {
                    const items = history.map(item => ({
                        dramaId: item.bookId,
                        dramaTitle: item.title,
                        dramaCover: item.cover,
                        provider: item.provider,
                        episodeNumber: item.episode,
                        lastPosition: item.lastPosition || 0,
                        duration: item.duration || 0,
                        progress: item.progress || 0,
                        updatedAt: item.updatedAt,
                    }));

                    const response = await fetch('/api/history/bulk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ items }),
                    });

                    if (!response.ok) {
                        throw new Error('Bulk sync failed');
                    }

                    const result = await response.json();
                    console.log(`[Store] Bulk sync complete:`, result);
                    return result;
                } catch (error) {
                    console.error('[Store] Bulk history sync failed:', error);
                    return { inserted: 0, updated: 0, skipped: 0 };
                }
            },
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
