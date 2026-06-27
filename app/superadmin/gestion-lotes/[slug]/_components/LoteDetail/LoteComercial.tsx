'use client';

import { Lote } from '../../_types';
import { SubCard } from '../shared/GlassCard';
import { formatCurrency } from '../../_utils/formatters';
import { Briefcase } from 'lucide-react';
import { NativeSelect } from "@/components/ui/SearchableSelect";

interface Props {
  lot: Lote;
  onChange: (field: string, value: any) => void;
}

export function LoteComercial({ lot, onChange }: Props) {
  return (
    <SubCard className="border-emerald-500/10 bg-emerald-500/[0.02]">
      <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-wider mb-3">
        <Briefcase className="w-3.5 h-3.5 inline mr-1.5" />Modulo Comercial (Asesor)
      </h3>
      <div className="space-y-3">
        <div>
          <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Nombre del Asesor</label>
          <input
            type="text"
            value={lot.agentName || ''}
            onChange={(e) => onChange('agentName', e.target.value)}
            className="w-full p-2 text-sm text-white bg-black/60 border border-white/[0.06] rounded-lg outline-none focus:border-white/[0.12] placeholder:text-zinc-600"
            placeholder="Nombre del asesor"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">Comision a pagar</label>
            <div className="flex gap-2">
              <NativeSelect
                value={lot.commissionType}
                onChange={(v) => onChange('commissionType', v)}
                options={[
                  { value: 'porcentaje', label: '%' },
                  { value: 'fijo', label: '$' },
                ]}
                className="w-24 p-2 text-xs text-white bg-black/60 border border-white/[0.06] rounded-lg outline-none"
              />
              <input
                type="number"
                value={lot.commissionValue || ''}
                onChange={(e) => onChange('commissionValue', Number(e.target.value))}
                className="flex-1 p-2 text-sm text-white bg-black/60 border border-white/[0.06] rounded-lg outline-none focus:border-white/[0.12]"
              />
            </div>
            {lot.commissionType === 'porcentaje' && lot.commissionValue > 0 && (
              <p className="text-[9px] text-emerald-500/60 mt-1 font-bold">
                = {formatCurrency(lot.totalPrice * (lot.commissionValue / 100))}
              </p>
            )}
          </div>
          <div>
            <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Liberar al (%)</label>
            <input
              type="number"
              value={lot.commissionTriggerPercent || ''}
              onChange={(e) => onChange('commissionTriggerPercent', Number(e.target.value))}
              className="w-full p-2 text-sm text-white bg-black/60 border border-white/[0.06] rounded-lg outline-none focus:border-white/[0.12]"
            />
          </div>
        </div>
      </div>
    </SubCard>
  );
}
