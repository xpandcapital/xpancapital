"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ShoppingCart,
  GraduationCap,
  FileText,
  MessageSquare,
  Settings,
  UserPlus,
  CheckCheck,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface Notificacion {
  id: string;
  user_id: string;
  empresa_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  link: string | null;
  leida: boolean;
  leida_en: string | null;
  creado_en: string;
  data?: { url?: string | null } | null;
}

const TIPO_ICONOS: Record<string, React.ComponentType<{ className?: string }>> = {
  blog: FileText,
  leads: UserPlus,
  compras: ShoppingCart,
  cursos: GraduationCap,
  sistema: Settings,
  mensaje: MessageSquare,
};

const TIPO_COLORES: Record<string, string> = {
  blog: "text-violet-400 bg-violet-400/10",
  leads: "text-emerald-400 bg-emerald-400/10",
  compras: "text-amber-400 bg-amber-400/10",
  cursos: "text-blue-400 bg-blue-400/10",
  sistema: "text-gray-400 bg-gray-400/10",
  mensaje: "text-rose-400 bg-rose-400/10",
};

function tiempoRelativo(fecha: string): string {
  const ahora = Date.now();
  const diff = ahora - new Date(fecha).getTime();
  const segundos = Math.floor(diff / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (segundos < 60) return "Ahora";
  if (minutos < 60) return `Hace ${minutos}m`;
  if (horas < 24) return `Hace ${horas}h`;
  if (dias < 7) return `Hace ${dias}d`;
  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/notificaciones?unread=true");
      const countData = await res.json();
      if (countData.success && typeof countData.count === "number") {
        setUnreadCount(countData.count);
      }
    } catch {
      // silencioso
    }

    try {
      const res = await fetch("/api/notificaciones");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string, link?: string | null) => {
    try {
      await fetch("/api/notificaciones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, leida: true, leida_en: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silencioso
    }

    if (link) {
      setIsOpen(false);
      router.push(link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notificaciones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marcar_todas: true }),
      });

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, leida: true, leida_en: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // silencioso
    }
  };

  const IconoComponent = TIPO_ICONOS;
  const displayNotifications = notifications.slice(0, 10);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-blis-red text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-lg shadow-blis-red/30"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-[9999]"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-xs font-black text-white uppercase tracking-widest">
                Notificaciones
                {unreadCount > 0 && (
                  <span className="ml-2 text-[10px] text-gray-500 font-medium normal-case tracking-normal">
                    ({unreadCount} sin leer)
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 text-[10px] font-black text-blis-red uppercase tracking-wider hover:text-white transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar todas
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex gap-3">
                      <div className="w-8 h-8 bg-white/5 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-white/5 rounded w-3/4" />
                        <div className="h-2 bg-white/5 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">Sin notificaciones</p>
                </div>
              ) : (
                <div className="py-1">
                  {displayNotifications.map((n) => {
                    const Icon = IconoComponent[n.tipo] || Settings;
                    const colorClass =
                      TIPO_COLORES[n.tipo] || TIPO_COLORES.sistema;

                    return (
                      <button
                        key={n.id}
                        onClick={() => handleMarkRead(n.id, n.link || n.data?.url || null)}
                        className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-white/[0.03] transition-colors group ${
                          !n.leida ? "bg-white/[0.02]" : ""
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-[13px] leading-snug ${
                                n.leida
                                  ? "text-gray-400 font-medium"
                                  : "text-white font-bold"
                              }`}
                            >
                              {n.titulo}
                            </p>
                            {!n.leida && (
                              <span className="w-2 h-2 bg-blis-red rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 leading-relaxed">
                            {n.mensaje}
                          </p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">
                              {tiempoRelativo(n.creado_en)}
                            </span>
                            {(n.link || n.data?.url) && (
                              <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-blis-red transition-colors" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
