'use client';

import { Lote } from '../../_types';
import { SubCard } from '../shared/GlassCard';
import { formatCurrency } from '../../_utils/formatters';
import { CalendarDays, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';

interface Props {
  lot: Lote;
  onToggleShow: () => void;
  onUpdatePayment: (idx: number, field: string, value: any) => void;
  onClearPayments: () => void;
}

export function LotePayments({ lot, onToggleShow, onUpdatePayment, onClearPayments }: Props) {
  const totalPaid = lot.payments.reduce((acc, p) => acc + Number(p.actual), 0);
  const totalExpected = lot.payments.reduce((acc, p) => acc + Number(p.expected), 0);

  return (
    <SubCard>
      <button onClick={onToggleShow} className="w-full flex items-center justify-between">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
          <CalendarDays className="w-3.5 h-3.5 inline mr-1.5" />Historico de Cuotas
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-zinc-500">{formatCurrency(totalPaid)} / {formatCurrency(totalExpected)}</span>
          {lot.showQuotas ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
        </div>
      </button>

      {lot.showQuotas && (
        <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
          <div className="flex justify-end">
            <button onClick={onClearPayments} className="text-[8px] font-bold text-rose-500/60 hover:text-rose-400 uppercase">
              Limpiar todo
            </button>
          </div>
          {lot.payments.map((p, idx) => {
            const isPaid = p.actual >= p.expected && p.expected > 0;
            const isPartial = p.actual > 0 && p.actual < p.expected;
            const bgClass = isPaid ? 'bg-emerald-500/[0.03] border-emerald-500/20' : isPartial ? 'bg-amber-500/[0.03] border-amber-500/20' : 'bg-black/60 border-white/[0.04]';

            return (
              <div key={idx} className={`${bgClass} rounded-lg p-3`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-white uppercase tracking-wider">{p.month}</span>
                  <span className="text-[10px] font-bold text-zinc-500">
                    {p.paymentDate ? (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {p.paymentDate}
                      </span>
                    ) : (
                      <span className="text-zinc-600">Sin fecha</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[8px] font-bold text-zinc-600 uppercase block">Esperado</label>
                    <div className="text-sm font-black text-zinc-400">{formatCurrency(p.expected)}</div>
                  </div>
                  <div className="flex-1">
                    <label className="text-[8px] font-bold text-zinc-600 uppercase block">Pagado</label>
                    <input
                      type="number"
                      value={p.actual || ''}
                      onChange={(e) => onUpdatePayment(idx, 'actual', Number(e.target.value))}
                      className="w-full p-1.5 text-sm text-white bg-transparent border border-white/[0.06] rounded-md outline-none focus:border-white/[0.12] font-bold"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[8px] font-bold text-zinc-600 uppercase block">Fecha</label>
                    <input
                      type="date"
                      value={p.paymentDate || ''}
                      onChange={(e) => onUpdatePayment(idx, 'paymentDate', e.target.value)}
                      className="w-full p-1.5 text-xs text-white bg-transparent border border-white/[0.06] rounded-md outline-none color-invert"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SubCard>
  );
}
