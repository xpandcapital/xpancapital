"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Paperclip, Smile, Phone, Video,
  ArrowLeft, User, Bot, Sparkles, MessageCircle,
  Clock, Check, CheckCheck, Loader2, LayoutTemplate,
  Search, Pin, PinOff, Edit3, Trash2, MoreHorizontal, X as XIcon,
  Users, Bell
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/lib/chat/useChat";
import { useWebRTC } from "@/lib/chat/useWebRTC";
import { getSupabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ChatSala, ChatMensaje } from "@/lib/chat/types";
import { CallModal } from "./CallModal";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";

interface ChatPanelProps {
  onClose: () => void;
  onMinimize?: () => void;
}

interface VisitorMensaje {
  id: string;
  tipo: string;
  contenido: string | null;
  creado_en: string;
  user_id?: string | null;
}

interface ContactoUsuario {
  id: string;
  nombre: string;
  avatar_url: string | null;
  rol: string;
  estado_chat?: string;
}

export function ChatPanel({ onClose, onMinimize }: ChatPanelProps) {
  const { user } = useAuth();
  const { requestPermission, permission: pushPermission } = usePushNotifications();
  const {
    salas,
    salaActiva,
    mensajes,
    miembros,
    loading,
    enviando,
    unirseSala,
    enviarMensaje,
    crearSalaDirecta,
    setEscribiendo,
    plantillas,
    subirArchivoChat,
    editarMensaje,
    eliminarMensaje,
    fijarMensaje,
    buscarMensajes,
    transferirSala,
    escribiendoEn,
  } = useChat();

  const {
    callState,
    iniciarLlamada,
    aceptarLlamada,
    rechazarLlamada,
    colgar,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
  } = useWebRTC();

  const [vista, setVista] = useState<"lista" | "chat" | "visitante">("lista");
  const [mensajeInput, setMensajeInput] = useState("");

  // Visitor state with persistence
  const [visitanteNombre, setVisitanteNombre] = useState("");
  const [visitanteEmail, setVisitanteEmail] = useState("");
  const [visitanteMensaje, setVisitanteMensaje] = useState("");
  const [visitanteEnviando, setVisitanteEnviando] = useState(false);
  const [visitanteHistorial, setVisitanteHistorial] = useState<VisitorMensaje[]>([]);
  const [visitanteSessionId, setVisitanteSessionId] = useState<string | null>(null);
  const [visitanteSalaId, setVisitanteSalaId] = useState<string | null>(null);
  const [visitanteIniciado, setVisitanteIniciado] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState<any>(null);

  // Member contacts
  const [tabMiembro, setTabMiembro] = useState<"chats" | "contactos">("chats");
  const [contactos, setContactos] = useState<ContactoUsuario[]>([]);
  const [cargandoContactos, setCargandoContactos] = useState(false);

  const [llamadaEntranteId, setLlamadaEntranteId] = useState<string | null>(null);
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [queryBusqueda, setQueryBusqueda] = useState("");
  const [mensajesBuscados, setMensajesBuscados] = useState<ChatMensaje[]>([]);
  const [editandoMensaje, setEditandoMensaje] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [menuMensaje, setMenuMensaje] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const llamadasChannelId = useRef(`chat-llamadas-${Math.random().toString(36).slice(2)}`);

  // Scroll to bottom helper (works with ScrollArea viewport)
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const viewport = el.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      } else {
        el.scrollTop = el.scrollHeight;
      }
    });
  }, []);

  // Visitor: polling cada 2s para recibir mensajes nuevos
  // (realtime no funciona para anónimos porque RLS bloquea SELECT)
  useEffect(() => {
    if (user) return;
    const savedSession = localStorage.getItem("blis_chat_session");
    if (!savedSession) return;

    const pollInterval = setInterval(() => {
      fetch(`/api/chat/visitor?session_id=${savedSession}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.historial && data.historial.length > 0) {
            setVisitanteHistorial((prev) => {
              const prevIds = new Set(prev.map((m) => m.id));
              const nuevos = data.historial.filter((m: VisitorMensaje) => !prevIds.has(m.id));
              if (nuevos.length > 0) {
                const merged = [...prev, ...nuevos];
                merged.sort((a: VisitorMensaje, b: VisitorMensaje) =>
                  new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime()
                );
                setTimeout(scrollToBottom, 100);
                return merged;
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [user, visitanteSessionId, scrollToBottom]);

  // Load widget config on mount
  useEffect(() => {
    fetch("/api/chat/widget-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setWidgetConfig(data.data);
      })
      .catch(() => {});
  }, []);

  // Restore visitor session from localStorage on mount
  useEffect(() => {
    if (!user) {
      const savedSession = localStorage.getItem("blis_chat_session");
      const savedName = localStorage.getItem("blis_chat_name");
      const savedEmail = localStorage.getItem("blis_chat_email");
      if (savedSession && savedName) {
        setVisitanteSessionId(savedSession);
        setVisitanteNombre(savedName);
        if (savedEmail) setVisitanteEmail(savedEmail);
        setVisitanteIniciado(true);
        setVista("visitante");
        fetch(`/api/chat/visitor?session_id=${savedSession}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.success && data.historial && data.historial.length > 0) {
              setVisitanteHistorial(data.historial);
              setTimeout(scrollToBottom, 100);
            }
          })
          .catch(() => {});
      }
    }
  }, [user, scrollToBottom]);

  // Load contacts for logged-in users
  const cargarContactos = useCallback(async () => {
    if (!user?.empresa_id) {
      console.log("[ChatPanel] No empresa_id, skip contactos");
      return;
    }
    setCargandoContactos(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.log("[ChatPanel] No supabase client");
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nombre, avatar_url, rol, estado_chat")
        .eq("empresa_id", user.empresa_id)
        .neq("id", user.id)
        .order("nombre", { ascending: true });
      if (error) {
        console.error("[ChatPanel] Error cargando contactos:", error);
      } else {
        console.log("[ChatPanel] Contactos cargados:", data?.length || 0);
        setContactos(data || []);
      }
    } catch (err) {
      console.error("[ChatPanel] Error cargando contactos:", err);
    } finally {
      setCargandoContactos(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) cargarContactos();
  }, [user, cargarContactos]);

  // Escuchar llamadas entrantes
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel(llamadasChannelId.current)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_llamadas",
          filter: `recibida_por=eq.${user.id}`,
        },
        (payload) => {
          const llamada = payload.new as any;
          if (llamada.estado === "llamando") {
            setLlamadaEntranteId(llamada.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Determinar usuario remoto para llamada en sala directa
  const remoteUserId = salaActiva && miembros.length > 0
    ? miembros.find((m) => m.user_id !== user?.id)?.user_id
    : null;

  // Auto-scroll al final de mensajes
  useEffect(() => {
    scrollToBottom();
  }, [mensajes, visitanteHistorial, scrollToBottom]);

  // Cambiar a vista chat cuando se une a una sala
  useEffect(() => {
    if (salaActiva) {
      setVista("chat");
    }
  }, [salaActiva]);

  const handleEnviar = async () => {
    if (!mensajeInput.trim() || !salaActiva) return;

    const contenido = mensajeInput.trim();
    const success = await enviarMensaje(salaActiva.id, contenido, "texto");
    if (success) {
      setMensajeInput("");
      setEscribiendo(salaActiva.id, false);

      if (salaActiva.tipo === "ia") {
        try {
          const contexto = mensajes.slice(-10).map((m) => ({
            rol: m.tipo === "ia" ? "ia" : "usuario",
            contenido: m.contenido || "",
          }));
          await fetch("/api/chat/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mensaje: contenido,
              sala_id: salaActiva.id,
              contexto,
              empresa_id: user?.empresa_id,
            }),
          });
        } catch (err) {
          console.error("Error llamando IA:", err);
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  const handleInputChange = (value: string) => {
    setMensajeInput(value);
    if (salaActiva && value.length > 0) {
      setEscribiendo(salaActiva.id, true);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !salaActiva) return;
    await subirArchivoChat(salaActiva.id, file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleBuscar = async () => {
    if (!salaActiva || !queryBusqueda.trim()) return;
    const resultados = await buscarMensajes(salaActiva.id, queryBusqueda);
    setMensajesBuscados(resultados);
  };

  const handleEditar = async (msgId: string) => {
    if (!editInput.trim()) return;
    await editarMensaje(msgId, editInput);
    setEditandoMensaje(null);
    setEditInput("");
  };

  const handleEliminar = async (msgId: string) => {
    await eliminarMensaje(msgId);
    setMenuMensaje(null);
  };

  const handleFijar = async (msgId: string, fijar: boolean) => {
    await fijarMensaje(msgId, fijar);
    setMenuMensaje(null);
  };

  const handleVisitanteEnviar = async () => {
    if (!visitanteMensaje.trim() || !visitanteNombre.trim()) return;
    setVisitanteEnviando(true);

    const contenido = visitanteMensaje.trim();
    const currentSessionId = visitanteSessionId || localStorage.getItem("blis_chat_session") || undefined;

    // Optimistic: mostrar mensaje al instante
    const tempId = `temp-${Date.now()}`;
    const msgOptimista: VisitorMensaje = {
      id: tempId,
      tipo: "texto",
      contenido,
      creado_en: new Date().toISOString(),
      user_id: null,
    };
    setVisitanteHistorial((prev) => [...prev, msgOptimista]);
    setVisitanteMensaje("");
    setTimeout(scrollToBottom, 50);

    try {
      const response = await fetch("/api/chat/visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: visitanteNombre,
          email: visitanteEmail || undefined,
          mensaje: contenido,
          session_id: currentSessionId,
          pagina_origen: window.location.pathname,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        if (data.session_id) {
          localStorage.setItem("blis_chat_session", data.session_id);
          setVisitanteSessionId(data.session_id);
        }
        localStorage.setItem("blis_chat_name", visitanteNombre);
        if (visitanteEmail) localStorage.setItem("blis_chat_email", visitanteEmail);
        if (data.sala_id) setVisitanteSalaId(data.sala_id);
        setVisitanteIniciado(true);

        // Reemplazar historial con datos del servidor (más confiables)
        if (data.historial && data.historial.length > 0) {
          setVisitanteHistorial(data.historial);
          setTimeout(scrollToBottom, 100);
        } else {
          // Si no hay historial del servidor, remover el optimista
          setVisitanteHistorial((prev) => prev.filter((m) => m.id !== tempId));
        }
      } else {
        setVisitanteHistorial((prev) => prev.filter((m) => m.id !== tempId));
        console.error("[ChatPanel] Error API:", data.error);
      }
    } catch (err) {
      setVisitanteHistorial((prev) => prev.filter((m) => m.id !== tempId));
      console.error("[ChatPanel] Error enviando:", err);
    } finally {
      setVisitanteEnviando(false);
    }
  };

  const iniciarChatVisitante = () => {
    if (!visitanteNombre.trim()) return;
    setVisitanteIniciado(true);
    setVista("visitante");
    localStorage.setItem("blis_chat_name", visitanteNombre);
    if (visitanteEmail) localStorage.setItem("blis_chat_email", visitanteEmail);
  };

  const handleNuevoChatContacto = async (contacto: ContactoUsuario) => {
    const salaId = await crearSalaDirecta(contacto.id);
    if (salaId) {
      await unirseSala(salaId);
    }
  };

  // Render message bubble
  const renderMensaje = (msg: ChatMensaje | VisitorMensaje, index: number) => {
    const esSistema = msg.tipo === "sistema" || msg.tipo === "ia";
    // Si el usuario está logueado: es mío si user_id coincide
    // Si NO está logueado (visitante): es mío si user_id es null (mensaje del visitante)
    const esMio = user ? msg.user_id === user.id : msg.user_id === null;
    const esVisitante = msg.user_id === null && msg.tipo === "texto";

    if (esSistema) {
      return (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center my-3"
        >
          <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-400 flex items-center gap-2">
            {msg.tipo === "ia" && <Sparkles className="w-3 h-3 text-emerald-400" />}
            <span>{msg.contenido}</span>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        className={`flex gap-3 mb-4 ${esMio ? "flex-row-reverse" : "flex-row"}`}
      >
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={undefined} />
          <AvatarFallback className={`text-xs ${esVisitante ? "bg-amber-500/20 text-amber-500" : "bg-blis-red/20 text-blis-red"}`}>
            {esVisitante ? "V" : (esMio ? "T" : "A")}
          </AvatarFallback>
        </Avatar>

        <div className={`max-w-[75%] ${esMio ? "items-end" : "items-start"} flex flex-col relative`}>
          {!esMio && (
            <span className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-bold">
              {esVisitante ? visitanteNombre : ("user" in msg ? msg.user?.nombre : "Asesor")}
            </span>
          )}

          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed relative group ${
              esMio
                ? "bg-blis-red text-white rounded-br-md"
                : esVisitante
                ? "bg-amber-500/10 text-amber-100 border border-amber-500/20 rounded-bl-md"
                : "bg-white/5 text-gray-200 border border-white/10 rounded-bl-md"
            }`}
          >
            {(msg as ChatMensaje).editado && (
              <span className="text-[9px] opacity-60 mr-1">(editado)</span>
            )}
            {(msg as ChatMensaje).tipo === "imagen" && (msg as ChatMensaje).archivo_url ? (
              <a href={(msg as ChatMensaje).archivo_url!} target="_blank" rel="noopener noreferrer">
                <img
                  src={(msg as ChatMensaje).archivo_url!}
                  alt={(msg as ChatMensaje).archivo_nombre || "Imagen"}
                  className="max-w-[200px] max-h-[200px] rounded-lg object-cover"
                />
              </a>
            ) : (msg as ChatMensaje).tipo === "video" && (msg as ChatMensaje).archivo_url ? (
              <video
                src={(msg as ChatMensaje).archivo_url!}
                controls
                className="max-w-[200px] max-h-[200px] rounded-lg"
              />
            ) : (msg as ChatMensaje).tipo === "audio" && (msg as ChatMensaje).archivo_url ? (
              <audio src={(msg as ChatMensaje).archivo_url!} controls className="w-[200px]" />
            ) : (msg as ChatMensaje).tipo === "archivo" && (msg as ChatMensaje).archivo_url ? (
              <a
                href={(msg as ChatMensaje).archivo_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 underline"
              >
                <Paperclip className="w-4 h-4" />
                {(msg as ChatMensaje).archivo_nombre || "Archivo"}
              </a>
            ) : (
              msg.contenido
            )}

            {/* Menu contextual */}
            {esMio && (
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Popover open={menuMensaje === msg.id} onOpenChange={(open) => setMenuMensaje(open ? msg.id : null)}>
                  <PopoverTrigger>
                    <button className="p-1 bg-[#1a1a1a] border border-white/10 rounded-full shadow-lg">
                      <MoreHorizontal className="w-3 h-3 text-gray-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-32 p-1 bg-[#111] border-white/10">
                    <button
                      onClick={() => {
                        setEditandoMensaje(msg.id);
                        setEditInput(msg.contenido || "");
                        setMenuMensaje(null);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-300 hover:bg-white/5 rounded-md"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleFijar(msg.id, !(msg as ChatMensaje).fijado)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-300 hover:bg-white/5 rounded-md"
                    >
                      {(msg as ChatMensaje).fijado ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                      {(msg as ChatMensaje).fijado ? "Desfijar" : "Fijar"}
                    </button>
                    <button
                      onClick={() => handleEliminar(msg.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-400 hover:bg-white/5 rounded-md"
                    >
                      <Trash2 className="w-3 h-3" />
                      Eliminar
                    </button>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1">
            <span className="text-[9px] text-gray-600">
              {new Date(msg.creado_en).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {esMio && (
              <span className="text-gray-600">
                {(msg as ChatMensaje).leido_por && (msg as ChatMensaje).leido_por.length > 1 ? (
                  <CheckCheck className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-[calc(100vw-32px)] max-w-[380px] h-[500px] sm:h-[600px] bg-[#0a0a0a] border border-white/10 rounded-[24px] sm:rounded-[32px] shadow-2xl shadow-black/50 flex flex-col overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#0a0a0a]/90">
        <div className="flex items-center gap-3">
          {(vista === "chat" || vista === "visitante") && (
            <button
              onClick={() => setVista("lista")}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-400" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blis-red/20 flex items-center justify-center">
              {vista === "chat" && salaActiva?.tipo === "ia" ? (
                <Bot className="w-4 h-4 text-emerald-400" />
              ) : vista === "visitante" ? (
                <Sparkles className="w-4 h-4 text-amber-400" />
              ) : (
                <MessageCircle className="w-4 h-4 text-blis-red" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {vista === "chat" && salaActiva
                  ? salaActiva.nombre || "Chat"
                  : vista === "visitante"
                  ? "BLIS Chat"
                  : "Mensajes"}
              </h3>
              {vista === "chat" && (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                    En línea
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {vista === "chat" && (
            <>
              <button
                onClick={() => {
                  setMostrarBusqueda(!mostrarBusqueda);
                  if (mostrarBusqueda) {
                    setQueryBusqueda("");
                    setMensajesBuscados([]);
                  }
                }}
                className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${mostrarBusqueda ? "text-white bg-white/10" : "text-gray-400 hover:text-white"}`}
              >
                <Search className="w-4 h-4" />
              </button>
              {remoteUserId && (
                <>
                  <Tooltip>
                    <TooltipTrigger>
                      <button
                        onClick={() => iniciarLlamada(remoteUserId, "audio")}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Llamada de voz</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger>
                      <button
                        onClick={() => iniciarLlamada(remoteUserId, "video")}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Videollamada</TooltipContent>
                  </Tooltip>
                </>
              )}
            </>
          )}
          {user && pushPermission === "default" && (
            <button
              onClick={requestPermission}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors text-amber-400 hover:text-amber-300"
              title="Activar notificaciones"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* Lista de conversaciones */}
          {vista === "lista" && (
            <motion.div
              key="lista"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              {!user ? (
                // Visitante - formulario inicial
                <div className="p-6 space-y-6 flex-1 flex flex-col justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blis-red/20 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-blis-red" />
                    </div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider mb-2">
                      ¡Hola!
                    </h4>
                    <p className="text-sm text-gray-400">
                      Bienvenido a BLIS Corp. ¿En qué podemos ayudarte hoy?
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                        Tu nombre
                      </label>
                      <Input
                        value={visitanteNombre}
                        onChange={(e) => setVisitanteNombre(e.target.value)}
                        placeholder="Ej: Juan Pérez"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                        Email (opcional)
                      </label>
                      <Input
                        type="email"
                        value={visitanteEmail}
                        onChange={(e) => setVisitanteEmail(e.target.value)}
                        placeholder="juan@ejemplo.com"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                      />
                    </div>
                    <Button
                      onClick={iniciarChatVisitante}
                      disabled={!visitanteNombre.trim()}
                      className="w-full bg-blis-red hover:bg-blis-red/90 text-white font-black uppercase tracking-widest text-xs py-6"
                    >
                      Iniciar chat
                    </Button>
                  </div>

                  <p className="text-center text-[10px] text-gray-600">
                    Al continuar, aceptas nuestra política de privacidad.
                  </p>
                </div>
              ) : (
                // Usuario logueado
                <>
                  {/* Tabs */}
                  <div className="flex border-b border-white/5">
                    <button
                      onClick={() => setTabMiembro("chats")}
                      className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors ${
                        tabMiembro === "chats"
                          ? "text-blis-red border-b-2 border-blis-red"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      Chats
                    </button>
                    <button
                      onClick={() => setTabMiembro("contactos")}
                      className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors ${
                        tabMiembro === "contactos"
                          ? "text-blis-red border-b-2 border-blis-red"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      Contactos
                    </button>
                  </div>

                  {tabMiembro === "chats" ? (
                    salas.length === 0 ? (
                      <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                          <MessageCircle className="w-8 h-8 text-gray-600" />
                        </div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                          Sin conversaciones
                        </h4>
                        <p className="text-xs text-gray-500">
                          Aún no tienes chats activos. Ve a la pestaña Contactos para iniciar una conversación.
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="flex-1">
                        <div className="p-3 space-y-1">
                          {salas.map((sala) => (
                            <button
                              key={sala.id}
                              onClick={() => unirseSala(sala.id)}
                              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors text-left group"
                            >
                              <div className="relative">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback className="bg-blis-red/20 text-blis-red font-black">
                                    {sala.nombre?.[0] || "C"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-sm font-bold text-white truncate">
                                    {sala.nombre || "Chat"}
                                  </h5>
                                  <span className="text-[10px] text-gray-600">
                                    {sala.ultima_actividad
                                      ? new Date(sala.ultima_actividad).toLocaleDateString("es-ES", {
                                          day: "numeric",
                                          month: "short",
                                        })
                                      : ""}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate group-hover:text-gray-400 transition-colors">
                                  {sala.ultimo_mensaje?.contenido || "Sin mensajes"}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    )
                  ) : (
                    // Contactos tab
                    <ScrollArea className="flex-1">
                      <div className="p-3 space-y-1">
                        {cargandoContactos ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-blis-red" />
                          </div>
                        ) : contactos.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="w-8 h-8 text-gray-600 mb-3" />
                            <p className="text-sm text-gray-500">No hay contactos disponibles</p>
                          </div>
                        ) : (
                          contactos.map((contacto) => (
                            <button
                              key={contacto.id}
                              onClick={() => handleNuevoChatContacto(contacto)}
                              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors text-left group"
                            >
                              <div className="relative">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={contacto.avatar_url || undefined} />
                                  <AvatarFallback className="bg-blis-red/20 text-blis-red text-xs font-black">
                                    {contacto.nombre?.[0] || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span
                                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${
                                    contacto.estado_chat === "online"
                                      ? "bg-emerald-500"
                                      : contacto.estado_chat === "ausente"
                                      ? "bg-amber-500"
                                      : "bg-gray-600"
                                  }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-bold text-white truncate">
                                  {contacto.nombre}
                                </h5>
                                <p className="text-xs text-gray-500 capitalize">{contacto.rol}</p>
                              </div>
                              <MessageCircle className="w-4 h-4 text-gray-600 group-hover:text-blis-red transition-colors" />
                            </button>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Chat activo (miembros) */}
          {vista === "chat" && salaActiva && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col"
            >
              {/* Búsqueda */}
              <AnimatePresence>
                {mostrarBusqueda && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-white/5 overflow-hidden"
                  >
                    <div className="px-4 py-2 flex gap-2">
                      <Input
                        value={queryBusqueda}
                        onChange={(e) => setQueryBusqueda(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                        placeholder="Buscar en conversación..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 text-xs h-8"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={handleBuscar}
                        className="bg-blis-red hover:bg-blis-red/90 text-white text-xs h-8 px-3"
                      >
                        Buscar
                      </Button>
                    </div>
                    {mensajesBuscados.length > 0 && (
                      <div className="px-4 pb-2">
                        <p className="text-[10px] text-gray-500">
                          {mensajesBuscados.length} resultado(s)
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mensajes fijados */}
              {mensajes.some((m) => m.fijado) && (
                <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-1">
                    <Pin className="w-3 h-3 text-blis-red" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Fijado
                    </span>
                  </div>
                  {mensajes
                    .filter((m) => m.fijado)
                    .map((msg) => (
                      <p key={msg.id} className="text-xs text-gray-300 truncate">
                        {msg.contenido}
                      </p>
                    ))}
                </div>
              )}

              {/* Mensajes */}
              <div className="flex-1 min-h-0 overflow-hidden relative">
                <ScrollArea className="h-full" ref={scrollRef}>
                  <div className="px-4 py-4">
                    {mensajes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                          <Sparkles className="w-6 h-6 text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-500">
                          {salaActiva.tipo === "ia"
                            ? "Hola, soy tu asistente virtual. ¿En qué puedo ayudarte?"
                            : "Inicia la conversación..."}
                        </p>
                      </div>
                    ) : (
                      <>
                        {(mostrarBusqueda && mensajesBuscados.length > 0
                          ? mensajesBuscados.reverse()
                          : mensajes
                        ).map((msg, i) => renderMensaje(msg, i))}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Indicador "escribiendo..." */}
              {escribiendoEn[salaActiva.id] && (
                <div className="px-4 pb-1">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Alguien está escribiendo...
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="px-4 py-3 border-t border-white/5 bg-[#0a0a0a]/90">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={mensajeInput}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Escribe un mensaje..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 pr-10 py-6 rounded-2xl"
                      disabled={enviando}
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <Popover>
                      <PopoverTrigger>
                        <button className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white">
                          <LayoutTemplate className="w-5 h-5" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="top"
                        align="end"
                        className="w-64 p-0 bg-[#111] border-white/10"
                      >
                        <div className="p-2">
                          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">
                            Respuestas rápidas
                          </h4>
                          <ScrollArea className="h-48">
                            <div className="space-y-1">
                              {plantillas.length === 0 && (
                                <p className="text-xs text-gray-600 px-2 py-2">
                                  Sin plantillas
                                </p>
                              )}
                              {plantillas.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => {
                                    setMensajeInput(p.contenido);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                  <p className="text-xs font-bold text-white">
                                    {p.titulo}
                                  </p>
                                  <p className="text-[10px] text-gray-500 truncate">
                                    {p.contenido}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                    />
                    <Tooltip>
                      <TooltipTrigger>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"
                        >
                          <Paperclip className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Adjuntar archivo</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger>
                        <button className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white">
                          <Smile className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Emoji</TooltipContent>
                    </Tooltip>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEnviar}
                      disabled={!mensajeInput.trim() || enviando}
                      className="p-4 bg-blis-red rounded-xl text-white hover:bg-blis-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] min-w-[48px] flex items-center justify-center"
                    >
                      {enviando ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Send className="w-6 h-6" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Vista visitante con historial */}
          {vista === "visitante" && (
            <motion.div
              key="visitante"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col"
            >
              <div className="flex-1 min-h-0 overflow-hidden relative">
                <ScrollArea className="h-full" ref={scrollRef}>
                  <div className="px-4 py-4">
                    {visitanteHistorial.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                          <Bot className="w-6 h-6 text-emerald-400" />
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {widgetConfig?.widget_mensaje_bienvenida || `¡Hola ${visitanteNombre || ""}! Bienvenido a BLIS Corp. ¿En qué podemos ayudarte hoy?`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {visitanteHistorial.map((msg, i) => renderMensaje(msg, i))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="px-4 py-3 border-t border-white/5">
                <div className="flex items-end gap-2">
                  <Input
                    value={visitanteMensaje}
                    onChange={(e) => setVisitanteMensaje(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleVisitanteEnviar();
                      }
                    }}
                    placeholder="Escribe tu mensaje..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 flex-1 py-6 rounded-2xl"
                    disabled={visitanteEnviando}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleVisitanteEnviar}
                    disabled={!visitanteMensaje.trim() || visitanteEnviando}
                    className="p-4 bg-blis-red rounded-xl text-white hover:bg-blis-red/90 transition-colors disabled:opacity-50 min-h-[48px] min-w-[48px] flex items-center justify-center"
                  >
                    {visitanteEnviando ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Send className="w-6 h-6" />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Call Modal */}
      {(callState.estado !== "idle" || llamadaEntranteId) && (
        <CallModal
          callState={callState}
          aceptarLlamada={aceptarLlamada}
          rechazarLlamada={rechazarLlamada}
          colgar={colgar}
          toggleMute={toggleMute}
          toggleVideo={toggleVideo}
          toggleScreenShare={toggleScreenShare}
          llamadaId={llamadaEntranteId || undefined}
          remoteUserName={
            salaActiva
              ? miembros.find((m) => m.user_id !== user?.id)?.user?.nombre || "Usuario"
              : undefined
          }
          onClose={() => {
            setLlamadaEntranteId(null);
            if (callState.estado !== "idle") colgar();
          }}
        />
      )}
    </div>
  );
}
