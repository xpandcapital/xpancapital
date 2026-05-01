'use client';

import { Lote } from '../../_types';
import { SubCard } from '../shared/GlassCard';
import { MessageSquare, Ticket } from 'lucide-react';

interface Props {
  lot: Lote;
  onChange: (field: string, value: any) => void;
}

export function LoteObservations({ lot, onChange }: Props) {
  return (
    <SubCard>
      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-3">
        <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />Observaciones y Sorteo
      </h3>
      <textarea
        value={lot.specialObservations || ''}
        onChange={(e) => onChange('specialObservations', e.target.value)}
        rows={3}
        className="w-full p-3 text-xs text-white bg-black/60 border border-white/[0.06] rounded-lg outline-none focus:border-white/[0.12] resize-none placeholder:text-zinc-600"
        placeholder="Anota aqui las renegociaciones, si dejaran de pagar un mes y acumularan en otro, promesas de polizas, etc."
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="w-3.5 h-3.5 text-amber-400" />
          <label className="text-[9px] font-bold text-zinc-400 uppercase">Participa en Sorteo</label>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={lot.entersRaffle || false}
            onChange={(e) => onChange('entersRaffle', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-white/[0.06] rounded-full peer peer-checked:bg-amber-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
        </label>
      </div>
    </SubCard>
  );
}
