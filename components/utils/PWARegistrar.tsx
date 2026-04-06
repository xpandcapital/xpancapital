"use client";
import { useEffect } from "react";

/**
 * PWARegistrar registers the Service Worker on mount.
 * This is essential for 'Add to Home Screen' (A2HS) to work on Mobile Chrome and iOS Safari.
 */
export function PWARegistrar() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Registrar Service Worker
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => console.log("Blis-Corp PWA: Service Worker registrado.", reg.scope))
            .catch((err) => console.log("Blis-Corp PWA: Error al registrar SW.", err));
        });
      }

      // Capturar evento de instalación para debugging y botones custom
      window.addEventListener("beforeinstallprompt", (e: any) => {
        console.log("Blis-Corp PWA: Aplicación lista para instalar (Mobile ready).");
        // Opcional: podrías guardar el evento 'e' para disparar la instalación desde un botón
      });
    }
  }, []);

  return null;
}
