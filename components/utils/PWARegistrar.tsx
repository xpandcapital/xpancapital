"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share2, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function getDeviceInfo() {
  if (typeof window === "undefined") return { isIOS: false, isSafari: false, isMobile: false };
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/i.test(ua);
  const isMobile = /Mobi|Android/i.test(ua);
  return { isIOS, isSafari, isMobile };
}

export function PWARegistrar() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({ isIOS: false, isSafari: false, isMobile: false });

  useEffect(() => {
    setDeviceInfo(getDeviceInfo());

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    const { isIOS, isSafari } = getDeviceInfo();
    if (isIOS && isSafari) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
        window.removeEventListener("appinstalled", handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        setShowPrompt(false);
      } else {
        setDismissed(true);
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setShowPrompt(false);
  }, []);

  if (!showPrompt || dismissed || installed) return null;

  const { isIOS, isSafari, isMobile } = deviceInfo;
  const isIOSPrompt = isIOS && isSafari && !deferredPrompt;

  return (
    <AnimatePresence>
      {isIOSPrompt ? (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-0 left-0 right-0 z-[9998] p-4 md:p-6 pointer-events-none"
        >
          <div className="max-w-md mx-auto pointer-events-auto">
            <div className="bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 shadow-2xl shadow-black/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blis-red/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Share2 className="w-5 h-5 text-blis-red" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Instalar App</h4>
                  <p className="text-[11px] text-gray-400 font-medium mt-1 leading-relaxed">
                    Toca <span className="text-white font-bold"><Share2 className="w-3 h-3 inline-block -mt-0.5" /> Compartir</span> {"→"} <span className="text-white font-bold"><Plus className="w-3 h-3 inline-block -mt-0.5" /> Agregar a inicio</span>
                  </p>
                </div>
                <button onClick={handleDismiss} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={isMobile ? "fixed bottom-0 left-0 right-0 z-[9998] p-4" : "fixed bottom-6 right-6 z-[9998]"}
        >
          {isMobile ? (
            <div className="bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 shadow-2xl shadow-black/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blis-red rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Instalar App</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Acceso rápido desde tu pantalla de inicio</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleDismiss} className="p-3 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <button onClick={handleInstall} className="px-5 py-3 bg-blis-red text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-blis-red/90 transition-all shadow-lg shadow-blis-red/20">
                    Instalar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/50 flex items-center gap-3">
              <button onClick={handleInstall} className="flex items-center gap-2 px-4 py-2.5 bg-blis-red text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-blis-red/90 transition-all shadow-lg shadow-blis-red/20">
                <Download className="w-4 h-4" /> Instalar App
              </button>
              <button onClick={handleDismiss} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
