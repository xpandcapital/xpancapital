'use client';

import { Lote } from '../../_types';
import { SubCard } from '../shared/GlassCard';
import { CalendarDays } from 'lucide-react';

interface Props {
  lot: Lote;
  onChange: (field: string, value: any) => void;
}

export function LoteTimeline({ lot, onChange }: Props) {
  const toMonthInput = (val: string) => val ? val.substring(0, 7) : '';

  return (
    <SubCard className="border-amber-500/10 bg-amber-500/[0.02]">
      <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-wider mb-3">
        <CalendarDays className="w-3.5 h-3.5 inline mr-1.5" />Tiempos del Cliente
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Inicio de Pagos</label>
          <input
            type="month"
            value={toMonthInput(lot.startMonth)}
            onChange={(e) => onChange('startMonth', e.target.value)}
            className="w-full p-2 text-xs text-white bg-black/60 border border-zinc-800 rounded-lg outline-none color-invert"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Firma Promesa</label>
          <input
            type="month"
            value={toMonthInput(lot.signatureMonth)}
            onChange={(e) => onChange('signatureMonth', e.target.value)}
            className="w-full p-2 text-xs text-white bg-black/60 border border-rose-500/20 rounded-lg outline-none color-invert"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Escritura</label>
          <input
            type="month"
            value={toMonthInput(lot.escrituraMonth)}
            onChange={(e) => onChange('escrituraMonth', e.target.value)}
            className="w-full p-2 text-xs text-white bg-black/60 border border-emerald-500/20 rounded-lg outline-none color-invert"
          />
        </div>
      </div>
    </SubCard>
  );
}
