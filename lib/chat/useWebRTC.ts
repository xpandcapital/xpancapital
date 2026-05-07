"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export interface CallState {
  llamadaId: string | null;
  estado: "idle" | "llamando" | "recibiendo" | "conectada" | "finalizada" | "rechazada";
  tipo: "audio" | "video";
  remoteUserId: string | null;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  duracion: number;
  error: string | null;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useWebRTC() {
  const { user } = useAuth();
  const [callState, setCallState] = useState<CallState>({
    llamadaId: null,
    estado: "idle",
    tipo: "audio",
    remoteUserId: null,
    remoteStream: null,
    localStream: null,
    screenStream: null,
    duracion: 0,
    error: null,
  });

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const duracionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const signalChannelRef = useRef<any>(null);

  const cleanup = useCallback(() => {
    if (duracionIntervalRef.current) {
      clearInterval(duracionIntervalRef.current);
      duracionIntervalRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (signalChannelRef.current) {
      const supabase = getSupabase();
      if (supabase) supabase.removeChannel(signalChannelRef.current);
      signalChannelRef.current = null;
    }
    setCallState({
      llamadaId: null, estado: "idle", tipo: "audio",
      remoteUserId: null, remoteStream: null, localStream: null,
      screenStream: null, duracion: 0, error: null,
    });
  }, []);

  const initSignaling = useCallback((llamadaId: string, onSignal: (signal: any) => void) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase
      .channel(`webrtc-${llamadaId}`)
      .on("broadcast", { event: "signal" }, (payload) => onSignal(payload.payload))
      .subscribe();
    signalChannelRef.current = channel;
    return channel;
  }, []);

  const sendSignal = useCallback(async (llamadaId: string, signal: any) => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.channel(`webrtc-${llamadaId}`).send({
      type: "broadcast", event: "signal", payload: signal,
    });
  }, []);

  const iniciarLlamada = useCallback(async (remoteUserId: string, tipo: "audio" | "video" = "audio") => {
    if (!user) return;
    try {
      setCallState(prev => ({ ...prev, estado: "llamando", tipo, remoteUserId }));
      const constraints = { audio: true, video: tipo === "video" };
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = localStream;
      setCallState(prev => ({ ...prev, localStream }));

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        remoteStreamRef.current = remoteStream;
        setCallState(prev => ({ ...prev, remoteStream, estado: "conectada" }));
        duracionIntervalRef.current = setInterval(() => {
          setCallState(prev => ({ ...prev, duracion: prev.duracion + 1 }));
        }, 1000);
      };

      const supabase = getSupabase();
      if (!supabase) throw new Error("No supabase");

      const { data: llamada, error } = await supabase
        .from("chat_llamadas")
        .insert({ iniciada_por: user.id, recibida_por: remoteUserId, tipo, estado: "llamando", signal_data: {} })
        .select().single();
      if (error) throw error;

      setCallState(prev => ({ ...prev, llamadaId: llamada.id }));

      initSignaling(llamada.id, async (signal) => {
        if (signal.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.answer));
        } else if (signal.type === "ice-candidate") {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } else if (signal.type === "hangup" || signal.type === "reject") {
          cleanup();
          if (signal.type === "reject") setCallState(prev => ({ ...prev, estado: "rechazada" }));
        }
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) sendSignal(llamada.id, { type: "ice-candidate", candidate: event.candidate });
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal(llamada.id, { type: "offer", offer });

      // Notificar al otro usuario
      await supabase.from("notificaciones").insert({
        user_id: remoteUserId,
        empresa_id: user.empresa_id || "6186f014-c8c7-4027-9f08-8acf2bae3eae",
        tipo: "sistema",
        titulo: tipo === "video" ? "Videollamada entrante" : "Llamada entrante",
        mensaje: `${user.name || "Alguien"} te está llamando`,
        link: `/superadmin/chat`,
      });

    } catch (err: any) {
      console.error("[useWebRTC] Error iniciando llamada:", err);
      setCallState(prev => ({ ...prev, error: err.message, estado: "idle" }));
      cleanup();
    }
  }, [user, cleanup, initSignaling, sendSignal]);

  const aceptarLlamada = useCallback(async (llamadaId: string) => {
    if (!user) return;
    try {
      setCallState(prev => ({ ...prev, estado: "conectada" }));
      const supabase = getSupabase();
      if (!supabase) return;

      const { data: llamada } = await supabase.from("chat_llamadas").select("*").eq("id", llamadaId).single();
      if (!llamada) return;

      const constraints = { audio: true, video: llamada.tipo === "video" };
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = localStream;
      setCallState(prev => ({ ...prev, localStream, tipo: llamada.tipo }));

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        remoteStreamRef.current = remoteStream;
        setCallState(prev => ({ ...prev, remoteStream }));
        duracionIntervalRef.current = setInterval(() => {
          setCallState(prev => ({ ...prev, duracion: prev.duracion + 1 }));
        }, 1000);
      };

      initSignaling(llamadaId, async (signal) => {
        if (signal.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal(llamadaId, { type: "answer", answer });
        } else if (signal.type === "ice-candidate") {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } else if (signal.type === "hangup") {
          cleanup();
        }
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) sendSignal(llamadaId, { type: "ice-candidate", candidate: event.candidate });
      };

      await supabase.from("chat_llamadas").update({ estado: "conectada" }).eq("id", llamadaId);
      setCallState(prev => ({ ...prev, llamadaId }));

    } catch (err: any) {
      console.error("[useWebRTC] Error aceptando llamada:", err);
      cleanup();
    }
  }, [user, cleanup, initSignaling, sendSignal]);

  const rechazarLlamada = useCallback(async (llamadaId: string) => {
    await sendSignal(llamadaId, { type: "reject" });
    cleanup();
    const supabase = getSupabase();
    if (supabase) await supabase.from("chat_llamadas").update({ estado: "rechazada" }).eq("id", llamadaId);
  }, [cleanup, sendSignal]);

  const colgar = useCallback(async () => {
    const { llamadaId } = callState;
    if (llamadaId) {
      await sendSignal(llamadaId, { type: "hangup" });
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from("chat_llamadas").update({
          estado: "finalizada",
          finalizada_en: new Date().toISOString(),
          duracion_segundos: callState.duracion,
        }).eq("id", llamadaId);
      }
    }
    cleanup();
  }, [callState, cleanup, sendSignal]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
        setCallState(prev => ({ ...prev, screenStream: null }));
        return;
      }
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      screenStreamRef.current = screenStream;
      setCallState(prev => ({ ...prev, screenStream }));
      
      if (pcRef.current) {
        const sender = pcRef.current.getSenders().find(s => s.track?.kind === "video");
        if (sender) {
          const [videoTrack] = screenStream.getVideoTracks();
          sender.replaceTrack(videoTrack);
        }
      }
    } catch (err) {
      console.error("[useWebRTC] Error screen share:", err);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
    }
  }, []);

  return {
    callState,
    iniciarLlamada,
    aceptarLlamada,
    rechazarLlamada,
    colgar,
    toggleScreenShare,
    toggleMute,
    toggleVideo,
  };
}
