"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Send } from "lucide-react";

interface Pregunta {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
}

interface Props {
  preguntas: Pregunta[];
  cursoId: string;
  userId: string | undefined;
  onResultado?: (resultado: any) => void;
}

export function ExamViewer({ preguntas, cursoId, userId, onResultado }: Props) {
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSelect = (preguntaId: string, opcionId: string) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: opcionId }));
  };

  const handleSubmit = async () => {
    if (Object.keys(respuestas).length < preguntas.length) {
      setError("Debes responder todas las preguntas");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/cursos/examen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          curso_id: cursoId,
          user_id: userId,
          respuestas: Object.entries(respuestas).map(([id, respuesta_elegida]) => ({ id, respuesta_elegida })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResultado(data);
        onResultado?.(data);
      } else {
        setError(data.error || "Error al enviar examen");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setEnviando(false);
    }
  };

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
              <p className="text-[10px] text-gray-500 uppercase font-bold">Intento</p>
              <p className="text-xl font-black text-white">{resultado.intento}/{resultado.max_intentos}</p>
            </div>
            <div className="bg-black/40 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-500 uppercase font-bold">XP</p>
              <p className="text-xl font-black text-[#f5e100]">+{resultado.puntos_otorgados || 0}</p>
            </div>
          </div>

          {!resultado.bloqueado && !resultado.aprobado && (
            <button onClick={() => { setResultado(null); setRespuestas({}) }} className="mt-4 w-full py-3 bg-white/10 border border-white/10 rounded-xl text-white font-bold text-sm hover:bg-white/20 transition-colors">
              Intentar de Nuevo
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-black text-white mb-2">Examen del Curso</h2>
        <p className="text-sm text-gray-400">{preguntas.length} preguntas · Selecciona la respuesta correcta para cada una</p>
      </div>

      {preguntas.map((q, qi) => (
        <div key={q.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <p className="text-white font-bold text-sm mb-3">{qi + 1}. {q.text}</p>
          <div className="space-y-2">
            {q.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(q.id, opt.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm transition-all ${
                  respuestas[q.id] === opt.id
                    ? 'bg-blis-red/10 border border-blis-red/30 text-white'
                    : 'bg-white/[0.02] border border-white/5 text-gray-300 hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  respuestas[q.id] === opt.id ? 'border-blis-red bg-blis-red' : 'border-gray-600'
                }`}>
                  {respuestas[q.id] === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      ))}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      <button onClick={handleSubmit} disabled={enviando} className="w-full py-4 bg-blis-red rounded-2xl text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blis-red/20">
        {enviando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        {enviando ? 'Calificando...' : 'Enviar Respuestas'}
      </button>
    </motion.div>
  );
}
