"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { ChatSala, ChatMensaje, ChatMiembro, ChatPresencia, ChatConfig, ChatPlantilla } from "./types";

const PAGE_SIZE = 50;

export function useChat() {
  const { user } = useAuth();
  const [salas, setSalas] = useState<ChatSala[]>([]);
  const [salaActiva, setSalaActiva] = useState<ChatSala | null>(null);
  const [mensajes, setMensajes] = useState<ChatMensaje[]>([]);
  const [miembros, setMiembros] = useState<ChatMiembro[]>([]);
  const [presencia, setPresencia] = useState<Record<string, ChatPresencia>>({});
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [tieneMasMensajes, setTieneMasMensajes] = useState(false);
  const [escribiendoEn, setEscribiendoEn] = useState<Record<string, boolean>>({});
  const [plantillas, setPlantillas] = useState<ChatPlantilla[]>([]);
  const [noLeidos, setNoLeidos] = useState<Record<string, number>>({});

  const channelRef = useRef<any>(null);
  const presenciaChannelRef = useRef<any>(null);
  const salaIdRef = useRef<string | null>(null);
  const instanceId = useRef(Math.random().toString(36).slice(2));

  // Cargar salas del usuario
  const cargarSalas = useCallback(async () => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const [membresiasRes, visitorSalasRes] = await Promise.all([
        supabase
          .from("chat_miembros")
          .select("sala_id")
          .eq("user_id", user.id),
        supabase
          .from("chat_salas")
          .select("id")
          .eq("empresa_id", user.empresa_id)
          .eq("tipo", "visitante")
          .eq("estado", "activo"),
      ]);

      if (membresiasRes.error) throw membresiasRes.error;

      const miembroSalaIds = (membresiasRes.data || []).map((m) => m.sala_id);
      const visitorSalaIds = (visitorSalasRes.data || []).map((s) => s.id);
      const allSalaIds = [...new Set([...miembroSalaIds, ...visitorSalaIds])];

      if (allSalaIds.length === 0) {
        setSalas([]);
        return;
      }

      const { data, error } = await supabase
        .from("chat_salas")
        .select("*")
        .in("id", allSalaIds)
        .eq("estado", "activo")
        .order("ultima_actividad", { ascending: false });

      if (error) throw error;
      setSalas((data || []) as ChatSala[]);
    } catch (err) {
      console.error("[useChat] Error cargando salas:", err);
    }
  }, [user]);

