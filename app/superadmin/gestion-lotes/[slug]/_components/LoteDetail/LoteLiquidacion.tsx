'use client';

import { Lote } from '../../_types';
import { formatCurrency } from '../../_utils/formatters';

interface Props {
  lot: Lote;
  isDesistido: boolean;
  totalInitialPaid: number;
  totalQuotasPaid: number;
  onChange: (field: string, value: any) => void;
}

export function LoteLiquidacion({ lot, isDesistido, totalInitialPaid, totalQuotasPaid, onChange }: Props) {
  if (!isDesistido) return null;

  return (
    <div className="bg-rose-500/[0.03] border border-rose-500/20 rounded-2xl p-5">
      <h3 className="text-[11px] font-black text-rose-400 uppercase tracking-wider mb-4">Liquidacion (Firma de Promesa)</h3>
      <div className="space-y-2 text-xs font-bold">
        <div className="flex justify-between text-zinc-400">
          <span>(+) Total Entradas Pagadas:</span>
          <span>{formatCurrency(totalInitialPaid)}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>(+) Total Cuotas Pagadas:</span>
          <span>{formatCurrency(totalQuotasPaid)}</span>
        </div>
        <div className="flex justify-between text-rose-400 border-t border-rose-500/10 pt-2 mt-2">
          <span>(+) Devolucion al Cliente:</span>
          <span>{formatCurrency(lot.refundAmount || 0)}</span>
        </div>
        <div className="flex justify-between text-amber-400">
          <span>Retencion de Penalidad:</span>
          <span>{formatCurrency((totalInitialPaid + totalQuotasPaid) - (lot.refundAmount || 0))}</span>
        </div>
      </div>
      <div className="mt-3">
        <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Monto a devolver</label>
        <input
          type="number"
          value={lot.refundAmount || ''}
          onChange={(e) => onChange('refundAmount', Number(e.target.value))}
          className="w-full p-2 text-sm text-white bg-black/60 border border-white/[0.06] rounded-lg outline-none focus:border-white/[0.12]"
        />
      </div>
    </div>
  );
}
