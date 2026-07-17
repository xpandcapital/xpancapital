"use client";
import { useEffect } from "react";

export function PWARegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          if (reg.active && !reg.active.scriptURL.includes('/sw.js')) {
            reg.unregister();
          }
        }
      });
    }
  }, []);

  return null;
}
