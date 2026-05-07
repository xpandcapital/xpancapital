"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  if (typeof window === "undefined") return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

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

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch {
    return null;
  }
}

async function getExistingSubscription(swRegistration: ServiceWorkerRegistration) {
  try {
    return await swRegistration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function usePushNotifications(userId?: string) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsSupported("serviceWorker" in navigator && "PushManager" in window);
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (!isSupported) {
      setLoading(false);
      return;
    }

    const checkSubscription = async () => {
      const sw = await registerServiceWorker();
      if (!sw) {
        setLoading(false);
        return;
      }
      const sub = await getExistingSubscription(sw);
      setIsSubscribed(!!sub);
      setLoading(false);
    };

    checkSubscription();
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) return false;

    const sw = await registerServiceWorker();
    if (!sw) return false;

    const existingSub = await getExistingSubscription(sw);
    if (existingSub) {
      setIsSubscribed(true);
      return true;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.warn("[Push] VAPID public key not configured");
      return false;
    }

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") return false;

      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const subData: PushSubscriptionData = subscription.toJSON();
      setIsSubscribed(true);

      if (userId) {
        const supabase = getSupabase();
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const token = session.access_token;
            await fetch("/api/notificaciones/suscribir", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                endpoint: subData.endpoint,
                keys: subData.keys,
              }),
            });
          }
        }
      }

      return true;
    } catch (error) {
      console.error("[Push] Error subscribing:", error);
      return false;
    }
  }, [isSupported, userId]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return false;

    const sw = await registerServiceWorker();
    if (!sw) return false;

    const existingSub = await getExistingSubscription(sw);
    if (existingSub) {
      try {
        await existingSub.unsubscribe();
      } catch { /* ignore */ }
    }

    setIsSubscribed(false);

    if (userId) {
      const supabase = getSupabase();
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const token = session.access_token;
          await fetch("/api/notificaciones/suscribir", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        }
      }
    }

    return true;
  }, [isSupported, userId]);

  return {
    isSubscribed,
    isSupported,
    loading,
    permission,
    subscribe,
    unsubscribe,
  };
}
