"use client";

import { useEffect, useCallback, useState } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "denied"
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  const registerServiceWorker = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      return registration;
    } catch (err) {
      console.error("[Push] Error registrando SW:", err);
      return null;
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !VAPID_PUBLIC_KEY) return false;

    try {
      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const subData = subscription.toJSON();
      const keys = subData.keys as { p256dh: string; auth: string };

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys,
          browser: navigator.userAgent.includes("Chrome") ? "chrome" : navigator.userAgent.includes("Firefox") ? "firefox" : navigator.userAgent.includes("Safari") ? "safari" : "other",
          device_type: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSubscribed(true);
      }

      return data.success;
    } catch (err) {
      console.error("[Push] Error suscribiendo:", err);
      return false;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;

    const perm = await Notification.requestPermission();
    setPermission(perm);

    if (perm === "granted") {
      await registerServiceWorker();
      return await subscribe();
    }

    return false;
  }, [registerServiceWorker, subscribe]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      try {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
              icon: "/pwa-icon.png",
              badge: "/pwa-icon.png",
              vibrate: [200, 100, 200],
              renotify: true,
              ...options,
            } as NotificationOptions);
          });
        } else {
          new Notification(title, {
            icon: "/pwa-icon.png",
            badge: "/pwa-icon.png",
            ...options,
          });
        }
      } catch (err) {
        console.error("[Push] Error mostrando notificación:", err);
      }
    },
    []
  );

  const sendPushToUser = useCallback(async (userId: string, titulo: string, mensaje: string, url?: string, tipo?: string) => {
    try {
      await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, titulo, mensaje, url, tipo }),
      });
    } catch (err) {
      console.error("[Push] Error enviando push:", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = async () => {
      if (!("serviceWorker" in navigator) || !VAPID_PUBLIC_KEY) return;

      const registration = await registerServiceWorker();
      if (!registration) return;

      if (Notification.permission === "granted") {
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          setIsSubscribed(true);
        } else {
          const perm = await Notification.requestPermission();
          setPermission(perm);
          if (perm === "granted") {
            await subscribe();
          }
        }
      }
    };

    init();
  }, [registerServiceWorker, subscribe]);

  return {
    permission,
    isSubscribed,
    requestPermission,
    showNotification,
    sendPushToUser,
    subscribe,
  };
}