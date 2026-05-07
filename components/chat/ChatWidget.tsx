"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ChatPanel } from "./ChatPanel";

export function ChatWidget() {
  const [abierto, setAbierto] = useState(false);
  const [minimizado, setMinimizado] = useState(false);
  const { user } = useAuth();
  const widgetRef = useRef<HTMLDivElement>(null);

  // Detectar página actual para mostrar/ocultar widget
  const [mostrarWidget, setMostrarWidget] = useState(false);

  useEffect(() => {
    const checkPage = () => {
      const path = window.location.pathname;
      const paginasWidget = ["/tienda", "/blog", "/contacto"];
      const paginasConIcono = ["/", "/proyectos"];

      // Siempre mostrar en páginas de widget
      if (paginasWidget.some((p) => path.startsWith(p))) {
        setMostrarWidget(true);
      }
      // En home y proyectos, mostrar como icono (pero el widget puede estar minimizado)
      else if (paginasConIcono.some((p) => path === p || path.startsWith(p))) {
        setMostrarWidget(true);
      }
      // En dashboard, ocultar (hay panel integrado)
      else if (path.startsWith("/superadmin") || path.startsWith("/miembros")) {
        setMostrarWidget(false);
      }
      // En otras páginas públicas, mostrar
      else {
        setMostrarWidget(true);
      }
    };

    checkPage();
    window.addEventListener("popstate", checkPage);
    return () => window.removeEventListener("popstate", checkPage);
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

      {/* Botón flotante */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAbierto(!abierto)}
        className="relative w-14 h-14 rounded-full bg-blis-red shadow-lg shadow-blis-red/30 flex items-center justify-center text-white hover:shadow-xl hover:shadow-blis-red/40 transition-shadow"
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
              {!user && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Efecto de pulso */}
        {!abierto && (
          <span className="absolute inset-0 rounded-full bg-blis-red animate-ping opacity-20" />
        )}
      </motion.button>
    </div>
  );
}
