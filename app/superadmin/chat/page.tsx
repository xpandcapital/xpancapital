"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Users, Headphones, ArrowLeft, Send,
  Phone, Video, MoreVertical, Clock, CheckCircle2,
  AlertCircle, Loader2, UserPlus, Tag, Archive
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/lib/chat/useChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ChatSala, ChatMensaje, ChatVisitante } from "@/lib/chat/types";

export default function ChatAdminPage() {
  const { user } = useAuth();
  const {
    salas,
    salaActiva,
    mensajes,
    loading,
    enviando,
    unirseSala,
    enviarMensaje,
    cargarSalas,
  } = useChat();

  const [vista, setVista] = useState<"lista" | "chat">("lista");
  const [mensajeInput, setMensajeInput] = useState("");
  const [visitantes, setVisitantes] = useState<ChatVisitante[]>([]);
  const [loadingVisitantes, setLoadingVisitantes] = useState(false);
  const [tabActiva, setTabActiva] = useState("activos");

  // Cargar visitantes activos
  const cargarVisitantes = async () => {
    setLoadingVisitantes(true);
    try {
      const res = await fetch("/api/chat/visitor?estado=activo");
      const data = await res.json();
      if (data.success) {
        setVisitantes(data.data || []);
      }
    } catch (err) {
      console.error("Error cargando visitantes:", err);
    } finally {
      setLoadingVisitantes(false);
    }
  };

  useEffect(() => {
    cargarVisitantes();
    const interval = setInterval(cargarVisitantes, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleEnviar = async () => {
    if (!mensajeInput.trim() || !salaActiva) return;

    const success = await enviarMensaje(salaActiva.id, mensajeInput, "texto");
    if (success) {
      setMensajeInput("");
    }
  };

  const renderMensaje = (msg: ChatMensaje, index: number) => {
    const esMio = msg.user_id === user?.id;
    const esSistema = msg.tipo === "sistema" || msg.tipo === "ia";

    if (esSistema) {
      return (
        <div key={msg.id} className="flex justify-center my-2">
          <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-xs text-gray-400">
            {msg.contenido}
          </div>
        </div>
      );
    }

    return (
      <div key={msg.id} className={`flex gap-3 mb-3 ${esMio ? "flex-row-reverse" : ""}`}>
        <Avatar className="w-8 h-8">
          <AvatarImage src={msg.user?.avatar_url || undefined} />
          <AvatarFallback className="bg-blis-red/20 text-blis-red text-xs">
            {msg.user?.nombre?.[0] || "U"}
          </AvatarFallback>
        </Avatar>

        <div className={`max-w-[70%] ${esMio ? "items-end" : "items-start"} flex flex-col`}>
          {!esMio && (
            <span className="text-[10px] text-gray-500 mb-0.5">
              {msg.user?.nombre || "Visitante"}
            </span>
          )}
          <div className={`px-3 py-2 rounded-xl text-sm ${
            esMio
              ? "bg-blis-red text-white rounded-br-sm"
              : "bg-white/5 text-gray-200 border border-white/10 rounded-bl-sm"
          }`}>
            {msg.contenido}
          </div>
          <span className="text-[9px] text-gray-600 mt-0.5">
            {new Date(msg.creado_en).toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">
              Chat Corporativo
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Gestiona conversaciones con clientes y miembros
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                En línea
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar - Lista de conversaciones */}
          <div className="lg:col-span-1 bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden">
            <Tabs defaultValue="activos" className="h-full flex flex-col">
              <TabsList className="w-full bg-transparent border-b border-white/5 p-1">
                <TabsTrigger
                  value="activos"
                  className="flex-1 data-[state=active]:bg-blis-red/20 data-[state=active]:text-blis-red text-xs font-black uppercase tracking-wider"
                >
                  Activos
                </TabsTrigger>
                <TabsTrigger
                  value="visitantes"
                  className="flex-1 data-[state=active]:bg-blis-red/20 data-[state=active]:text-blis-red text-xs font-black uppercase tracking-wider"
                >
                  Visitantes
                </TabsTrigger>
                <TabsTrigger
                  value="archivados"
                  className="flex-1 data-[state=active]:bg-blis-red/20 data-[state=active]:text-blis-red text-xs font-black uppercase tracking-wider"
                >
                  Archivados
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activos" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-1">
                    {salas.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageCircle className="w-8 h-8 text-gray-600 mb-3" />
                        <p className="text-sm text-gray-500">No hay chats activos</p>
                      </div>
                    ) : (
                      salas.map((sala) => (
                        <button
                          key={sala.id}
                          onClick={() => unirseSala(sala.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left ${
                            salaActiva?.id === sala.id
                              ? "bg-blis-red/10 border border-blis-red/20"
                              : "hover:bg-white/5"
                          }`}
                        >
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-blis-red/20 text-blis-red text-xs font-black">
                                {sala.nombre?.[0] || "C"}
                              </AvatarFallback>
                            </Avatar>
                            {sala.tipo === "visitante" && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-zinc-900" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-bold text-white truncate">
                                {sala.nombre || "Chat"}
                              </h5>
                              <Badge variant="secondary" className="text-[9px] bg-white/5">
                                {sala.tipo}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {sala.ultimo_mensaje?.contenido || "Sin mensajes"}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="visitantes" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-1">
                    {loadingVisitantes ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-blis-red" />
                      </div>
                    ) : visitantes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="w-8 h-8 text-gray-600 mb-3" />
                        <p className="text-sm text-gray-500">No hay visitantes activos</p>
                      </div>
                    ) : (
                      visitantes.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => unirseSala(v.sala_id)}
                          className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors text-left"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-amber-500/20 text-amber-500 text-xs font-black">
                              {v.nombre?.[0] || "V"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-bold text-white truncate">
                              {v.nombre}
                            </h5>
                            <p className="text-xs text-gray-500">
                              {v.pagina_origen || "Página principal"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-600" />
                            <span className="text-[10px] text-gray-600">
                              {new Date(v.ultima_actividad).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="archivados" className="flex-1 m-0">
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Archive className="w-8 h-8 text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500">No hay chats archivados</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
            {salaActiva ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blis-red/20 text-blis-red font-black">
                        {salaActiva.nombre?.[0] || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {salaActiva.nombre || "Chat"}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                          Activo
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                      <Video className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 px-6 py-4">
                  {mensajes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Headphones className="w-12 h-12 text-gray-600 mb-4" />
                      <p className="text-gray-500">
                        Inicia la conversación con el cliente
                      </p>
                    </div>
                  ) : (
                    mensajes.map((msg, i) => renderMensaje(msg, i))
                  )}
                </ScrollArea>

                {/* Input */}
                <div className="px-6 py-4 border-t border-white/5">
                  <div className="flex items-end gap-2">
                    <Input
                      value={mensajeInput}
                      onChange={(e) => setMensajeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleEnviar();
                        }
                      }}
                      placeholder="Escribe un mensaje..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 flex-1 py-6 rounded-2xl"
                      disabled={enviando}
                    />
                    <Button
                      onClick={handleEnviar}
                      disabled={!mensajeInput.trim() || enviando}
                      className="bg-blis-red hover:bg-blis-red/90 text-white rounded-xl px-6 py-6"
                    >
                      {enviando ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageCircle className="w-16 h-16 text-gray-700 mb-4" />
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">
                  Selecciona una conversación
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Elige un chat de la lista para empezar a conversar con clientes o miembros.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