// Cargar mensajes de una sala
  const cargarMensajes = useCallback(async (salaId: string, antesDe?: string) => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      let query = supabase
        .from("chat_mensajes")
        .select("*")
        .eq("sala_id", salaId)
        .eq("eliminado", false)
        .eq("enviado", true)
        .order("creado_en", { ascending: false })
        .limit(PAGE_SIZE);

      if (antesDe) {
        query = query.lt("creado_en", antesDe);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mensajesData = (data || []).reverse() as ChatMensaje[];

      const userIds = mensajesData
        .filter((m) => m.user_id)
        .map((m) => m.user_id!)
        .filter((v, i, a) => a.indexOf(v) === i);

      let userMap: Record<string, { id: string; nombre: string; avatar_url: string | null; rol: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, nombre, avatar_url, rol")
          .in("id", userIds);
        (profiles || []).forEach((p: any) => { userMap[p.id] = p; });
      }

      const mensajesConUser = mensajesData.map((m) => ({
        ...m,
        user: m.user_id ? (userMap[m.user_id] || null) : null,
      })) as ChatMensaje[];

      if (antesDe) {
        setMensajes((prev) => [...mensajesConUser, ...prev]);
      } else {
        setMensajes(mensajesConUser);
      }

      setTieneMasMensajes((data || []).length === PAGE_SIZE);
    } catch (err) {
      console.error("[useChat] Error cargando mensajes:", err);
    }
  }, [user]);

  // Cargar miembros de una sala
  const cargarMiembros = useCallback(async (salaId: string) => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("chat_miembros")
        .select(`
          *,
          user:profiles!user_id(id, nombre, avatar_url, rol, estado_chat)
        `)
        .eq("sala_id", salaId);

      if (error) throw error;

      setMiembros((data || []) as ChatMiembro[]);
    } catch (err) {
      console.error("[useChat] Error cargando miembros:", err);
    }
  }, [user]);

  // Enviar mensaje (usa API directa para velocidad, bypass RLS)
  const enviarMensaje = useCallback(async (
    salaId: string,
    contenido: string,
    tipo: ChatMensaje["tipo"] = "texto",
    replyTo?: string | null,
    metadata?: Record<string, any>
  ) => {
    if (!user || !contenido.trim()) return false;

    setEnviando(true);
    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sala_id: salaId,
          contenido: contenido.trim(),
          tipo,
          user_id: user.id,
          ...(replyTo ? { reply_to: replyTo } : {}),
          ...(metadata ? { metadata } : {}),
        }),
      });

      if (!res.ok) {
        console.error("[useChat] Error enviando via API:", res.status);
        setEnviando(false);
        return false;
      }

      const data = await res.json();
      if (!data.success) {
        console.error("[useChat] Error:", data.error);
        setEnviando(false);
        return false;
      }

      setEnviando(false);
      return true;
    } catch (err) {
      console.error("[useChat] Error enviando mensaje:", err);
      setEnviando(false);
      return false;
    }
  }, [user]);

  // Subir archivo y enviar mensaje
  const subirArchivoChat = useCallback(async (salaId: string, file: File) => {
    if (!user) return false;
    const supabase = getSupabase();
    if (!supabase) return false;

    setEnviando(true);
    try {
      const ext = file.name.split(".").pop() || "";
      const path = `${user.empresa_id || "global"}/${salaId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("chat-media")
        .getPublicUrl(path);

      const archivoUrl = urlData?.publicUrl || "";

      // Determinar tipo por mime
      let tipo: ChatMensaje["tipo"] = "archivo";
      if (file.type.startsWith("image/")) tipo = "imagen";
      else if (file.type.startsWith("video/")) tipo = "video";
      else if (file.type.startsWith("audio/")) tipo = "audio";

      const { error } = await supabase.from("chat_mensajes").insert({
        sala_id: salaId,
        user_id: user.id,
        tipo,
        contenido: file.name,
        archivo_url: archivoUrl,
        archivo_nombre: file.name,
        archivo_size: file.size,
        archivo_mime: file.type,
        enviado: true,
      });

      if (error) throw error;

      await supabase
        .from("chat_miembros")
        .update({ ultima_lectura: new Date().toISOString() })
        .eq("sala_id", salaId)
        .eq("user_id", user.id);

      return true;
    } catch (err) {
      console.error("[useChat] Error subiendo archivo:", err);
      return false;
    } finally {
      setEnviando(false);
    }
  }, [user]);

  // Programar mensaje
  const programarMensaje = useCallback(async (
    salaId: string,
    contenido: string,
    fechaHora: string
  ) => {
    if (!user || !contenido.trim() || !fechaHora) return false;
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase.from("chat_mensajes").insert({
        sala_id: salaId,
        user_id: user.id,
        tipo: "texto",
        contenido: contenido.trim(),
        programado_para: fechaHora,
        enviado: false,
      });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("[useChat] Error programando mensaje:", err);
      return false;
    }
  }, [user]);

  // Marcar mensajes como leídos
  const marcarLeidos = useCallback(async (salaId: string) => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("chat_mensajes")
        .update({
          leido_por: supabase.rpc("array_append_unique", {
            arr: "leido_por",
            elem: user.id,
          }),
        })
        .eq("sala_id", salaId)
        .not("leido_por", "cs", `{${user.id}}`)
        .neq("user_id", user.id);

      if (error) throw error;
    } catch (err) {
      console.error("[useChat] Error marcando leídos:", err);
    }
  }, [user]);

  // Ref para acceder a marcarLeidos desde realtime sin causar re-subscripciones
  const marcarLeidosRef = useRef(marcarLeidos);
  useEffect(() => {
    marcarLeidosRef.current = marcarLeidos;
  }, [marcarLeidos]);

  // Unirse a sala
  const unirseSala = useCallback(async (salaId: string) => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      // Upsert como miembro (ignorar si ya existe)
      await supabase.from("chat_miembros").upsert({
        sala_id: salaId,
        user_id: user.id,
        rol_sala: "miembro",
      }, { onConflict: "sala_id,user_id" });

      // Cargar sala
      const { data: sala } = await supabase
        .from("chat_salas")
        .select("*")
        .eq("id", salaId)
        .single();

      if (sala) {
        setSalaActiva(sala as ChatSala);
        salaIdRef.current = salaId;
        await cargarMensajes(salaId);
        await cargarMiembros(salaId);
        await marcarLeidos(salaId);
        setNoLeidos((prev) => ({ ...prev, [salaId]: 0 }));
      }
    } catch (err) {
      console.error("[useChat] Error uniéndose a sala:", err);
    }
  }, [user, cargarMensajes, cargarMiembros, marcarLeidos]);

  // Crear sala directa
  const crearSalaDirecta = useCallback(async (otroUserId: string) => {
    if (!user) return null;
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      // Verificar si ya existe sala directa entre estos dos usuarios
      const { data: salasOtro } = await supabase
        .from("chat_miembros")
        .select("sala_id")
        .eq("user_id", otroUserId);

      if (salasOtro && salasOtro.length > 0) {
        const salaIds = salasOtro.map((s) => s.sala_id);
        const { data: existente } = await supabase
          .from("chat_miembros")
          .select("sala_id")
          .eq("user_id", user.id)
          .in("sala_id", salaIds);

        if (existente && existente.length > 0) {
          return existente[0].sala_id;
        }
      }

      // Crear nueva sala
      const { data: sala, error: salaError } = await supabase
        .from("chat_salas")
        .insert({
          tipo: "directo",
          creado_por: user.id,
        })
        .select()
        .single();

      if (salaError) throw salaError;

      // Agregar ambos miembros
      await supabase.from("chat_miembros").insert([
        { sala_id: sala.id, user_id: user.id, rol_sala: "admin" },
        { sala_id: sala.id, user_id: otroUserId, rol_sala: "miembro" },
      ]);

      return sala.id;
    } catch (err) {
      console.error("[useChat] Error creando sala:", err);
      return null;
    }
  }, [user]);

  // Cargar plantillas de respuesta rápida
  const cargarPlantillas = useCallback(async () => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("chat_plantillas")
        .select("*")
        .eq("activo", true)
        .order("titulo", { ascending: true });

      if (error) throw error;
      setPlantillas((data || []) as ChatPlantilla[]);
    } catch (err) {
      console.error("[useChat] Error cargando plantillas:", err);
    }
  }, [user]);

  // Actualizar presencia (escribiendo)
  const setEscribiendo = useCallback(async (salaId: string, escribiendo: boolean) => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      await supabase
        .from("chat_presencia")
        .upsert({
          user_id: user.id,
          estado: "online",
          ultimo_ping: new Date().toISOString(),
          esta_escribiendo_en: escribiendo ? salaId : null,
        });
    } catch (err) {
      console.error("[useChat] Error actualizando presencia:", err);
    }
  }, [user]);

  // Editar mensaje
  const editarMensaje = useCallback(async (mensajeId: string, nuevoContenido: string) => {
    if (!user) return false;
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from("chat_mensajes")
        .update({ contenido: nuevoContenido, editado: true })
        .eq("id", mensajeId)
        .eq("user_id", user.id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("[useChat] Error editando mensaje:", err);
      return false;
    }
  }, [user]);

  // Eliminar mensaje (soft delete)
  const eliminarMensaje = useCallback(async (mensajeId: string) => {
    if (!user) return false;
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from("chat_mensajes")
        .update({ eliminado: true })
        .eq("id", mensajeId)
        .eq("user_id", user.id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("[useChat] Error eliminando mensaje:", err);
      return false;
    }
  }, [user]);

  // Fijar/desfijar mensaje
  const fijarMensaje = useCallback(async (mensajeId: string, fijar: boolean) => {
    if (!user) return false;
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from("chat_mensajes")
        .update({ fijado: fijar })
        .eq("id", mensajeId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("[useChat] Error fijando mensaje:", err);
      return false;
    }
  }, [user]);

  // Buscar mensajes
  const buscarMensajes = useCallback(async (salaId: string, query: string) => {
    if (!user || !query.trim()) return [] as ChatMensaje[];
    const supabase = getSupabase();
    if (!supabase) return [] as ChatMensaje[];

    try {
      const { data, error } = await supabase
        .from("chat_mensajes")
        .select(`*, user:profiles!user_id(id, nombre, avatar_url, rol)`)
        .eq("sala_id", salaId)
        .eq("eliminado", false)
        .ilike("contenido", `%${query}%`)
        .order("creado_en", { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as ChatMensaje[];
    } catch (err) {
      console.error("[useChat] Error buscando mensajes:", err);
      return [] as ChatMensaje[];
    }
  }, [user]);

  // Transferir sala a otro agente
  const transferirSala = useCallback(async (salaId: string, nuevoAgenteId: string) => {
    if (!user) return false;
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from("chat_salas")
        .update({ asignado_a: nuevoAgenteId })
        .eq("id", salaId);

      if (error) throw error;

      // Agregar mensaje de sistema
      await supabase.from("chat_mensajes").insert({
        sala_id: salaId,
        user_id: null,
        tipo: "sistema",
        contenido: `Sala transferida a otro agente`,
        enviado: true,
      });

      return true;
    } catch (err) {
      console.error("[useChat] Error transfiriendo sala:", err);
      return false;
    }
  }, [user]);

  // Suscripción realtime a mensajes (INSERT + UPDATE)
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel(`chat-mensajes-${instanceId.current}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_mensajes",
        },
        async (payload) => {
          const nuevoMensaje = payload.new as ChatMensaje;

          if (nuevoMensaje.user_id) {
            const { data: userData } = await supabase
              .from("profiles")
              .select("id, nombre, avatar_url, rol")
              .eq("id", nuevoMensaje.user_id)
              .single();
            nuevoMensaje.user = userData || null;
          } else {
            (nuevoMensaje as any).user = null;
          }

          if (salaIdRef.current === nuevoMensaje.sala_id) {
            setMensajes((prev) => [...prev, nuevoMensaje]);
            await marcarLeidosRef.current(nuevoMensaje.sala_id);
          } else {
            setNoLeidos((prev) => ({
              ...prev,
              [nuevoMensaje.sala_id]: (prev[nuevoMensaje.sala_id] || 0) + 1,
            }));

            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              try {
                new Notification("Nuevo mensaje de chat", {
                  body: nuevoMensaje.contenido || "Nuevo mensaje",
                  icon: "/favicon.ico",
                  tag: nuevoMensaje.sala_id,
                });
              } catch { /* ignore */ }
            }
          }

          setSalas((prev) => {
            const exists = prev.some((s) => s.id === nuevoMensaje.sala_id);
            if (exists) {
              return prev.map((s) =>
                s.id === nuevoMensaje.sala_id
                  ? { ...s, ultimo_mensaje: nuevoMensaje, ultima_actividad: nuevoMensaje.creado_en }
                  : s
              );
            }
            return prev;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_mensajes",
        },
        (payload) => {
          const updated = payload.new as ChatMensaje;
          if (salaIdRef.current === updated.sala_id) {
            setMensajes((prev) =>
              prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
            );
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Suscripción a presencia
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel(`chat-presencia-${instanceId.current}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_presencia",
        },
        (payload) => {
          const presenciaData = payload.new as ChatPresencia;
          if (presenciaData) {
            setPresencia((prev) => ({
              ...prev,
              [presenciaData.user_id]: presenciaData,
            }));

            const escribiendoEnSala = presenciaData.esta_escribiendo_en;
            if (escribiendoEnSala) {
              setEscribiendoEn((prev) => ({
                ...prev,
                [escribiendoEnSala]: true,
              }));

              // Reset después de 3 segundos
              setTimeout(() => {
                setEscribiendoEn((prev) => ({
                  ...prev,
                  [escribiendoEnSala]: false,
                }));
              }, 3000);
            }
          }
        }
      )
      .subscribe();

    presenciaChannelRef.current = channel;

    // Ping de presencia cada 30 segundos
    const interval = setInterval(async () => {
      await supabase.from("chat_presencia").upsert({
        user_id: user.id,
        estado: "online",
        ultimo_ping: new Date().toISOString(),
      });
    }, 30000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Cargar salas y plantillas iniciales
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    cargarSalas().then(() => setLoading(false));
    cargarPlantillas();
  }, [user, cargarSalas, cargarPlantillas]);

  // Obtener estado de un usuario
  const getEstadoUsuario = useCallback((userId: string): ChatPresencia | undefined => {
    return presencia[userId];
  }, [presencia]);

  return {
    salas,
    salaActiva,
    mensajes,
    miembros,
    presencia,
    config,
    loading,
    enviando,
    tieneMasMensajes,
    escribiendoEn,
    plantillas,
    setSalaActiva,
    cargarSalas,
    cargarMensajes,
    unirseSala,
    enviarMensaje,
    marcarLeidos,
    crearSalaDirecta,
    setEscribiendo,
    getEstadoUsuario,
    cargarPlantillas,
    subirArchivoChat,
    editarMensaje,
    eliminarMensaje,
    fijarMensaje,
    buscarMensajes,
    transferirSala,
    programarMensaje,
    noLeidos,
  };
}
