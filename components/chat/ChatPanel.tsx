"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Minimize2, Send, Paperclip, Smile, Phone, Video,
  MoreVertical, ArrowLeft, User, Bot, Sparkles, MessageCircle,
  Clock, Check, CheckCheck, Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/lib/chat/useChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ChatSala, ChatMensaje } from "@/lib/chat/types";

interface ChatPanelProps {
  onClose: () => void;
  onMinimize?: () => void;
}

export function ChatPanel({ onClose, onMinimize }: ChatPanelProps) {
  const { user } = useAuth();
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
  } = useChat();

  const [vista, setVista] = useState<"lista" | "chat" | "visitante">("lista");
  const [mensajeInput, setMensajeInput] = useState("");
  const [visitanteNombre, setVisitanteNombre] = useState("");
  const [visitanteEmail, setVisitanteEmail] = useState("");
  const [visitanteMensaje, setVisitanteMensaje] = useState("");
  const [visitanteEnviando, setVisitanteEnviando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final de mensajes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Cambiar a vista chat cuando se une a una sala
  useEffect(() => {
    if (salaActiva) {
      setVista("chat");
    }
  }, [salaActiva]);

  const handleEnviar = async () => {
    if (!mensajeInput.trim() || !salaActiva) return;

    const success = await enviarMensaje(salaActiva.id, mensajeInput, "texto");
    if (success) {
      setMensajeInput("");
      setEscribiendo(salaActiva.id, false);
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

  // Visitor chat handler
  const handleVisitanteEnviar = async () => {
    if (!visitanteMensaje.trim() || !visitanteNombre.trim()) return;
    setVisitanteEnviando(true);

    try {
      // Create visitor session and send message via API
      const response = await fetch("/api/chat/visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: visitanteNombre,
          email: visitanteEmail,
          mensaje: visitanteMensaje,
          session_id: localStorage.getItem("blis_chat_session") || undefined,
          pagina_origen: window.location.pathname,
        }),
      });

      const data = await response.json();
      if (data.success && data.session_id) {
        localStorage.setItem("blis_chat_session", data.session_id);
        setVisitanteMensaje("");
      }
    } catch (err) {
      console.error("Error enviando mensaje de visitante:", err);
    } finally {
      setVisitanteEnviando(false);
    }
  };

  // Render message bubble
  const renderMensaje = (msg: ChatMensaje, index: number) => {
    const esMio = msg.user_id === user?.id;
    const esSistema = msg.tipo === "sistema" || msg.tipo === "ia";

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
          <AvatarImage src={msg.user?.avatar_url || undefined} />
          <AvatarFallback className="bg-blis-red/20 text-blis-red text-xs">
            {msg.user?.nombre?.[0] || "U"}
          </AvatarFallback>
        </Avatar>

        <div className={`max-w-[75%] ${esMio ? "items-end" : "items-start"} flex flex-col`}>
          {!esMio && (
            <span className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-bold">
              {msg.user?.nombre || "Usuario"}
            </span>
          )}

          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              esMio
                ? "bg-blis-red text-white rounded-br-md"
                : "bg-white/5 text-gray-200 border border-white/10 rounded-bl-md"
            }`}
          >
            {msg.contenido}
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
                {msg.leido_por.length > 1 ? (
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
    <div className="w-[380px] h-[600px] bg-[#0a0a0a] border border-white/10 rounded-[32px] shadow-2xl shadow-black/50 flex flex-col overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-[#0a0a0a]/90">
        <div className="flex items-center gap-3">
          {vista === "chat" && (
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
              ) : (
                <MessageCircle className="w-4 h-4 text-blis-red" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {vista === "chat" && salaActiva
                  ? salaActiva.nombre || "Chat"
                  : vista === "visitante"
                  ? "Soporte"
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
              <Tooltip>
                <TooltipTrigger>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                    <Phone className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Llamada de voz</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                    <Video className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Videollamada</TooltipContent>
              </Tooltip>
            </>
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
              className="h-full"
            >
              {!user ? (
                // Visitante - formulario inicial
                <div className="p-6 space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blis-red/20 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-blis-red" />
                    </div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider mb-2">
                      ¿Necesitas ayuda?
                    </h4>
                    <p className="text-sm text-gray-400">
                      Nuestro equipo está listo para asistirte. Inicia una conversación.
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
                      onClick={() => {
                        if (visitanteNombre.trim()) setVista("visitante");
                      }}
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
              ) : salas.length === 0 ? (
                // Usuario logueado sin conversaciones
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-600" />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                    Sin conversaciones
                  </h4>
                  <p className="text-xs text-gray-500">
                    Aún no tienes chats activos. Inicia una conversación con un miembro del equipo.
                  </p>
                </div>
              ) : (
                // Lista de salas
                <ScrollArea className="h-full">
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
              )}
            </motion.div>
          )}

          {/* Chat activo */}
          {vista === "chat" && salaActiva && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col"
            >
              {/* Mensajes */}
              <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
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
                  mensajes.map((msg, i) => renderMensaje(msg, i))
                )}
              </ScrollArea>

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
                    <Tooltip>
                      <TooltipTrigger>
                        <button className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white">
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
                      className="p-3 bg-blis-red rounded-xl text-white hover:bg-blis-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enviando ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Vista visitante */}
          {vista === "visitante" && (
            <motion.div
              key="visitante"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col"
            >
              <ScrollArea className="flex-1 px-4 py-4">
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-sm text-gray-400">
                    Hola {visitanteNombre}, un asesor te atenderá pronto.
                  </p>
                </div>
              </ScrollArea>

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
                    className="p-3 bg-blis-red rounded-xl text-white hover:bg-blis-red/90 transition-colors disabled:opacity-50"
                  >
                    {visitanteEnviando ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
