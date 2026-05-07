"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Video, Mic, MicOff, Monitor, X } from "lucide-react";
import type { CallState } from "@/lib/chat/useWebRTC";

interface CallModalProps {
  callState: CallState;
  aceptarLlamada: (id: string) => void;
  rechazarLlamada: (id: string) => void;
  colgar: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  llamadaId?: string;
  remoteUserName?: string;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function CallModal({
  callState,
  aceptarLlamada,
  rechazarLlamada,
  colgar,
  toggleMute,
  toggleVideo,
  toggleScreenShare,
  llamadaId,
  remoteUserName,
  onClose,
}: CallModalProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && callState.localStream) {
      localVideoRef.current.srcObject = callState.localStream;
    }
  }, [callState.localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && callState.remoteStream) {
      remoteVideoRef.current.srcObject = callState.remoteStream;
    }
  }, [callState.remoteStream]);

  // Auto-aceptar si hay llamadaId (llamada entrante)
  useEffect(() => {
    if (llamadaId && callState.estado === "idle") {
      aceptarLlamada(llamadaId);
    }
  }, [llamadaId, callState.estado, aceptarLlamada]);

  if (callState.estado === "idle") return null;

  const esVideo = callState.tipo === "video";
  const esConectada = callState.estado === "conectada";
  const esLlamando = callState.estado === "llamando";
  const esRecibiendo = callState.estado === "recibiendo";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blis-red/20 flex items-center justify-center">
              {esVideo ? <Video className="w-5 h-5 text-blis-red" /> : <Phone className="w-5 h-5 text-blis-red" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {remoteUserName || "Llamada"}
              </h3>
              <p className="text-sm text-gray-400">
                {esLlamando && "Llamando..."}
                {esRecibiendo && "Llamada entrante"}
                {esConectada && formatDuration(callState.duracion)}
              </p>
            </div>
          </div>
          <button onClick={() => { colgar(); onClose(); }} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Video area */}
        <div className="flex-1 relative flex items-center justify-center p-6">
          {esVideo && esConectada ? (
            <>
              {/* Remote video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-3xl"
              />
              {/* Local video (picture in picture) */}
              <div className="absolute bottom-8 right-8 w-48 h-36 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center">
                <span className="text-4xl font-black text-white">
                  {remoteUserName?.[0] || "?"}
                </span>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold text-white mb-2">{remoteUserName || "Usuario"}</h4>
                <p className="text-gray-400">
                  {esLlamando && (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blis-red rounded-full animate-pulse" />
                      Llamando...
                    </span>
                  )}
                  {esConectada && formatDuration(callState.duracion)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-8 flex items-center justify-center gap-6">
          {esConectada && (
            <>
              <button
                onClick={toggleMute}
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Mic className="w-6 h-6 text-white" />
              </button>

              {esVideo && (
                <button
                  onClick={toggleVideo}
                  className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Video className="w-6 h-6 text-white" />
                </button>
              )}

              <button
                onClick={toggleScreenShare}
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Monitor className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {esRecibiendo && (
            <>
              <button
                onClick={() => { if (llamadaId) aceptarLlamada(llamadaId); }}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center transition-colors shadow-lg shadow-emerald-500/30"
              >
                <Phone className="w-7 h-7 text-white" />
              </button>
              <button
                onClick={() => { if (llamadaId) rechazarLlamada(llamadaId); onClose(); }}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg shadow-red-500/30"
              >
                <PhoneOff className="w-7 h-7 text-white" />
              </button>
            </>
          )}

          {!esRecibiendo && (
            <button
              onClick={() => { colgar(); onClose(); }}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg shadow-red-500/30"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
