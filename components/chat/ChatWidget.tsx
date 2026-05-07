"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/lib/chat/useChat";
import { ChatPanel } from "./ChatPanel";

export function ChatWidget() {
  const [abierto, setAbierto] = useState(false);
  const [minimizado, setMinimizado] = useState(false);
  const { user } = useAuth();
  const { noLeidos } = useChat();
  const widgetRef = useRef<HTMLDivElement>(null);

  const totalNoLeidos = Object.values(noLeidos).reduce((a, b) => a + b, 0);

  // Detectar página actual para mostrar/ocultar widget - usando window.location directamente
  const [mostrarWidget, setMostrarWidget] = useState(true);

  useEffect(() => {
    const checkPage = () => {
      const path = window.location.pathname;
      const paginasWidget = ["/tienda", "/blog", "/contacto"];
      const paginasConIcono = ["/", "/proyectos"];

      if (path.startsWith("/superadmin") || path.startsWith("/miembros")) {
        setMostrarWidget(false);
        return;
      }
      if (paginasWidget.some((p) => path.startsWith(p))) {
        setMostrarWidget(true);
        return;
      }
      if (paginasConIcono.some((p) => path === p || path.startsWith(p))) {
        setMostrarWidget(true);
        return;
      }
      setMostrarWidget(true);
    };

    checkPage();
    // Revisar periódicamente por si hay navegación del cliente
    const interval = setInterval(checkPage, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        if (abierto) setAbierto(false);
      }
    };

    if (abierto) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [abierto]);

  if (!mostrarWidget) return null;

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      <AnimatePresence>
        {abierto && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="mb-2"
          >
            <ChatPanel
              onClose={() => setAbierto(false)}
              onMinimize={() => setMinimizado(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante neon */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAbierto(!abierto)}
        className="relative w-14 h-14 rounded-full bg-blis-red flex items-center justify-center text-white transition-all duration-300"
        style={{
          boxShadow: "0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3), 0 0 60px rgba(239, 68, 68, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 100, 100, 0.3)",
        }}
      >
        <AnimatePresence mode="wait">
          {abierto ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageCircle className="w-6 h-6" />
              {/* Indicador de mensajes nuevos */}
              {totalNoLeidos > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold text-white px-1">
                  {totalNoLeidos > 9 ? "9+" : totalNoLeidos}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Efecto de pulso neon */}
        {!abierto && (
          <>
            <span className="absolute inset-0 rounded-full bg-blis-red animate-ping opacity-30" style={{ animationDuration: "2s" }} />
            <span className="absolute -inset-1 rounded-full bg-blis-red/20 animate-pulse" style={{ animationDuration: "3s" }} />
          </>
        )}
      </motion.button>
    </div>
  );
}
