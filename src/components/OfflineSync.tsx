"use client";

import { useOffline } from "@/hooks/useOffline";

/**
 * Mounts useOffline so that:
 * - IndexedDB is initialized
 * - When the app comes back online, queued requests are replayed (sync)
 */
export default function OfflineSync() {
  useOffline();
  return null;
}
