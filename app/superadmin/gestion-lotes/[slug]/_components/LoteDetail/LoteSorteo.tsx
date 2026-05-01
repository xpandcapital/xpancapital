'use client';

import { Lote } from '../../_types';
import { SubCard } from '../shared/GlassCard';
import { Ticket } from 'lucide-react';

interface Props {
  lot: Lote;
  onChange: (field: string, value: any) => void;
}

export function LoteSorteo({ lot, onChange }: Props) {
  return (
    <SubCard className="border-amber-500/10 bg-amber-500/[0.02]">
      <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-wider mb-3">
        <Ticket className="w-3.5 h-3.5 inline mr-1.5" />Participacion en Sorteo
      </h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-400 font-medium">Incluir este lote en el sorteo</p>
          <p className="text-[9px] text-zinc-600 mt-0.5">Solo lotes activos con la casilla marcada participan</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={lot.entersRaffle || false}
            onChange={(e) => onChange('entersRaffle', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-white/[0.06] rounded-full peer peer-checked:bg-amber-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[3px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
        </label>
      </div>
    </SubCard>
  );
}
