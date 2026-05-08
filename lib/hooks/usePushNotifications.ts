"use client";

import { useEffect, useCallback } from "react";

export function usePushNotifications() {
  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }, []);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    
    try {
      new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });
    } catch (err) {
      console.error("Error showing notification:", err);
    }
  }, []);

  useEffect(() => {
    // Auto-request on first load
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        // Wait a bit before requesting so it doesn't annoy immediately
        const timer = setTimeout(() => {
          Notification.requestPermission();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return { requestPermission, showNotification, permission: typeof window !== "undefined" && "Notification" in window ? Notification.permission : "denied" };
}
