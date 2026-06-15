"use client";

import { useEffect } from "react";

const CLEANUP_KEY = "intentcart-stale-service-worker-cleaned";

export default function ServiceWorkerCleanup() {
  useEffect(() => {
    async function cleanup() {
      if (!("serviceWorker" in navigator)) return;

      const registrations = await navigator.serviceWorker.getRegistrations();
      const hadController = Boolean(navigator.serviceWorker.controller);

      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }

      if (
        hadController &&
        registrations.length > 0 &&
        sessionStorage.getItem(CLEANUP_KEY) !== "true"
      ) {
        sessionStorage.setItem(CLEANUP_KEY, "true");
        window.location.reload();
      }
    }

    void cleanup().catch((error: unknown) => {
      console.warn("[service-worker-cleanup] Could not remove stale worker", error);
    });
  }, []);

  return null;
}
