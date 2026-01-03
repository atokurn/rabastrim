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

interface User {
    id: string;
    name: string;
    avatar?: string;
    type: 'guest' | 'google' | 'telegram';
}

interface UserState {
    user: User | null;
    history: WatchedItem[];
    favorites: FavoriteItem[];
    preferences: {
        autoplay: boolean;
        muted: boolean;
    };

    // Actions
    initGuest: () => void;
    login: (provider: 'google' | 'telegram', mockData?: Partial<User>) => void;
    logout: () => void;

    addToHistory: (item: Omit<WatchedItem, 'updatedAt'>) => void;
    addToFavorites: (item: Omit<FavoriteItem, 'id' | 'createdAt'>) => void;
    removeFromFavorites: (bookId: string, provider: string) => void;
    isFavorite: (bookId: string, provider: string) => boolean;

    clearHistory: () => void;
    updatePreferences: (prefs: Partial<UserState['preferences']>) => void;
    syncWithClerkUser: (clerkUser: { id: string; firstName?: string | null; lastName?: string | null; imageUrl?: string }) => void;
    loginWithTelegram: (telegramUser: { id: string; name: string; avatar?: string; username?: string }) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            history: [],
            favorites: [],
            preferences: {
                autoplay: true,
                muted: false,
            },

            initGuest: () => {
                const { user } = get();
                if (!user) {
                    set({
                        user: {
                            id: `guest_${uuidv4().substring(0, 8)}`,
                            name: 'Guest',
                            type: 'guest',
                        }
                    });
                }
            },

            login: (provider, mockData) => {
                // In a real app, this would handle the auth response
                // For now, it upgrades the guest user or replaces it
                const newUser: User = {
                    id: mockData?.id || `user_${uuidv4().substring(0, 8)}`,
                    name: mockData?.name || (provider === 'google' ? 'Google User' : 'Telegram User'),
                    avatar: mockData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
                    type: provider,
                };

                set({ user: newUser });
            },

            logout: () => {
                set({
                    user: null,
                    // Optional: decide if we clear history/favorites on logout or keep them
                    // For this mock implementation, we'll reset to a clean guest state
                    // history: [], 
                    // favorites: []
                });
                // Re-init guest strictly speaking isn't automatic, but for UX flow:
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
                    // Remove existing entry for same ID to bring to top
                    const filtered = state.history.filter((h) => h.id !== id);
                    return { history: [newItem, ...filtered] };
                });
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
            },

            removeFromFavorites: (bookId, provider) => {
                const id = `${provider}-${bookId}`;
                set((state) => ({
                    favorites: state.favorites.filter((f) => f.id !== id)
                }));
            },

            isFavorite: (bookId, provider) => {
                const id = `${provider}-${bookId}`;
                return get().favorites.some(f => f.id === id);
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
                    }
                });
            },
        }),
        {
            name: 'user-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage),
        }
    )
);
