"use client";

import { useEffect, useRef, useCallback } from "react";
import { useUserStore } from "@/lib/auth/store";
import { useUser } from "@clerk/nextjs";

interface UseUserSyncOptions {
    /** Interval in ms for background sync (default: 30000 = 30s) */
    interval?: number;
    /** Sync when tab regains focus */
    onFocus?: boolean;
    /** Sync on Clerk login */
    onLogin?: boolean;
    /** Cross-tab sync via BroadcastChannel */
    crossTab?: boolean;
    /** Enable sync (can be disabled for certain pages) */
    enabled?: boolean;
}

const SYNC_CHANNEL_NAME = "rabastrim_sync";

/**
 * Advanced User Sync Hook
 * 
 * Implements 4-layer sync strategy:
 * 1. Optimistic UI (handled in store actions)
 * 2. Background Pull (interval-based)
 * 3. Cross-Tab Sync (BroadcastChannel)
 * 4. Focus/Login Sync
 */
export function useUserSync(options: UseUserSyncOptions = {}) {
    const {
        interval = 30000,
        onFocus = true,
        onLogin = true,
        crossTab = true,
        enabled = true,
    } = options;

    const { isSignedIn, user: clerkUser, isLoaded } = useUser();
    const {
        syncUserFromServer,
        syncHistoryFromServer,
        syncFavoritesFromServer,
        syncLikesFromServer,
        syncWithClerkUser,
        pushLocalHistoryToServer,
        isSyncing,
    } = useUserStore();

    const lastSyncRef = useRef<number>(0);
    const channelRef = useRef<BroadcastChannel | null>(null);
    const hasSyncedOnLoginRef = useRef<string | null>(null);
    const hasDoneBulkSyncRef = useRef(false);

    // Core sync function
    const doSync = useCallback(async (source: string = "manual") => {
        if (!enabled) return;

        const now = Date.now();
        // Debounce: don't sync more than once every 5 seconds
        if (now - lastSyncRef.current < 5000) {
            console.log(`[useUserSync] Skipped (debounce) - source: ${source}`);
            return;
        }

        lastSyncRef.current = now;
        console.log(`[useUserSync] Syncing... source: ${source}`);

        try {
            await syncUserFromServer();
            await Promise.all([
                syncHistoryFromServer(),
                syncFavoritesFromServer(),
                syncLikesFromServer(),
            ]);
            console.log(`[useUserSync] Sync complete - source: ${source}`);

            // Notify other tabs
            if (crossTab && channelRef.current) {
                channelRef.current.postMessage({ type: "SYNC_COMPLETE", timestamp: now });
            }
        } catch (error) {
            console.error(`[useUserSync] Sync failed - source: ${source}`, error);
        }
    }, [enabled, crossTab, syncUserFromServer, syncHistoryFromServer, syncFavoritesFromServer, syncLikesFromServer]);

    // Background interval sync
    useEffect(() => {
        if (!enabled || interval <= 0) return;

        const intervalId = setInterval(() => {
            // Use requestIdleCallback if available for better performance
            if ("requestIdleCallback" in window) {
                requestIdleCallback(() => doSync("interval"));
            } else {
                doSync("interval");
            }
        }, interval);

        return () => clearInterval(intervalId);
    }, [enabled, interval, doSync]);

    // Focus/Visibility sync
    useEffect(() => {
        if (!enabled || !onFocus) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                doSync("focus");
            }
        };

        const handleFocus = () => {
            doSync("window-focus");
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleFocus);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleFocus);
        };
    }, [enabled, onFocus, doSync]);

    // Cross-tab sync via BroadcastChannel
    useEffect(() => {
        if (!enabled || !crossTab) return;
        if (typeof BroadcastChannel === "undefined") return;

        const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channelRef.current = channel;

        channel.onmessage = (event) => {
            if (event.data.type === "DATA_UPDATED") {
                console.log("[useUserSync] Cross-tab update received");
                doSync("cross-tab");
            }
        };

        return () => {
            channel.close();
            channelRef.current = null;
        };
    }, [enabled, crossTab, doSync]);

    // Login sync (Clerk user change)
    useEffect(() => {
        if (!enabled || !onLogin || !isLoaded) return;

        if (isSignedIn && clerkUser) {
            // Only sync once per login session
            if (hasSyncedOnLoginRef.current === clerkUser.id) return;

            const syncOnLogin = async () => {
                console.log("[useUserSync] Login detected, syncing...");

                // Sync Clerk user to DB
                try {
                    await fetch("/api/user/sync", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: clerkUser.emailAddresses[0]?.emailAddress,
                            name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" "),
                            avatar: clerkUser.imageUrl,
                        }),
                    });

                    // Merge guest data
                    await fetch("/api/user/merge", { method: "POST" });

                    // Update Zustand with Clerk user
                    syncWithClerkUser({
                        id: clerkUser.id,
                        firstName: clerkUser.firstName,
                        lastName: clerkUser.lastName,
                        imageUrl: clerkUser.imageUrl || "",
                    });

                    // Sync all data
                    await doSync("login");
                    hasSyncedOnLoginRef.current = clerkUser.id;
                } catch (error) {
                    console.error("[useUserSync] Login sync failed:", error);
                }
            };

            syncOnLogin();
        } else {
            // Reset on logout
            hasSyncedOnLoginRef.current = null;
        }
    }, [enabled, onLogin, isLoaded, isSignedIn, clerkUser, syncWithClerkUser, doSync]);

    // Initial sync on mount (includes bulk push of local data to server)
    useEffect(() => {
        if (!enabled) return;

        const initialSync = async () => {
            // First, sync user profile to get correct server ID
            await syncUserFromServer();

            // Then bulk push all local history to server (only once)
            if (!hasDoneBulkSyncRef.current) {
                console.log("[useUserSync] Initial bulk sync starting...");
                const result = await pushLocalHistoryToServer();
                console.log("[useUserSync] Bulk sync result:", result);
                hasDoneBulkSyncRef.current = true;
            }

            // Then pull latest from server
            await doSync("mount");
        };

        initialSync();
    }, [enabled]); // Only on mount

    // Broadcast data update to other tabs
    const broadcastUpdate = useCallback((type: "history" | "favorites" | "likes") => {
        if (crossTab && channelRef.current) {
            channelRef.current.postMessage({ type: "DATA_UPDATED", dataType: type, timestamp: Date.now() });
        }
    }, [crossTab]);

    return {
        sync: doSync,
        isSyncing,
        broadcastUpdate,
    };
}

/**
 * Utility to broadcast store updates to other tabs
 * Call this after local store mutations
 */
export function broadcastStoreUpdate(type: "history" | "favorites" | "likes") {
    if (typeof BroadcastChannel === "undefined") return;

    try {
        const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channel.postMessage({ type: "DATA_UPDATED", dataType: type, timestamp: Date.now() });
        channel.close();
    } catch (error) {
        console.warn("[broadcastStoreUpdate] Failed:", error);
    }
}
