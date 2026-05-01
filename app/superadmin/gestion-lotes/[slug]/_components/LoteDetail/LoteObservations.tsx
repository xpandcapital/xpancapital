'use client';

import { Lote } from '../../_types';
import { SubCard } from '../shared/GlassCard';
import { MessageSquare } from 'lucide-react';

interface Props {
  lot: Lote;
  onChange: (field: string, value: any) => void;
}

export function LoteObservations({ lot, onChange }: Props) {
  return (
    <SubCard>
      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-3">
        <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />Observaciones
      </h3>
      <textarea
        value={lot.specialObservations || ''}
        onChange={(e) => onChange('specialObservations', e.target.value)}
        rows={4}
        className="w-full p-3 text-xs text-white bg-black/60 border border-white/[0.06] rounded-lg outline-none focus:border-white/[0.12] resize-none placeholder:text-zinc-600"
        placeholder="Resumen de la negociacion: renegociaciones, acuerdos de pago, promesas de polizas, notas del asesor, etc."
      />
    </SubCard>
  );
}
