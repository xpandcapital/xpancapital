'use client';

import { Lote } from '../../_types';
import { formatCurrency } from '../../_utils/formatters';
import { Calculator } from 'lucide-react';

interface Props {
  lot: Lote;
  totalInitialPaid: number;
  totalQuotasPaid: number;
  totalExpected: number;
  toPayNow: number;
  saldoEscritura: number;
  pastDueInitial: number;
  pastDueQuotas: number;
}

export function LoteMath({ lot, totalInitialPaid, totalQuotasPaid, totalExpected, toPayNow, saldoEscritura, pastDueInitial, pastDueQuotas }: Props) {
  return (
    <div className="bg-black/60 relative overflow-hidden border border-white/[0.06] rounded-2xl p-5">
      <Calculator className="absolute -right-4 -bottom-4 w-24 h-24 text-white/[0.03]" />
      <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-4 relative z-10">Matematica del Contrato</h3>
      <div className="space-y-2 text-xs font-bold relative z-10">
        <div className="flex justify-between text-zinc-400">
          <span>Precio Total:</span>
          <span>{formatCurrency(lot.totalPrice)}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>(-) Descuentos/Canjes:</span>
          <span>-{formatCurrency(lot.tradeInValue || 0)}</span>
        </div>
        <div className="flex justify-between text-emerald-400">
          <span>(-) Total Pagado (Entrada + Cuotas):</span>
          <span>-{formatCurrency(totalInitialPaid + totalQuotasPaid)}</span>
        </div>
        {pastDueInitial > 0 && (
          <div className="flex justify-between text-rose-400">
            <span>Deuda Entradas:</span>
            <span>{formatCurrency(pastDueInitial)}</span>
          </div>
        )}
        {pastDueQuotas > 0 && (
          <div className="flex justify-between text-rose-400">
            <span>Deuda Cuotas Atrasadas:</span>
            <span>{formatCurrency(pastDueQuotas)}</span>
          </div>
        )}
        {(lot.lateFees || 0) > 0 && (
          <div className="flex justify-between text-rose-400">
            <span>Intereses Mora:</span>
            <span>{formatCurrency(lot.lateFees || 0)}</span>
          </div>
        )}
        {toPayNow > 0 && (
          <div className="flex justify-between text-rose-400 border-t border-rose-500/10 pt-2 mt-2">
            <span>Total A Cobrar Ahora:</span>
            <span>{formatCurrency(toPayNow)}</span>
          </div>
        )}
        <div className="flex justify-between text-amber-400 border-t border-white/[0.06] pt-2 mt-2">
          <span>Saldo Pendiente a Escritura:</span>
          <span>{formatCurrency(Math.max(0, saldoEscritura))}</span>
        </div>
      </div>
    </div>
  );
}
