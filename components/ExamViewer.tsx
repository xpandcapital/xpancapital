"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Send, ChevronLeft, ChevronRight, Clock, Play, Timer } from "lucide-react";

interface Pregunta {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
}

interface Props {
  preguntas: Pregunta[];
  cursoId: string;
  userId: string | undefined;
  instrucciones?: string;
  tipo?: 'modulo' | 'leccion';
  moduloId?: string;
  leccionId?: string;
  bloqueadoPorSecuencia?: boolean;
  onResultado?: (resultado: any) => void;
}

const EXAM_TIMEOUT_SECONDS = 30 * 60; // 30 minutos

function getStorageKey(cursoId: string, userId?: string, moduloId?: string, leccionId?: string) {
  return `xpand_exam_${cursoId}_${userId || 'anon'}_${moduloId || 'curso'}_${leccionId || ''}`;
}

export function ExamViewer({ preguntas, cursoId, userId, instrucciones, tipo = 'modulo', moduloId, leccionId, bloqueadoPorSecuencia, onResultado }: Props) {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [tiempoRestante, setTiempoRestante] = useState(EXAM_TIMEOUT_SECONDS);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const submittedRef = useRef(false);

  const storageKey = getStorageKey(cursoId, userId, moduloId, leccionId);

  // Cargar progreso guardado en localStorage (soporta refrescos)
  useEffect(() => {
    if (preguntas.length === 0) return;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (saved && saved.cursoId === cursoId && saved.respuestas) {
        setStarted(true);
        setRespuestas(saved.respuestas);
        // Recalcular tiempo restante desde el momento del guardado
        const elapsed = Math.floor((Date.now() - saved.timestamp) / 1000);
        const remaining = Math.max(0, EXAM_TIMEOUT_SECONDS - elapsed);
        setTiempoRestante(remaining);
      }
    } catch {}
  }, [storageKey, cursoId, preguntas.length]);

  // Guardar progreso en localStorage al cambiar respuestas
  useEffect(() => {
    if (!started || Object.keys(respuestas).length === 0) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        cursoId,
        respuestas,
        timestamp: Date.now(),
      }));
    } catch {}
  }, [respuestas, started, storageKey, cursoId]);

  // Temporizador: cada segundo decrementa, al llegar a 0 envía automáticamente
  const handleAutoSubmit = useCallback(async (respuestasFinales: Record<string, string>) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/cursos/examen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curso_id: cursoId,
          user_id: userId,
          tipo,
          modulo_id: moduloId,
          leccion_id: leccionId,
          respuestas: Object.entries(respuestasFinales).map(([id, respuesta_elegida]) => ({ id, respuesta_elegida })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResultado(data);
        onResultado?.(data);
        try { localStorage.removeItem(storageKey); } catch {}
      } else {
        setError(data.error || "Error al enviar examen");
        submittedRef.current = false;
      }
    } catch {
      setError("Error de conexión");
      submittedRef.current = false;
    } finally {
      setEnviando(false);
    }
  }, [cursoId, userId, onResultado, storageKey, tipo, moduloId, leccionId]);

  useEffect(() => {
    if (!started || resultado) return;
    intervalRef.current = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [started, resultado]);

  // Cuando el tiempo llega a 0, enviar automáticamente
  useEffect(() => {
    if (started && tiempoRestante <= 0 && !resultado && !enviando) {
      handleAutoSubmit(respuestas);
    }
  }, [tiempoRestante, started, resultado, enviando, respuestas, handleAutoSubmit]);

  const handleSelect = (opcionId: string) => {
    if (enviando) return;
    const preguntaActual = preguntas[currentIndex];
    setRespuestas(prev => ({ ...prev, [preguntaActual.id]: opcionId }));
  };

  const handleSubmit = () => {
    if (Object.keys(respuestas).length < preguntas.length) {
      setError("Debes responder todas las preguntas antes de enviar");
      return;
    }
    handleAutoSubmit(respuestas);
  };

  const formatTiempo = (seg: number) => {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ---- Vista de resultado ----
  if (resultado) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto p-6 space-y-6">
        <div className={`p-6 rounded-2xl border ${resultado.aprobado ? 'bg-emerald-500/10 border-emerald-500/30' : resultado.bloqueado ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
          <div className="flex items-center gap-3 mb-4">
            {resultado.aprobado ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> :
             resultado.bloqueado ? <AlertTriangle className="w-8 h-8 text-red-400" /> :
             <XCircle className="w-8 h-8 text-amber-400" />}
            <div>
              <h2 className="text-2xl font-black text-white">
                {resultado.aprobado ? '¡Aprobado!' : resultado.bloqueado ? 'Examen Bloqueado' : 'No Aprobado'}
              </h2>
              <p className="text-sm text-gray-400">
                {resultado.aprobado
                  ? `Felicidades, aprobaste con ${resultado.nota}%`
                  : resultado.bloqueado
                  ? 'Has alcanzado el límite de intentos. Contacta a tu instructor.'
                  : `Necesitas ${resultado.nota_aprobacion}% para aprobar. Obtuviste ${resultado.nota}%`
                }
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-black/40 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Aciertos</p>
              <p className="text-xl font-black text-white">{resultado.aciertos}/{resultado.total}</p>
            </div>
            <div className="bg-black/40 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Nota</p>
              <p className={`text-xl font-black ${resultado.aprobado ? 'text-emerald-400' : 'text-amber-400'}`}>{resultado.nota}%</p>
            </div>
            <div className="bg-black/40 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase font-bold">Ciclo / Intento</p>
              <p className="text-xl font-black text-white">C{resultado.ciclo || 0}·I{resultado.intento}/{resultado.max_intentos}</p>
            </div>
            <div className="bg-black/40 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase font-bold">XP</p>
              <p className="text-xl font-black text-[#f5e100]">+{resultado.puntos_otorgados || 0}</p>
            </div>
          </div>

          {!resultado.bloqueado && !resultado.aprobado && (
            <button onClick={() => { setResultado(null); setRespuestas({}); setCurrentIndex(0); submittedRef.current = false; }} className="mt-4 w-full py-3 bg-white/10 border border-white/10 rounded-xl text-white font-bold text-sm hover:bg-white/20 transition-colors">
              Intentar de Nuevo
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // ---- Pantalla de inicio con instrucciones ----
  if (!started) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center space-y-4">
          {bloqueadoPorSecuencia ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-black text-white">Examen Bloqueado</h2>
              <p className="text-gray-400 text-sm">
                {tipo === 'leccion'
                  ? 'Debes completar las lecciones anteriores de este módulo antes de poder resolver este quiz.'
                  : 'Debes completar todas las lecciones de este módulo antes de poder rendir el examen.'}
              </p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-left text-xs text-red-300">
                <p className="font-bold uppercase tracking-widest text-[10px] mb-1">¿Cómo desbloquear?</p>
                <p className="leading-relaxed">Marca como completadas todas las lecciones del módulo. Una vez completadas, el examen quedará disponible automáticamente.</p>
              </div>
            </>
          ) : (
            <>
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Timer className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-black text-white">Examen del Módulo</h2>
          <p className="text-gray-400 text-sm">{preguntas.length} preguntas · 30 minutos de tiempo</p>

          {instrucciones && (
            <div className="bg-black/40 border border-amber-500/20 rounded-xl p-5 text-left">
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-2">Instrucciones</p>
              <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{instrucciones}</p>
            </div>
          )}

          <div className="text-left text-xs text-gray-500 space-y-1.5 bg-white/[0.02] rounded-xl p-4">
            <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-gray-600" /> Tienes <b className="text-white">30 minutos</b> para completar el examen.</p>
            <p className="flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-gray-600" /> Si el tiempo se agota, el examen se envía automáticamente con tus respuestas.</p>
            <p className="flex items-center gap-2"><Play className="w-3.5 h-3.5 text-gray-600" /> Tus respuestas se guardan localmente: puedes recargar la página sin perder el progreso.</p>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full py-4 bg-blis-red rounded-2xl text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blis-red/20 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" /> Comenzar Examen
          </button>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  const preguntaActual = preguntas[currentIndex];
  const preguntasRespondidas = Object.keys(respuestas).length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Barra superior: temporizador + progreso */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${tiempoRestante < 300 ? 'text-red-400' : 'text-amber-400'}`} />
          <span className={`text-sm font-black tabular-nums ${tiempoRestante < 300 ? 'text-red-400' : 'text-white'}`}>
            {formatTiempo(tiempoRestante)}
          </span>
        </div>
        <div className="text-xs text-gray-400 font-bold">
          Pregunta <span className="text-white">{currentIndex + 1}</span> / {preguntas.length}
          <span className="ml-3 text-gray-600">· {preguntasRespondidas}/{preguntas.length} respondidas</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {preguntaActual ? (
          <motion.div
            key={preguntaActual.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/[0.02] border border-white/5 rounded-xl p-6"
          >
            <p className="text-white font-bold text-base mb-4">{currentIndex + 1}. {preguntaActual.text}</p>
            <div className="space-y-2">
              {preguntaActual.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm transition-all ${
                    respuestas[preguntaActual.id] === opt.id
                      ? 'bg-blis-red/10 border border-blis-red/30 text-white'
                      : 'bg-white/[0.02] border border-white/5 text-gray-300 hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    respuestas[preguntaActual.id] === opt.id ? 'border-blis-red bg-blis-red' : 'border-gray-600'
                  }`}>
                    {respuestas[preguntaActual.id] === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  {opt.text}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-10 text-gray-500">No hay preguntas</div>
        )}
      </AnimatePresence>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Navegación */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-30 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        {currentIndex < preguntas.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(i => Math.min(preguntas.length - 1, i + 1))}
            className="px-6 py-2.5 bg-blis-red rounded-xl text-white text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blis-red/20 flex items-center gap-2"
          >
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={enviando || preguntasRespondidas < preguntas.length}
            className="px-6 py-2.5 bg-emerald-500 rounded-xl text-white text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {enviando ? 'Enviando...' : 'Enviar Respuestas'}
          </button>
        )}
      </div>

      {/* Progreso de puntos */}
      <div className="flex gap-1.5 justify-center">
        {preguntas.map((q, qi) => (
          <div
            key={q.id}
            className={`w-2 h-2 rounded-full transition-all ${
              qi === currentIndex ? 'w-5 bg-blis-red' :
              respuestas[q.id] ? 'bg-emerald-500' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
