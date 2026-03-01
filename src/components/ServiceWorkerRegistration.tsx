"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for PWA offline support.
 * The SW caches the app shell and static assets so the app can load when the user opens it offline.
 * Data offline (IndexedDB cache + queue) is handled by processRequestOfflineAuth and useOffline.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    const url = "/sw.js";

    navigator.serviceWorker
      .register(url, { scope: "/" })
      .then((registration) => {
        console.log("Service Worker registered for offline support:", registration.scope);
        registration.update();
      })
      .catch((err) => {
        console.warn("Service Worker registration failed:", err);
      });
  }, []);

  return null;
}
