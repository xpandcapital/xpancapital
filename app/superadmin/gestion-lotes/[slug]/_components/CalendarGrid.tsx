'use client';

import { Lote } from '../_types';
import { MONTH_NAMES } from '../_utils/constants';
import { formatCurrency } from '../_utils/formatters';
import { CalendarDays, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Props {
  lots: Lote[];
}

export function CalendarGrid({ lots }: Props) {
  if (lots.length === 0) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-12 text-center">
        <CalendarDays className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
        <p className="text-sm font-black text-zinc-400 uppercase tracking-wider">Sin lotes para mostrar</p>
        <p className="text-xs text-zinc-600 mt-1">Agrega lotes para ver el calendario de pagos</p>
      </div>
    );
  }

  // Get all unique months from all lots' payments
  const allMonths = new Set<string>();
  lots.forEach(lot => lot.payments.forEach(p => { if (p.month) allMonths.add(p.month); }));
  const sortedMonths = Array.from(allMonths).sort((a, b) => {
    const [ma, ya] = [MONTH_NAMES.indexOf(a.split(' ')[0]), parseInt(a.split(' ')[1])];
    const [mb, yb] = [MONTH_NAMES.indexOf(b.split(' ')[0]), parseInt(b.split(' ')[1])];
    return ya !== yb ? ya - yb : ma - mb;
  });

  if (sortedMonths.length === 0) return null;

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-white/[0.06]">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
          <CalendarDays className="w-3.5 h-3.5 inline mr-1.5" />Calendario de Pagos
        </h3>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header row with months */}
          <div className="flex bg-white/[0.02] border-b border-white/[0.06]">
            <div className="w-40 flex-shrink-0 p-3 text-[9px] font-bold text-zinc-500 uppercase">Lote</div>
            {sortedMonths.map(m => (
              <div key={m} className="flex-1 p-3 text-center text-[9px] font-bold text-zinc-500 uppercase min-w-[80px]">
                {m.split(' ')[0].substring(0, 3)}<br />{m.split(' ')[1].substring(2)}
              </div>
            ))}
          </div>

          {/* Lote rows */}
          {lots.map(lot => (
            <div key={lot.id} className="flex border-b border-white/[0.04] hover:bg-white/[0.01] transition-colors">
              <div className="w-40 flex-shrink-0 p-3">
                <span className="text-[10px] font-black text-white uppercase tracking-wider">{lot.loteNumber}</span>
                <p className="text-[8px] text-zinc-500 truncate">{lot.clientName}</p>
              </div>
              {sortedMonths.map(m => {
                const payment = lot.payments.find(p => p.month === m);
                if (!payment) return <div key={m} className="flex-1 p-3 text-center min-w-[80px]"><span className="text-zinc-700">-</span></div>;
                
                const isPaid = payment.actual >= payment.expected && payment.expected > 0;
                const isPartial = payment.actual > 0 && payment.actual < payment.expected;
                const isFuture = !payment.actual && !payment.paymentDate;

                return (
                  <div key={m} className={`flex-1 p-2 text-center min-w-[80px] rounded-md m-1 ${
                    isPaid ? 'bg-emerald-500/[0.05]' : isPartial ? 'bg-amber-500/[0.05]' : isFuture ? '' : 'bg-rose-500/[0.05]'
                  }`}>
                    {isPaid ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                    ) : isPartial ? (
                      <Clock className="w-3.5 h-3.5 text-amber-400 mx-auto" />
                    ) : isFuture ? (
                      <span className="text-[8px] font-bold text-zinc-500">{formatCurrency(payment.expected)}</span>
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 mx-auto" />
                    )}
                    <p className="text-[9px] font-bold mt-0.5">
                      {isPaid ? (
                        <span className="text-emerald-400">{formatCurrency(payment.actual)}</span>
                      ) : isPartial ? (
                        <span className="text-amber-400">{formatCurrency(payment.actual)}</span>
                      ) : isFuture ? null : (
                        <span className="text-rose-400">{formatCurrency(payment.expected)}</span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-3 flex gap-4 justify-center border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />Pagado
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500">
          <Clock className="w-3 h-3 text-amber-400" />Parcial
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-500">
          <AlertCircle className="w-3 h-3 text-rose-400" />Pendiente
        </div>
      </div>
    </div>
  );
}
