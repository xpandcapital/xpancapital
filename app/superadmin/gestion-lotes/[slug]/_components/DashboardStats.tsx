'use client';

import { DashboardStats as StatsType } from '../_types';
import { formatCurrency } from '../_utils/formatters';

interface Props {
  stats: StatsType;
  desistidosCount: number;
}

export function DashboardStats({ stats, desistidosCount }: Props) {
  const cards = [
    {
      label: 'Lotes Activos',
      value: stats.activeLotsCount,
      sub: desistidosCount > 0 ? `(${desistidosCount} desistidos)` : null,
      color: 'zinc',
      blur: 'bg-zinc-500/5',
      text: 'text-zinc-500',
    },
    {
      label: 'Recaudado',
      value: formatCurrency(stats.totalCollectedSoFar),
      color: 'emerald',
      blur: 'bg-emerald-500/5',
      text: 'text-emerald-400/60',
    },
    {
      label: 'A Cobrar',
      value: formatCurrency(stats.totalToCollectNow),
      color: 'rose',
      blur: 'bg-rose-500/5',
      text: 'text-rose-400/60',
    },
    {
      label: 'Cuotas Futuras',
      value: formatCurrency(stats.totalFutureQuotas),
      color: 'cyan',
      blur: 'bg-cyan-500/5',
      text: 'text-cyan-400/60',
    },
    {
      label: 'Saldo Escrituras',
      value: formatCurrency(stats.totalSaldoEscritura),
      color: 'amber',
      blur: 'bg-amber-500/5',
      text: 'text-amber-400/60',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-20 h-20 ${card.blur} blur-2xl rounded-full`} />
          <p className={`text-[9px] font-bold uppercase tracking-widest mb-2 relative z-10 ${card.text}`}>{card.label}</p>
          <p className="text-xl font-black text-white tracking-tight mt-1 relative z-10">{card.value}</p>
          {card.sub && <p className="text-[10px] text-rose-500 font-bold mt-0.5 relative z-10">{card.sub}</p>}
        </div>
      ))}
    </div>
  );
}
