"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, Users, Headphones, ArrowLeft, Send,
  Phone, Video, MoreVertical, Clock, CheckCircle2,
  AlertCircle, Loader2, UserPlus, Tag, Archive,
  Search, Pin, Bot, Sparkles, LayoutTemplate,
  Paperclip, ArrowRightLeft, LogOut, Volume2, VolumeX,
  Smile, Check, CheckCheck, Settings, BarChart3,
  Inbox, Radio, UserCheck, Plus, ChevronRight, Edit3, Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/lib/chat/useChat";
import { useWebRTC } from "@/lib/chat/useWebRTC";
import { getSupabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import type { ChatSala, ChatMensaje, ChatVisitante } from "@/lib/chat/types";
import { CallModal } from "@/components/chat/CallModal";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";

export default function ChatAdminPage() {
  const { user } = useAuth();
  const { showNotification, sendPushToUser, requestPermission, isSubscribed } = usePushNotifications();
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
    crearSalaDirecta,
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

  const [seccionActiva, setSeccionActiva] = useState<"conversaciones" | "visitantes" | "agentes" | "configuracion">("conversaciones");
  const [mensajeInput, setMensajeInput] = useState("");
  const [visitantes, setVisitantes] = useState<ChatVisitante[]>([]);
  const [loadingVisitantes, setLoadingVisitantes] = useState(false);
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
  const [modalNuevoChat, setModalNuevoChat] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(false);
  const [visitanteSeleccionado, setVisitanteSeleccionado] = useState<ChatVisitante | null>(null);
  const [tipoAsignacion, setTipoAsignacion] = useState<"soporte" | "ventas" | "info">("info");
  const [agenteAsignado, setAgenteAsignado] = useState<string>("");
  const [contactosEmpresa, setContactosEmpresa] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const debounceSalas = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceVisitantes = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Configuración de chat
  const [chatConfig, setChatConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [configEditada, setConfigEditada] = useState<any>({});
  const [guardandoConfig, setGuardandoConfig] = useState(false);
  const [seccionConfig, setSeccionConfig] = useState<"general" | "ia" | "plantillas">("general");

  // Plantillas state
  const [listaPlantillas, setListaPlantillas] = useState<any[]>([]);
  const [loadingPlantillas, setLoadingPlantillas] = useState(false);
  const [editandoPlantilla, setEditandoPlantilla] = useState<any>(null);
  const [nuevaPlantilla, setNuevaPlantilla] = useState({ titulo: "", contenido: "", departamento: "general", atajo: "" });
  const [guardandoPlantilla, setGuardandoPlantilla] = useState(false);

  // Usuario remoto para llamadas
  const remoteUserId = salaActiva && miembros.length > 0
    ? miembros.find((m) => m.user_id !== user?.id)?.user_id
    : null;

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

  // Cargar equipo (agentes + contactos) en una sola query
  const cargarEquipo = async () => {
    const supabase = (await import("@/lib/supabase")).getSupabase();
    if (!supabase || !user?.empresa_id) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, nombre, avatar_url, estado_chat, rol")
        .eq("empresa_id", user.empresa_id)
        .order("nombre", { ascending: true });

      const todos = (data || []) as any[];
      setAgentesDisponibles(todos.filter((p) => ["admin", "editor", "superadmin"].includes(p.rol)));
      setContactosEmpresa(todos.filter((p) => p.id !== user.id));
    } catch (err) {
      console.error("Error cargando equipo:", err);
    }
  };

  // Cargar configuración de chat
  const cargarConfiguracion = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch("/api/chat/config");
      const data = await res.json();
      if (data.success) {
        setChatConfig(data.data);
        setConfigEditada(data.data);
      }
    } catch (err) {
      console.error("Error cargando configuración:", err);
    } finally {
      setLoadingConfig(false);
    }
  };

  // Cargar plantillas
  const cargarPlantillasAdmin = async () => {
    setLoadingPlantillas(true);
    try {
      const res = await fetch("/api/chat/templates");
      const data = await res.json();
      if (data.success) {
        setListaPlantillas(data.data || []);
      }
    } catch (err) {
      console.error("Error cargando plantillas:", err);
    } finally {
      setLoadingPlantillas(false);
    }
  };

  // Crear plantilla
  const crearPlantilla = async () => {
    if (!nuevaPlantilla.titulo.trim() || !nuevaPlantilla.contenido.trim()) return;
    setGuardandoPlantilla(true);
    try {
      const res = await fetch("/api/chat/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaPlantilla),
      });
      const data = await res.json();
      if (data.success) {
        setNuevaPlantilla({ titulo: "", contenido: "", departamento: "general", atajo: "" });
        await cargarPlantillasAdmin();
      }
    } catch (err) {
      console.error("Error creando plantilla:", err);
    } finally {
      setGuardandoPlantilla(false);
    }
  };

  // Actualizar plantilla
  const actualizarPlantilla = async () => {
    if (!editandoPlantilla?.id || !editandoPlantilla.titulo.trim() || !editandoPlantilla.contenido.trim()) return;
    setGuardandoPlantilla(true);
    try {
      const res = await fetch("/api/chat/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editandoPlantilla),
      });
      const data = await res.json();
      if (data.success) {
        setEditandoPlantilla(null);
        await cargarPlantillasAdmin();
      }
    } catch (err) {
      console.error("Error actualizando plantilla:", err);
    } finally {
      setGuardandoPlantilla(false);
    }
  };

  // Eliminar plantilla
  const eliminarPlantilla = async (id: string) => {
    if (!confirm("¿Eliminar esta plantilla?")) return;
    try {
      const res = await fetch(`/api/chat/templates?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await cargarPlantillasAdmin();
      }
    } catch (err) {
      console.error("Error eliminando plantilla:", err);
    }
  };

  // Guardar configuración de chat
  const guardarConfiguracion = async () => {
    setGuardandoConfig(true);
    try {
      const res = await fetch("/api/chat/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configEditada),
      });
      const data = await res.json();
      if (data.success) {
        setChatConfig(data.data);
        alert("Configuración guardada correctamente");
      }
    } catch (err) {
      console.error("Error guardando configuración:", err);
      alert("Error al guardar");
    } finally {
      setGuardandoConfig(false);
    }
  };

  useEffect(() => {
    cargarVisitantes();
    cargarEquipo();
    cargarConfiguracion();
    cargarPlantillasAdmin();
  }, [user?.empresa_id]);

  // Auto-scroll
  useEffect(() => {
    scrollToBottom();
    const t = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(t);
  }, [mensajes, scrollToBottom]);

  // Notificaciones de sonido + push
  useEffect(() => {
    if (!salaActiva) return;
    const lastMsg = mensajes[mensajes.length - 1];
    if (lastMsg && lastMsg.user_id !== user?.id) {
      // Sonido
      if (sonidoActivado) {
        if (!audioRef.current) {
          audioRef.current = new Audio("/notification.mp3");
        }
        audioRef.current.play().catch(() => {});
      }
      // Notificación push con nombre del remitente
      if (lastMsg.contenido) {
        const senderName = ("user" in lastMsg ? lastMsg.user?.nombre : undefined) || "Usuario";
        showNotification(`${senderName} envió un mensaje`, {
          body: lastMsg.contenido.slice(0, 150),
          tag: lastMsg.sala_id,
          data: { url: "/superadmin/chat" },
        });
      }
    }
  }, [mensajes, salaActiva, sonidoActivado, user?.id, showNotification]);

  // Auto-solicitar permisos de notificación push
  useEffect(() => {
    if (user && !isSubscribed && Notification.permission === "default") {
      const t = setTimeout(() => {
        requestPermission();
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [user, isSubscribed, requestPermission]);

  // Realtime: recargar salas y visitantes con debounce 500ms
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel(`chat-admin-realtime`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_salas" }, () => {
        if (debounceSalas.current) clearTimeout(debounceSalas.current);
        debounceSalas.current = setTimeout(() => cargarSalas(), 500);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_visitantes" }, () => {
        if (debounceVisitantes.current) clearTimeout(debounceVisitantes.current);
        debounceVisitantes.current = setTimeout(() => cargarVisitantes(), 500);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (debounceSalas.current) clearTimeout(debounceSalas.current);
      if (debounceVisitantes.current) clearTimeout(debounceVisitantes.current);
    };
  }, [user, cargarSalas, cargarVisitantes]);

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

  const handleNuevoChatContacto = async (contactoId: string) => {
    const salaId = await crearSalaDirecta(contactoId);
    if (salaId) {
      await unirseSala(salaId);
      setModalNuevoChat(false);
      setSeccionActiva("conversaciones");
    }
  };

  const handleAtenderVisitante = async (visitante: ChatVisitante) => {
    if (!visitante.sala_id) return;
    setVisitanteSeleccionado(visitante);
    setTipoAsignacion("info");
    setAgenteAsignado("");
    setModalAsignar(true);
  };

  const confirmarAsignacion = async () => {
    if (!visitanteSeleccionado?.sala_id || !agenteAsignado) return;
    const supabase = (await import("@/lib/supabase")).getSupabase();
    if (!supabase) return;

    try {
      // 1. Actualizar tipo de sala
      await supabase
        .from("chat_salas")
        .update({ tipo: tipoAsignacion, asignado_a: agenteAsignado })
        .eq("id", visitanteSeleccionado.sala_id);

      // 2. Agregar agente como miembro admin
      await supabase.from("chat_miembros").upsert({
        sala_id: visitanteSeleccionado.sala_id,
        user_id: agenteAsignado,
        rol_sala: "admin",
      }, { onConflict: "sala_id,user_id" });

      // 3. Agregar al admin actual como observador
      if (user?.id && user.id !== agenteAsignado) {
        await supabase.from("chat_miembros").upsert({
          sala_id: visitanteSeleccionado.sala_id,
          user_id: user.id,
          rol_sala: "observador",
        }, { onConflict: "sala_id,user_id" });
      }

      // 4. Unirse a la sala
      await unirseSala(visitanteSeleccionado.sala_id);
      setModalAsignar(false);
      setSeccionActiva("conversaciones");
    } catch (err) {
      console.error("Error asignando visitante:", err);
      alert("Error al asignar la conversación");
    }
  };

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

  // Stats
  const stats = {
    conversacionesActivas: salas.filter((s) => s.estado === "activo").length,
    visitantesActivos: visitantes.filter((v) => v.estado === "activo").length,
    agentesOnline: agentesDisponibles.filter((a) => a.estado_chat === "online").length,
    mensajesHoy: 0, // Would need date filtering
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6 h-screen flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 flex-shrink-0 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Centro de Chat</h1>
            <p className="text-gray-400 text-sm mt-1">Gestiona conversaciones, visitantes y agentes</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => { setModalNuevoChat(true); cargarEquipo(); }}
              className="bg-blis-red hover:bg-blis-red/90 text-white font-black uppercase tracking-wider text-xs"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Chat
            </Button>
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

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 flex-shrink-0">
          {[
            { label: "Conversaciones", value: stats.conversacionesActivas, icon: Inbox, color: "text-blis-red" },
            { label: "Visitantes", value: stats.visitantesActivos, icon: Users, color: "text-amber-400" },
            { label: "Agentes Online", value: stats.agentesOnline, icon: UserCheck, color: "text-emerald-400" },
            { label: "Total Agentes", value: agentesDisponibles.length, icon: Radio, color: "text-blue-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-2xl font-black">{stat.value}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 min-h-0">
          {/* Internal Sidebar */}
          <div className={`md:col-span-1 bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden flex flex-col ${salaActiva ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 space-y-1">
              {[
                { id: "conversaciones" as const, label: "Conversaciones", icon: Inbox, count: salas.filter((s) => s.estado === "activo").length },
                { id: "visitantes" as const, label: "Visitantes", icon: Users, count: visitantes.filter((v) => v.estado === "activo").length },
                { id: "agentes" as const, label: "Agentes", icon: UserCheck, count: agentesDisponibles.filter((a) => a.estado_chat === "online").length },
                { id: "configuracion" as const, label: "Configuración", icon: Settings },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSeccionActiva(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left ${
                    seccionActiva === item.id
                      ? "bg-blis-red/10 border border-blis-red/20 text-white"
                      : "hover:bg-white/5 text-gray-400"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${seccionActiva === item.id ? "text-blis-red" : ""}`} />
                  <span className="text-sm font-bold flex-1">{item.label}</span>
                  {"count" in item && (item as any).count > 0 && (
                    <Badge className="bg-blis-red text-white text-[10px]">{item.count}</Badge>
                  )}
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Mini list based on section */}
            <div className="flex-1 overflow-hidden border-t border-white/5">
              {seccionActiva === "conversaciones" && (
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-1">
                    {salas.length === 0 ? (
                      <p className="text-xs text-gray-600 text-center py-8">No hay conversaciones activas</p>
                    ) : (
                      salas.map((sala) => (
                        <button
                          key={sala.id}
                          onClick={() => unirseSala(sala.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left ${
                            salaActiva?.id === sala.id ? "bg-blis-red/10 border border-blis-red/20" : "hover:bg-white/5"
                          }`}
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-blis-red/20 text-blis-red text-xs font-black">
                              {sala.nombre?.[0] || "C"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-bold text-white truncate">{sala.nombre || "Chat"}</h5>
                            <p className="text-xs text-gray-500 truncate">{sala.ultimo_mensaje?.contenido || "Sin mensajes"}</p>
                          </div>
                          <Badge variant="secondary" className="text-[9px] bg-white/5">{sala.tipo}</Badge>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}

              {seccionActiva === "visitantes" && (
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-1">
                    {loadingVisitantes ? (
                      <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blis-red" /></div>
                    ) : visitantes.length === 0 ? (
                      <p className="text-xs text-gray-600 text-center py-8">No hay visitantes activos</p>
                    ) : (
                      visitantes.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => handleAtenderVisitante(v)}
                          className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-colors text-left"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-amber-500/20 text-amber-500 text-xs font-black">{v.nombre?.[0] || "V"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-bold text-white truncate">{v.nombre}</h5>
                            <p className="text-xs text-gray-500">{v.pagina_origen || "Web"}</p>
                          </div>
                          <span className="text-[10px] bg-blis-red/20 text-blis-red px-2 py-1 rounded-full">Atender</span>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}

              {seccionActiva === "agentes" && (
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-1">
                    {agentesDisponibles.length === 0 ? (
                      <p className="text-xs text-gray-600 text-center py-8">No hay agentes registrados</p>
                    ) : (
                      agentesDisponibles.map((a) => (
                        <div key={a.id} className="w-full flex items-center gap-3 p-3 rounded-2xl text-left">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={a.avatar_url} />
                              <AvatarFallback className="bg-blis-red/20 text-blis-red text-xs font-black">{a.nombre?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                              a.estado_chat === "online" ? "bg-emerald-500" : a.estado_chat === "ausente" ? "bg-amber-500" : "bg-gray-600"
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-bold text-white truncate">{a.nombre}</h5>
                            <p className="text-xs text-gray-500 capitalize">{a.rol} • {a.estado_chat || "offline"}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}

              {seccionActiva === "configuracion" && (
                <div className="p-4 space-y-3 h-full overflow-y-auto">
                  {loadingConfig ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-blis-red" />
                    </div>
                  ) : (
                    <>
                      {/* Tabs de config */}
                      <div className="flex border-b border-white/5 mb-4">
                        <button
                          onClick={() => setSeccionConfig("general")}
                          className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                            seccionConfig === "general"
                              ? "text-blis-red border-b-2 border-blis-red"
                              : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          General
                        </button>
                        <button
                          onClick={() => setSeccionConfig("ia")}
                          className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                            seccionConfig === "ia"
                              ? "text-blis-red border-b-2 border-blis-red"
                              : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          Entrenamiento IA
                        </button>
                        <button
                          onClick={() => setSeccionConfig("plantillas")}
                          className={`flex-1 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                            seccionConfig === "plantillas"
                              ? "text-blis-red border-b-2 border-blis-red"
                              : "text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          Plantillas
                        </button>
                      </div>

                      {seccionConfig === "general" && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">Mensaje de bienvenida</label>
                            <textarea
                              value={configEditada.widget_mensaje_bienvenida || ""}
                              onChange={(e) => setConfigEditada({ ...configEditada, widget_mensaje_bienvenida: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 resize-none"
                              rows={3}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">Mensaje fuera de horario</label>
                            <textarea
                              value={configEditada.widget_mensaje_fuera_horario || ""}
                              onChange={(e) => setConfigEditada({ ...configEditada, widget_mensaje_fuera_horario: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 resize-none"
                              rows={3}
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <div>
                              <p className="text-sm text-white font-bold">Asignación automática</p>
                              <p className="text-xs text-gray-400">Asignar primer agente online automáticamente</p>
                            </div>
                            <Switch
                              checked={!!configEditada.derivacion_automatica}
                              onCheckedChange={(v) => setConfigEditada({ ...configEditada, derivacion_automatica: v })}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">Derivar después de (mensajes)</label>
                            <Input
                              type="number"
                              value={configEditada.derivacion_despues_mensajes || 3}
                              onChange={(e) => setConfigEditada({ ...configEditada, derivacion_despues_mensajes: parseInt(e.target.value) })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">Palabras clave para derivar (separadas por coma)</label>
                            <Input
                              value={Array.isArray(configEditada.palabras_clave_derivacion) ? configEditada.palabras_clave_derivacion.join(", ") : ""}
                              onChange={(e) => setConfigEditada({ ...configEditada, palabras_clave_derivacion: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                              className="bg-white/5 border-white/10 text-white"
                              placeholder="asesor, agente, humano, persona"
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">Páginas donde aparece el widget (separadas por coma)</label>
                            <Input
                              value={Array.isArray(configEditada.paginas_widget) ? configEditada.paginas_widget.join(", ") : ""}
                              onChange={(e) => setConfigEditada({ ...configEditada, paginas_widget: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                              className="bg-white/5 border-white/10 text-white"
                              placeholder="/, /tienda, /blog"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <div>
                              <p className="text-sm text-white font-bold">Permitir archivos</p>
                              <p className="text-xs text-gray-400">Adjuntar imágenes y documentos</p>
                            </div>
                            <Switch
                              checked={!!configEditada.permitir_archivos}
                              onCheckedChange={(v) => setConfigEditada({ ...configEditada, permitir_archivos: v })}
                            />
                          </div>

                          <Button
                            onClick={guardarConfiguracion}
                            disabled={guardandoConfig}
                            className="w-full bg-blis-red hover:bg-blis-red/90 text-white font-black uppercase tracking-wider text-xs"
                          >
                            {guardandoConfig ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Guardar Configuración
                          </Button>
                        </div>
                      )}
                      {seccionConfig === "ia" && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <div>
                              <p className="text-sm text-white font-bold">Bot IA activo</p>
                              <p className="text-xs text-gray-400">Responder automáticamente con IA</p>
                            </div>
                            <Switch
                              checked={!!configEditada.ia_activa}
                              onCheckedChange={(v) => setConfigEditada({ ...configEditada, ia_activa: v })}
                            />
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">Modelo de IA</label>
                            <select
                              value={configEditada.ia_modelo || "gemini-2.5-flash-preview-05-20"}
                              onChange={(e) => setConfigEditada({ ...configEditada, ia_modelo: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                            >
                              <option value="gemini-2.5-flash-preview-05-20">Gemini 2.5 Flash</option>
                              <option value="gemini-2.5-pro-preview-05-20">Gemini 2.5 Pro</option>
                              <option value="gpt-4o-mini">GPT-4o Mini</option>
                              <option value="gpt-4o">GPT-4o</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">Prompt del sistema (instrucciones para la IA)</label>
                            <textarea
                              value={configEditada.ia_prompt_sistema || ""}
                              onChange={(e) => setConfigEditada({ ...configEditada, ia_prompt_sistema: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 resize-none"
                              rows={6}
                              placeholder="Eres un asistente virtual amigable..."
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Define la personalidad, conocimientos y reglas de respuesta de la IA.</p>
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">Máximo de tokens por respuesta</label>
                            <Input
                              type="number"
                              value={configEditada.ia_max_tokens || 1024}
                              onChange={(e) => setConfigEditada({ ...configEditada, ia_max_tokens: parseInt(e.target.value) })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>

                          <Button
                            onClick={guardarConfiguracion}
                            disabled={guardandoConfig}
                            className="w-full bg-emerald-600 hover:bg-emerald-600/90 text-white font-black uppercase tracking-wider text-xs"
                          >
                            {guardandoConfig ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Guardar Entrenamiento IA
                          </Button>
                        </div>
                      )}
                      {seccionConfig === "plantillas" && (
                        <div className="space-y-4">
                          {/* Crear nueva plantilla */}
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                              {editandoPlantilla ? "Editar Plantilla" : "Nueva Plantilla"}
                            </h4>
                            <Input
                              value={editandoPlantilla ? editandoPlantilla.titulo : nuevaPlantilla.titulo}
                              onChange={(e) =>
                                editandoPlantilla
                                  ? setEditandoPlantilla({ ...editandoPlantilla, titulo: e.target.value })
                                  : setNuevaPlantilla({ ...nuevaPlantilla, titulo: e.target.value })
                              }
                              placeholder="Título de la plantilla"
                              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 text-sm"
                            />
                            <textarea
                              value={editandoPlantilla ? editandoPlantilla.contenido : nuevaPlantilla.contenido}
                              onChange={(e) =>
                                editandoPlantilla
                                  ? setEditandoPlantilla({ ...editandoPlantilla, contenido: e.target.value })
                                  : setNuevaPlantilla({ ...nuevaPlantilla, contenido: e.target.value })
                              }
                              placeholder="Contenido del mensaje..."
                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-gray-600 resize-none"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Input
                                value={editandoPlantilla ? editandoPlantilla.atajo || "" : nuevaPlantilla.atajo}
                                onChange={(e) =>
                                  editandoPlantilla
                                    ? setEditandoPlantilla({ ...editandoPlantilla, atajo: e.target.value })
                                    : setNuevaPlantilla({ ...nuevaPlantilla, atajo: e.target.value })
                                }
                                placeholder="Atajo (ej: /saludo)"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 text-sm flex-1"
                              />
                              <select
                                value={editandoPlantilla ? editandoPlantilla.departamento || "general" : nuevaPlantilla.departamento}
                                onChange={(e) =>
                                  editandoPlantilla
                                    ? setEditandoPlantilla({ ...editandoPlantilla, departamento: e.target.value })
                                    : setNuevaPlantilla({ ...nuevaPlantilla, departamento: e.target.value })
                                }
                                className="bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-white"
                              >
                                <option value="general">General</option>
                                <option value="ventas">Ventas</option>
                                <option value="soporte">Soporte</option>
                                <option value="onboarding">Onboarding</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              {editandoPlantilla ? (
                                <>
                                  <Button
                                    onClick={actualizarPlantilla}
                                    disabled={guardandoPlantilla}
                                    className="flex-1 bg-blis-red hover:bg-blis-red/90 text-white font-black uppercase tracking-wider text-xs"
                                  >
                                    {guardandoPlantilla ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Actualizar
                                  </Button>
                                  <Button
                                    onClick={() => setEditandoPlantilla(null)}
                                    variant="outline"
                                    className="border-white/10 text-gray-300 hover:bg-white/5"
                                  >
                                    Cancelar
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  onClick={crearPlantilla}
                                  disabled={guardandoPlantilla || !nuevaPlantilla.titulo.trim() || !nuevaPlantilla.contenido.trim()}
                                  className="w-full bg-blis-red hover:bg-blis-red/90 text-white font-black uppercase tracking-wider text-xs"
                                >
                                  {guardandoPlantilla ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                  Crear Plantilla
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Lista de plantillas */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider px-1">
                              Plantillas guardadas ({listaPlantillas.length})
                            </h4>
                            {loadingPlantillas ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-blis-red" />
                              </div>
                            ) : listaPlantillas.length === 0 ? (
                              <p className="text-xs text-gray-500 text-center py-8">No hay plantillas guardadas</p>
                            ) : (
                              listaPlantillas.map((p) => (
                                <div
                                  key={p.id}
                                  className="bg-white/5 border border-white/10 rounded-xl p-3 group hover:bg-white/[0.07] transition-colors"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-bold text-white truncate">{p.titulo}</p>
                                        <span className="text-[9px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded uppercase">
                                          {p.departamento}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-400 line-clamp-2">{p.contenido}</p>
                                      {p.atajo && (
                                        <p className="text-[10px] text-gray-500 mt-1">Atajo: {p.atajo}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => setEditandoPlantilla(p)}
                                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                                        title="Editar"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => eliminarPlantilla(p.id)}
                                        className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400"
                                        title="Eliminar"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`md:col-span-3 bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden flex flex-col ${salaActiva ? 'flex' : 'hidden md:flex'}`}>
            {salaActiva ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/5 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSalaActiva(null)}
                      className="md:hidden p-2 hover:bg-white/5 rounded-lg text-gray-400"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
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
                <div className="flex-1 min-h-0 overflow-y-auto" ref={scrollRef}>
                    <div className="px-4 md:px-6 py-4">
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
                    </div>
                  </div>

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

                      <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file || !salaActiva) return; subirArchivoChat(salaActiva.id, file); if (fileInputRef.current) fileInputRef.current.value = ""; }} accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" />
                      <Tooltip><TooltipTrigger><button onClick={() => fileInputRef.current?.click()} className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-gray-400 hover:text-white"><Paperclip className="w-5 h-5" /></button></TooltipTrigger><TooltipContent>Adjuntar</TooltipContent></Tooltip>
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
                <p className="text-sm text-gray-500 max-w-sm">Elige un chat del panel izquierdo o haz clic en "Nuevo Chat" para empezar.</p>
                <Button
                  onClick={() => { setModalNuevoChat(true); cargarEquipo(); }}
                  className="mt-6 bg-blis-red hover:bg-blis-red/90 text-white font-black uppercase tracking-wider text-xs"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Iniciar Conversación
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nuevo Chat Modal */}
      <Dialog open={modalNuevoChat} onOpenChange={setModalNuevoChat}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle className="text-sm font-black uppercase tracking-wider">Nueva conversación</DialogTitle></DialogHeader>
          <div className="mt-4 space-y-3 max-h-[400px] overflow-y-auto">
            {contactosEmpresa.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No hay contactos disponibles</p>
            ) : (
              contactosEmpresa.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleNuevoChatContacto(c.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={c.avatar_url} />
                      <AvatarFallback className="bg-blis-red/20 text-blis-red text-xs font-black">{c.nombre?.[0]}</AvatarFallback>
                    </Avatar>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#111] ${
                      c.estado_chat === "online" ? "bg-emerald-500" : "bg-gray-600"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{c.nombre}</p>
                    <p className="text-[10px] text-gray-500 capitalize">{c.rol}</p>
                  </div>
                  <MessageCircle className="w-4 h-4 text-gray-600" />
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Asignar Visitante */}
      <Dialog open={modalAsignar} onOpenChange={setModalAsignar}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle className="text-sm font-black uppercase tracking-wider">Asignar conversación</DialogTitle></DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">Visitante</label>
              <p className="text-sm text-white font-bold">{visitanteSeleccionado?.nombre}</p>
              <p className="text-xs text-gray-500">{visitanteSeleccionado?.pagina_origen || "Web"}</p>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">Tipo de conversación</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "info", label: "Info General" },
                  { id: "ventas", label: "Ventas" },
                  { id: "soporte", label: "Soporte" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTipoAsignacion(t.id as any)}
                    className={`p-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                      tipoAsignacion === t.id
                        ? "bg-blis-red text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider font-bold block mb-2">Asignar a agente</label>
              {agentesDisponibles.length === 0 ? (
                <p className="text-xs text-gray-500">No hay agentes disponibles</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {agentesDisponibles.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAgenteAsignado(a.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                        agenteAsignado === a.id ? "bg-blis-red/20 border border-blis-red/30" : "hover:bg-white/5"
                      }`}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={a.avatar_url} />
                        <AvatarFallback className="bg-blis-red/20 text-blis-red text-xs font-black">{a.nombre?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{a.nombre}</p>
                        <p className="text-[10px] text-gray-500">{a.estado_chat === "online" ? "En línea" : "Desconectado"}</p>
                      </div>
                      {agenteAsignado === a.id && <CheckCircle2 className="w-4 h-4 text-blis-red" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={confirmarAsignacion}
              disabled={!agenteAsignado}
              className="w-full bg-blis-red hover:bg-blis-red/90 text-white font-black uppercase tracking-wider text-xs"
            >
              Asignar y Atender
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
