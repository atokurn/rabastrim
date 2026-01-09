"use client";

import { useUserSync } from "@/hooks/useUserSync";

/**
 * UserSyncProvider Component
 * 
 * Wraps the app to provide advanced sync capabilities:
 * - Background sync every 30s
 * - Cross-tab sync via BroadcastChannel
 * - Focus/visibility sync
 * - Login sync with Clerk
 */
export function UserSyncProvider({ children }: { children: React.ReactNode }) {
    // Use the advanced sync hook
    useUserSync({
        interval: 30000,      // Sync every 30 seconds
        onFocus: true,        // Sync when tab regains focus
        onLogin: true,        // Sync when user logs in
        crossTab: true,       // Sync across browser tabs
        enabled: true,
    });

    return <>{children}</>;
}
