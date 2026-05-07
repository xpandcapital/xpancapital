"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { ChatSala, ChatMensaje, ChatMiembro, ChatPresencia, ChatConfig } from "./types";

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

  const channelRef = useRef<any>(null);
  const presenciaChannelRef = useRef<any>(null);
  const salaIdRef = useRef<string | null>(null);

  // Cargar salas del usuario
  const cargarSalas = useCallback(async () => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("chat_miembros")
        .select(`
          *,
          sala:chat_salas!inner(*)
        `)
        .eq("user_id", user.id)
        .eq("sala.estado", "activo")
        .order("sala.ultima_actividad", { ascending: false });

      if (error) throw error;

      const salasData = (data || []).map((m: any) => m.sala as ChatSala);
      setSalas(salasData);
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
        .select(`
          *,
          user:profiles(id, nombre, avatar_url, rol)
        `)
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

      if (antesDe) {
        setMensajes((prev) => [...mensajesData, ...prev]);
      } else {
        setMensajes(mensajesData);
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
          user:profiles(id, nombre, avatar_url, rol, estado_chat)
        `)
        .eq("sala_id", salaId);

      if (error) throw error;

      setMiembros((data || []) as ChatMiembro[]);
    } catch (err) {
      console.error("[useChat] Error cargando miembros:", err);
    }
  }, [user]);

  // Enviar mensaje
  const enviarMensaje = useCallback(async (
    salaId: string,
    contenido: string,
    tipo: ChatMensaje["tipo"] = "texto",
    replyTo?: string | null,
    metadata?: Record<string, any>
  ) => {
    if (!user || !contenido.trim()) return false;
    const supabase = getSupabase();
    if (!supabase) return false;

    setEnviando(true);
    try {
      const { error } = await supabase.from("chat_mensajes").insert({
        sala_id: salaId,
        user_id: user.id,
        tipo,
        contenido: contenido.trim(),
        reply_to: replyTo || null,
        metadata: metadata || {},
        enviado: true,
      });

      if (error) throw error;

      // Actualizar última actividad
      await supabase
        .from("chat_miembros")
        .update({ ultima_lectura: new Date().toISOString() })
        .eq("sala_id", salaId)
        .eq("user_id", user.id);

      return true;
    } catch (err) {
      console.error("[useChat] Error enviando mensaje:", err);
      return false;
    } finally {
      setEnviando(false);
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

  // Unirse a sala
  const unirseSala = useCallback(async (salaId: string) => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      // Verificar si ya es miembro
      const { data: miembro } = await supabase
        .from("chat_miembros")
        .select("*")
        .eq("sala_id", salaId)
        .eq("user_id", user.id)
        .single();

      if (!miembro) {
        await supabase.from("chat_miembros").insert({
          sala_id: salaId,
          user_id: user.id,
          rol_sala: "miembro",
        });
      }

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

  // Suscripción realtime a mensajes
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel("chat-mensajes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_mensajes",
        },
        async (payload) => {
          const nuevoMensaje = payload.new as ChatMensaje;

          // Cargar info del usuario
          if (nuevoMensaje.user_id) {
            const { data: userData } = await supabase
              .from("profiles")
              .select("id, nombre, avatar_url, rol")
              .eq("id", nuevoMensaje.user_id)
              .single();

            nuevoMensaje.user = userData || null;
          }

          // Si es de la sala activa, agregarlo
          if (salaIdRef.current === nuevoMensaje.sala_id) {
            setMensajes((prev) => [...prev, nuevoMensaje]);
            // Marcar como leído automáticamente
            await marcarLeidos(nuevoMensaje.sala_id);
          }

          // Actualizar último mensaje en la lista de salas
          setSalas((prev) =>
            prev.map((s) =>
              s.id === nuevoMensaje.sala_id
                ? { ...s, ultimo_mensaje: nuevoMensaje, ultima_actividad: nuevoMensaje.creado_en }
                : s
            )
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, marcarLeidos]);

  // Suscripción a presencia
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel("chat-presencia")
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

  // Cargar salas iniciales
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    cargarSalas().then(() => setLoading(false));
  }, [user, cargarSalas]);

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
    setSalaActiva,
    cargarSalas,
    cargarMensajes,
    unirseSala,
    enviarMensaje,
    marcarLeidos,
    crearSalaDirecta,
    setEscribiendo,
    getEstadoUsuario,
  };
}
