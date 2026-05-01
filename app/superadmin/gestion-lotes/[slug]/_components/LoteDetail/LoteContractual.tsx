'use client';

import { Lote } from '../../_types';
import { SubCard } from '../shared/GlassCard';
import { formatCurrency } from '../../_utils/formatters';
import { Ruler, DollarSign, Percent } from 'lucide-react';

interface Props {
  lot: Lote;
  onChange: (field: string, value: any) => void;
}

export function LoteContractual({ lot, onChange }: Props) {
  return (
    <SubCard>
      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-3">Datos Contractuales</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-bold text-zinc-600 uppercase block mb-1">
            <Ruler className="w-3 h-3 inline mr-1" />Area m2
          </label>
          <input
            type="number"
            value={lot.lotArea || ''}
            onChange={(e) => onChange('lotArea', Number(e.target.value))}
            className="w-full p-2 text-sm text-white bg-black/60 border border-white/[0.06] rounded-lg outline-none focus:border-white/[0.12]"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-zinc-600 uppercase block mb-1">
            <DollarSign className="w-3 h-3 inline mr-1" />Precio
          </label>
          <div className="text-sm font-black text-white bg-black/60 border border-white/[0.06] rounded-lg p-2">
            {formatCurrency(lot.totalPrice)}
          </div>
        </div>
        <div>
          <label className="text-[9px] font-bold text-zinc-600 uppercase block mb-1">Cuota Mensual</label>
          <input
            type="number"
            value={lot.expectedQuota || ''}
            onChange={(e) => onChange('expectedQuota', Number(e.target.value))}
            className="w-full p-2 text-sm text-white bg-black/60 border border-white/[0.06] rounded-lg outline-none focus:border-white/[0.12]"
          />
        </div>
        <div>
          <label className="text-[9px] font-bold text-zinc-600 uppercase block mb-1">
            <Percent className="w-3 h-3 inline mr-1" />Descuentos/Canjes
          </label>
          <input
            type="number"
            value={lot.tradeInValue || ''}
            onChange={(e) => onChange('tradeInValue', Number(e.target.value))}
            className="w-full p-2 text-sm text-white bg-purple-500/10 border border-purple-500/20 rounded-lg outline-none focus:border-purple-500/40"
          />
          <p className="text-[8px] text-zinc-600 mt-1">Se resta del saldo a escriturar. Util para bonos o comisiones pagadas con el lote.</p>
        </div>
      </div>
    </SubCard>
  );
}
