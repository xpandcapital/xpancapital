"use client";

import { Trophy, Medal, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { AkademiaStatsData } from "./useAkademiaStats";

const podiumColors = [
  "text-amber-400 bg-amber-500/10 border-amber-500/30",
  "text-zinc-300 bg-zinc-500/10 border-zinc-500/30",
  "text-orange-400 bg-orange-500/10 border-orange-500/30",
];

export function AkademiaRanking({ ranking }: { ranking: AkademiaStatsData["ranking"] }) {
  const [expanded, setExpanded] = useState(false);
  const displayRanking = expanded ? ranking : ranking.slice(0, 5);

  if (!ranking || ranking.length === 0) {
    return (
      <div className="bg-[#050505] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl text-center">
        <Trophy size={32} className="text-zinc-700 mx-auto mb-4" />
        <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Sin datos de ranking</p>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] border border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3">
          <Trophy size={18} className="text-amber-400" /> Ranking Estudiantes
        </h3>
        {ranking.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
          >
            {expanded ? (
              <>Top 5 <ChevronUp size={14} /></>
            ) : (
              <>Ver Top 20 <ChevronDown size={14} /></>
            )}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-zinc-600 font-black uppercase tracking-widest border-b border-white/5">
              <th className="text-left py-3 pr-2 w-10">#</th>
              <th className="text-left py-3 px-2">Estudiante</th>
              <th className="text-right py-3 px-2">Puntos</th>
              <th className="text-right py-3 px-2 hidden sm:table-cell">Nivel</th>
            </tr>
          </thead>
          <tbody>
            {displayRanking.map((r, i) => {
              const isPodium = r.posicion <= 3;
              return (
                <tr
                  key={r.id}
                  className={`border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors ${
                    isPodium ? "bg-white/[0.01]" : ""
                  }`}
                >
                  <td className="py-3 pr-2">
                    {r.posicion <= 3 ? (
                      <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-black ${podiumColors[r.posicion - 1]}`}>
                        {r.posicion === 1 ? <Trophy size={12} /> : r.posicion === 2 ? <Medal size={12} /> : r.posicion}
                      </span>
                    ) : (
                      <span className="text-zinc-600 font-black pl-1">{r.posicion}</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-white font-bold text-sm">{r.nombre}</p>
                    <p className="text-zinc-600 text-[10px] mt-0.5 truncate max-w-[160px]">{r.email}</p>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <p className="text-amber-400 font-black text-sm">{r.puntos_cursos.toLocaleString()}</p>
                    <p className="text-zinc-600 text-[10px] mt-0.5">XP Cursos</p>
                  </td>
                  <td className="py-3 px-2 text-right hidden sm:table-cell">
                    <p className="text-white font-bold text-sm">{r.nivel}</p>
                    <div className="flex justify-end items-center gap-1 mt-0.5">
                      <TrendingUp size={10} className="text-emerald-500" />
                      <span className="text-zinc-600 text-[10px]">Nivel</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
