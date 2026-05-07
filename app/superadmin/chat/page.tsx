"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Users, Headphones, ArrowLeft, Send,
  Phone, Video, MoreVertical, Clock, CheckCircle2,
  AlertCircle, Loader2, UserPlus, Tag, Archive,
  Search, Pin, Bot, Sparkles, LayoutTemplate,
  Paperclip,   ArrowRightLeft, LogOut, Volume2, VolumeX,
  Smile, Check, CheckCheck
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/lib/chat/useChat";
import { useWebRTC } from "@/lib/chat/useWebRTC";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { ChatSala, ChatMensaje, ChatVisitante } from "@/lib/chat/types";
import { CallModal } from "@/components/chat/CallModal";

export default function ChatAdminPage() {
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
    cargarSalas,
    plantillas,
    subirArchivoChat,
    editarMensaje,
    eliminarMensaje,
    fijarMensaje,
    buscarMensajes,
    transferirSala,
    programarMensaje,
    escribiendoEn,
    setSalaActiva,
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

  const [mensajeInput, setMensajeInput] = useState("");
  const [visitantes, setVisitantes] = useState<ChatVisitante[]>([]);
  const [loadingVisitantes, setLoadingVisitantes] = useState(false);
  const [tabActiva, setTabActiva] = useState("activos");
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [queryBusqueda, setQueryBusqueda] = useState("");
  const [mensajesBuscados, setMensajesBuscados] = useState<ChatMensaje[]>([]);
  const [llamadaEntranteId, setLlamadaEntranteId] = useState<string | null>(null);
  const [agentesDisponibles, setAgentesDisponibles] = useState<any[]>([]);
  const [mostrarTransferir, setMostrarTransferir] = useState(false);
  const [programarModal, setProgramarModal] = useState(false);
  const [programarFecha, setProgramarFecha] = useState("");
  const [programarHora, setProgramarHora] = useState("");
  const [editandoMensaje, setEditandoMensaje] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [menuMensaje, setMenuMensaje] = useState<string | null>(null);
  const [sonidoActivado, setSonidoActivado] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Cargar agentes disponibles para transferencia
  const cargarAgentes = async () => {
    const supabase = (await import("@/lib/supabase")).getSupabase();
    if (!supabase) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, nombre, avatar_url, estado_chat")
        .eq("empresa_id", user?.empresa_id)
        .neq("id", user?.id)
        .in("rol", ["admin", "editor", "superadmin"]);
      setAgentesDisponibles(data || []);
    } catch (err) {
      console.error("Error cargando agentes:", err);
    }
  };

  useEffect(() => {
    cargarVisitantes();
    cargarAgentes();
    const interval = setInterval(() => {
      cargarVisitantes();
      cargarAgentes();
    }, 15000);
    return () => clearInterval(interval);
  }, [user?.empresa_id]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Notificaciones de sonido para nuevos mensajes
  useEffect(() => {
    if (!sonidoActivado || !salaActiva) return;
    const lastMsg = mensajes[mensajes.length - 1];
    if (lastMsg && lastMsg.user_id !== user?.id) {
      if (!audioRef.current) {
        audioRef.current = new Audio("/notification.mp3");
      }
      audioRef.current.play().catch(() => {});
    }
  }, [mensajes, salaActiva, sonidoActivado, user?.id]);

  // Escuchar llamadas entrantes
  useEffect(() => {
    if (!user) return;
    const setup = async () => {
      const supabase = (await import("@/lib/supabase")).getSupabase();
      if (!supabase) return;
      const channel = supabase
        .channel("chat-llamadas-admin")
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
    };
    setup();
  }, [user]);

  const handleEnviar = async () => {
    if (!mensajeInput.trim() || !salaActiva) return;
    const success = await enviarMensaje(salaActiva.id, mensajeInput, "texto");
    if (success) {
      setMensajeInput("");
      if (salaActiva.tipo === "ia") {
        const contexto = mensajes.slice(-10).map((m) => ({
          rol: m.tipo === "ia" ? "ia" : "usuario",
          contenido: m.contenido || "",
        }));
        fetch("/api/chat/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mensaje: mensajeInput,
            sala_id: salaActiva.id,
            contexto,
            empresa_id: user?.empresa_id,
          }),
        }).catch(console.error);
      }
    }
  };

  const handleBuscar = async () => {
    if (!salaActiva || !queryBusqueda.trim()) return;
    const resultados = await buscarMensajes(salaActiva.id, queryBusqueda);
    setMensajesBuscados(resultados);
  };

  const handleTransferir = async (agenteId: string) => {
    if (!salaActiva) return;
    await transferirSala(salaActiva.id, agenteId);
    setMostrarTransferir(false);
    setSalaActiva(null);
  };

  const handleProgramar = async () => {
    if (!salaActiva || !mensajeInput.trim() || !programarFecha || !programarHora) return;
    const fechaHora = new Date(`${programarFecha}T${programarHora}`).toISOString();
    await programarMensaje(salaActiva.id, mensajeInput, fechaHora);
    setProgramarModal(false);
    setMensajeInput("");
    setProgramarFecha("");
    setProgramarHora("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !salaActiva) return;
    await subirArchivoChat(salaActiva.id, file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const remoteUserId = salaActiva && miembros.length > 0
    ? miembros.find((m) => m.user_id !== user?.id)?.user_id
    : null;

  const salasFiltradas = salas.filter((s) => {
    if (tabActiva === "activos") return s.estado === "activo" && s.tipo !== "visitante";
    if (tabActiva === "visitantes") return s.tipo === "visitante" || s.tipo === "soporte";
    if (tabActiva === "ia") return s.tipo === "ia";
    if (tabActiva === "archivados") return s.estado === "archivado";
    return true;
  });

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

        <div className={`max-w-[70%] ${esMio ? "items-end" : "items-start"} flex flex-col relative`}>
          {!esMio && (
            <span className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-bold">
              {msg.user?.nombre || "Usuario"}
            </span>
          )}

          {editandoMensaje === msg.id ? (
            <div className="flex items-center gap-2 w-full">
              <Input
                value={editInput}
                onChange={(e) => setEditInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { editarMensaje(msg.id, editInput); setEditandoMensaje(null); }
                  if (e.key === "Escape") { setEditandoMensaje(null); setEditInput(""); }
                }}
                className="bg-white/5 border-white/10 text-white text-xs h-8"
                autoFocus
              />
              <Button size="sm" onClick={() => { editarMensaje(msg.id, editInput); setEditandoMensaje(null); }} className="bg-blis-red h-8 px-2">
                <Check className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <>
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed relative group ${
                esMio
                  ? "bg-blis-red text-white rounded-br-md"
                  : "bg-white/5 text-gray-200 border border-white/10 rounded-bl-md"
              }`}>
                {msg.editado && <span className="text-[9px] opacity-60 mr-1">(editado)</span>}
                {msg.tipo === "imagen" && msg.archivo_url ? (
                  <img src={msg.archivo_url} alt="" className="max-w-[200px] rounded-lg" />
                ) : msg.tipo === "video" && msg.archivo_url ? (
                  <video src={msg.archivo_url} controls className="max-w-[200px] rounded-lg" />
                ) : msg.tipo === "audio" && msg.archivo_url ? (
                  <audio src={msg.archivo_url} controls className="w-[200px]" />
                ) : msg.tipo === "archivo" && msg.archivo_url ? (
                  <a href={msg.archivo_url} target="_blank" className="underline flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />{msg.archivo_nombre}
                  </a>
                ) : (msg.contenido)}

                {esMio && (
                  <Popover open={menuMensaje === msg.id} onOpenChange={(o) => setMenuMensaje(o ? msg.id : null)}>
                    <PopoverTrigger>
                      <button className="absolute -top-2 -right-2 p-1 bg-[#1a1a1a] border border-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-3 h-3 text-gray-400" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-32 p-1 bg-[#111] border-white/10">
                      <button onClick={() => { setEditandoMensaje(msg.id); setEditInput(msg.contenido || ""); setMenuMensaje(null); }} className="w-full text-left px-2 py-1.5 text-xs text-gray-300 hover:bg-white/5 rounded-md flex items-center gap-2">
                        <Check className="w-3 h-3" />Editar
                      </button>
                      <button onClick={() => { fijarMensaje(msg.id, !msg.fijado); setMenuMensaje(null); }} className="w-full text-left px-2 py-1.5 text-xs text-gray-300 hover:bg-white/5 rounded-md flex items-center gap-2">
                        <Pin className="w-3 h-3" />{msg.fijado ? "Desfijar" : "Fijar"}
                      </button>
                      <button onClick={() => { eliminarMensaje(msg.id); setMenuMensaje(null); }} className="w-full text-left px-2 py-1.5 text-xs text-red-400 hover:bg-white/5 rounded-md flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" />Eliminar
                      </button>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[9px] text-gray-600">
                  {new Date(msg.creado_en).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                </span>
                {esMio && (
                  <span className="text-gray-600">
                    {msg.leido_por.length > 1 ? <CheckCheck className="w-3 h-3 text-emerald-500" /> : <Check className="w-3 h-3" />}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Chat Corporativo</h1>
            <p className="text-gray-400 text-sm mt-1">Gestiona conversaciones con clientes y miembros</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSonidoActivado(!sonidoActivado)}
              className={`p-2 rounded-lg transition-colors ${sonidoActivado ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-gray-500"}`}
            >
              {sonidoActivado ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">En línea</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Sidebar */}
          <div className="lg:col-span-1 bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
            <Tabs defaultValue="activos" className="h-full flex flex-col">
              <TabsList className="w-full bg-transparent border-b border-white/5 p-1">
                <TabsTrigger value="activos" className="flex-1 data-[state=active]:bg-blis-red/20 data-[state=active]:text-blis-red text-xs font-black uppercase tracking-wider">Activos</TabsTrigger>
                <TabsTrigger value="visitantes" className="flex-1 data-[state=active]:bg-blis-red/20 data-[state=active]:text-blis-red text-xs font-black uppercase tracking-wider">Visitantes</TabsTrigger>
                <TabsTrigger value="ia" className="flex-1 data-[state=active]:bg-blis-red/20 data-[state=active]:text-blis-red text-xs font-black uppercase tracking-wider">IA</TabsTrigger>
              </TabsList>

              <TabsContent value="activos" className="flex-1 m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-1">
                    {salasFiltradas.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageCircle className="w-8 h-8 text-gray-600 mb-3" />
                        <p className="text-sm text-gray-500">No hay chats activos</p>
                      </div>
                    ) : (
                      salasFiltradas.map((sala) => (
                        <button
                          key={sala.id}
                          onClick={() => unirseSala(sala.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left ${
                            salaActiva?.id === sala.id ? "bg-blis-red/10 border border-blis-red/20" : "hover:bg-white/5"
                          }`}
                        >
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-blis-red/20 text-blis-red text-xs font-black">
                                {sala.nombre?.[0] || "C"}
                              </AvatarFallback>
                            </Avatar>
                            {sala.tipo === "ia" && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-900" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-bold text-white truncate">{sala.nombre || "Chat"}</h5>
                              <Badge variant="secondary" className="text-[9px] bg-white/5">{sala.tipo}</Badge>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{sala.ultimo_mensaje?.contenido || "Sin mensajes"}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="visitantes" className="flex-1 m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-1">
                    {loadingVisitantes ? (
                      <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blis-red" /></div>
                    ) : visitantes.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="w-8 h-8 text-gray-600 mb-3" />
                        <p className="text-sm text-gray-500">No hay visitantes activos</p>
                      </div>
                    ) : (
                      visitantes.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => v.sala_id && unirseSala(v.sala_id)}
                          className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors text-left"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-amber-500/20 text-amber-500 text-xs font-black">{v.nombre?.[0] || "V"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-bold text-white truncate">{v.nombre}</h5>
                            <p className="text-xs text-gray-500">{v.pagina_origen || "Página principal"}</p>
                          </div>
                          <span className="text-[10px] text-gray-600">{new Date(v.ultima_actividad).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="ia" className="flex-1 m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-1">
                    {salas.filter((s) => s.tipo === "ia").length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Bot className="w-8 h-8 text-gray-600 mb-3" />
                        <p className="text-sm text-gray-500">Sin conversaciones IA</p>
                      </div>
                    ) : (
                      salas.filter((s) => s.tipo === "ia").map((sala) => (
                        <button
                          key={sala.id}
                          onClick={() => unirseSala(sala.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left ${
                            salaActiva?.id === sala.id ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-white/5"
                          }`}
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-emerald-500/20 text-emerald-500 text-xs font-black"><Bot className="w-4 h-4" /></AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-bold text-white truncate">{sala.nombre || "Asistente IA"}</h5>
                            <p className="text-xs text-gray-500 truncate">{sala.ultimo_mensaje?.contenido || "Sin mensajes"}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
            {salaActiva ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className={`font-black ${salaActiva.tipo === "ia" ? "bg-emerald-500/20 text-emerald-500" : "bg-blis-red/20 text-blis-red"}`}>
                        {salaActiva.tipo === "ia" ? <Bot className="w-5 h-5" /> : (salaActiva.nombre?.[0] || "C")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-bold text-white">{salaActiva.nombre || "Chat"}</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Activo</span>
                        {escribiendoEn[salaActiva.id] && <span className="text-[10px] text-emerald-400 ml-2">escribiendo...</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setMostrarBusqueda(!mostrarBusqueda); if (mostrarBusqueda) { setQueryBusqueda(""); setMensajesBuscados([]); } }}
                      className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${mostrarBusqueda ? "text-white bg-white/10" : "text-gray-400 hover:text-white"}`}
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    {remoteUserId && (
                      <>
                        <Tooltip><TooltipTrigger><button onClick={() => iniciarLlamada(remoteUserId, "audio")} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"><Phone className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Llamada</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger><button onClick={() => iniciarLlamada(remoteUserId, "video")} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"><Video className="w-4 h-4" /></button></TooltipTrigger><TooltipContent>Video</TooltipContent></Tooltip>
                      </>
                    )}
                    <Dialog open={mostrarTransferir} onOpenChange={setMostrarTransferir}>
                        <DialogTrigger>
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"><ArrowRightLeft className="w-4 h-4" /></button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#111] border-white/10 text-white">
                        <DialogHeader><DialogTitle className="text-sm font-black uppercase tracking-wider">Transferir conversación</DialogTitle></DialogHeader>
                        <div className="space-y-2 mt-4">
                          {agentesDisponibles.length === 0 && <p className="text-xs text-gray-500">No hay agentes disponibles</p>}
                          {agentesDisponibles.map((a) => (
                            <button key={a.id} onClick={() => handleTransferir(a.id)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                              <Avatar className="w-8 h-8"><AvatarFallback className="bg-blis-red/20 text-blis-red text-xs">{a.nombre?.[0]}</AvatarFallback></Avatar>
                              <div><p className="text-sm font-bold text-white">{a.nombre}</p><p className="text-[10px] text-gray-500">{a.estado_chat || "offline"}</p></div>
                            </button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Mensajes fijados */}
                {mensajes.some((m) => m.fijado) && (
                  <div className="px-6 py-2 border-b border-white/5 bg-white/[0.02] flex-shrink-0">
                    <div className="flex items-center gap-2 mb-1"><Pin className="w-3 h-3 text-blis-red" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fijado</span></div>
                    {mensajes.filter((m) => m.fijado).map((msg) => (
                      <p key={msg.id} className="text-xs text-gray-300 truncate">{msg.contenido}</p>
                    ))}
                  </div>
                )}

                {/* Búsqueda */}
                <AnimatePresence>
                  {mostrarBusqueda && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-b border-white/5 overflow-hidden flex-shrink-0">
                      <div className="px-6 py-2 flex gap-2">
                        <Input value={queryBusqueda} onChange={(e) => setQueryBusqueda(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleBuscar()} placeholder="Buscar en conversación..." className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 text-xs h-8" autoFocus />
                        <Button size="sm" onClick={handleBuscar} className="bg-blis-red hover:bg-blis-red/90 text-white text-xs h-8 px-3">Buscar</Button>
                      </div>
                      {mensajesBuscados.length > 0 && <div className="px-6 pb-2"><p className="text-[10px] text-gray-500">{mensajesBuscados.length} resultado(s)</p></div>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Messages */}
                <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
                  {mensajes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Headphones className="w-12 h-12 text-gray-600 mb-4" />
                      <p className="text-gray-500">Inicia la conversación con el cliente</p>
                    </div>
                  ) : (
                    <>
                      {(mostrarBusqueda && mensajesBuscados.length > 0 ? mensajesBuscados.reverse() : mensajes).map((msg, i) => renderMensaje(msg, i))}
                    </>
                  )}
                </ScrollArea>

                {/* Input */}
                <div className="px-6 py-4 border-t border-white/5 flex-shrink-0">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <Input
                        value={mensajeInput}
                        onChange={(e) => setMensajeInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEnviar(); } }}
                        placeholder="Escribe un mensaje..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 pr-10 py-6 rounded-2xl"
                        disabled={enviando}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Popover>
                        <PopoverTrigger><button className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"><LayoutTemplate className="w-5 h-5" /></button></PopoverTrigger>
                        <PopoverContent side="top" align="end" className="w-64 p-0 bg-[#111] border-white/10">
                          <div className="p-2">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Respuestas rápidas</h4>
                            <ScrollArea className="h-48">
                              <div className="space-y-1">
                                {plantillas.length === 0 && <p className="text-xs text-gray-600 px-2 py-2">Sin plantillas</p>}
                                {plantillas.map((p) => (
                                  <button key={p.id} onClick={() => setMensajeInput(p.contenido)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <p className="text-xs font-bold text-white">{p.titulo}</p>
                                    <p className="text-[10px] text-gray-500 truncate">{p.contenido}</p>
                                  </button>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" />
                      <Tooltip><TooltipTrigger><button onClick={() => fileInputRef.current?.click()} className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"><Paperclip className="w-5 h-5" /></button></TooltipTrigger><TooltipContent>Adjuntar</TooltipContent></Tooltip>
                      
                      <Tooltip><TooltipTrigger><button className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"><Smile className="w-5 h-5" /></button></TooltipTrigger><TooltipContent>Emoji</TooltipContent></Tooltip>
                      
                      <Dialog open={programarModal} onOpenChange={setProgramarModal}>
                        <DialogTrigger>
                          <button className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"><Clock className="w-5 h-5" /></button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#111] border-white/10 text-white">
                          <DialogHeader><DialogTitle className="text-sm font-black uppercase tracking-wider">Programar mensaje</DialogTitle></DialogHeader>
                          <div className="space-y-4 mt-4">
                            <p className="text-xs text-gray-400">Mensaje: <span className="text-white">{mensajeInput || "(vacío)"}</span></p>
                            <div className="grid grid-cols-2 gap-2">
                              <div><label className="text-[10px] text-gray-500 uppercase">Fecha</label><Input type="date" value={programarFecha} onChange={(e) => setProgramarFecha(e.target.value)} className="bg-white/5 border-white/10 text-white" /></div>
                              <div><label className="text-[10px] text-gray-500 uppercase">Hora</label><Input type="time" value={programarHora} onChange={(e) => setProgramarHora(e.target.value)} className="bg-white/5 border-white/10 text-white" /></div>
                            </div>
                            <Button onClick={handleProgramar} disabled={!mensajeInput.trim() || !programarFecha || !programarHora} className="w-full bg-blis-red hover:bg-blis-red/90">Programar envío</Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button onClick={handleEnviar} disabled={!mensajeInput.trim() || enviando} className="bg-blis-red hover:bg-blis-red/90 text-white rounded-xl px-4 py-6">
                        {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageCircle className="w-16 h-16 text-gray-700 mb-4" />
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">Selecciona una conversación</h3>
                <p className="text-sm text-gray-500 max-w-sm">Elige un chat de la lista para empezar a conversar con clientes o miembros.</p>
              </div>
            )}
          </div>
        </div>
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
          remoteUserName={salaActiva ? miembros.find((m) => m.user_id !== user?.id)?.user?.nombre || "Usuario" : undefined}
          onClose={() => { setLlamadaEntranteId(null); if (callState.estado !== "idle") colgar(); }}
        />
      )}
    </div>
  );
}
