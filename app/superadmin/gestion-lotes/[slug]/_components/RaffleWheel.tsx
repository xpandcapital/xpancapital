'use client';

import { Lote, RaffleState } from '../_types';
import { Dices, Trophy, Printer, RotateCcw } from 'lucide-react';

interface Props {
  state: RaffleState;
  lots: Lote[];
  participants: Lote[];
  onExecute: () => void;
  onReset: () => void;
  onPrint: () => void;
  onSetDuration: (d: number) => void;
}

export function RaffleWheel({ state, lots, participants, onExecute, onReset, onPrint, onSetDuration }: Props) {
  if (participants.length === 0) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-12 text-center">
        <Dices className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
        <p className="text-sm font-black text-zinc-400 uppercase tracking-wider">Sin participantes</p>
        <p className="text-xs text-zinc-600 mt-1">Marca la opcion de sorteo en el expediente de un lote</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden relative">
      <div className="p-8 text-center relative z-10">
        <h2 className="text-lg font-black text-amber-400 uppercase tracking-wider mb-2">
          <Trophy className="w-6 h-6 inline mr-2" />Sorteo
        </h2>
        <p className="text-zinc-500 text-xs mb-6">{participants.length} participantes activos</p>

        {state.status === 'idle' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <label className="text-[9px] font-bold text-zinc-500 uppercase">Duracion:</label>
              <select
                value={state.duration}
                onChange={(e) => onSetDuration(Number(e.target.value))}
                className="bg-black/60 border border-white/[0.06] text-white rounded-lg px-3 py-1.5 text-xs outline-none"
              >
                {[5, 10, 15, 20].map(d => <option key={d} value={d} className="bg-black">{d}s</option>)}
              </select>
            </div>
            <button
              onClick={onExecute}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider px-8 py-3 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              <Dices className="w-4 h-4 inline mr-2" />Iniciar Sorteo
            </button>
          </div>
        )}

        {state.status === 'running' && (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8">
              <p className="text-3xl font-black text-amber-400 uppercase tracking-wider animate-pulse">
                {state.currentDisplay || '...'}
              </p>
            </div>
            <p className="text-zinc-500 text-xs">Seleccionando ganador...</p>
          </div>
        )}

        {state.status === 'finished' && state.winner && (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8">
              <p className="text-xs text-emerald-400 font-bold uppercase mb-2">Ganador</p>
              <p className="text-2xl font-black text-white uppercase">{state.winner.clientName}</p>
              <p className="text-sm text-zinc-400 mt-1">Lote {state.winner.loteNumber}</p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={onReset}
                className="bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 inline mr-1" />Nuevo
              </button>
              <button
                onClick={onPrint}
                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all"
              >
                <Printer className="w-3.5 h-3.5 inline mr-1" />Certificado
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
