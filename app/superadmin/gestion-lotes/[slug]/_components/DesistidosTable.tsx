'use client';

import { useState } from 'react';
import { Lote } from '../_types';
import { formatCurrency } from '../_utils/formatters';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface Props {
  lots: Lote[];
  projectSlug: string;
}

export function DesistidosTable({ lots, projectSlug }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  if (lots.length === 0) return null;

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Lotes Desistidos ({lots.length})</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="overflow-x-auto border-t border-white/[0.06]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white/[0.02] text-zinc-500 text-[9px] uppercase tracking-wider border-b border-white/[0.06]">
                <th className="p-4 font-bold">Lote</th>
                <th className="p-4 font-bold">Cliente</th>
                <th className="p-4 font-bold">Perdida Retenida</th>
                <th className="p-4 font-bold">Devolucion</th>
                <th className="p-4 font-bold text-right">Accion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {lots.map(lot => {
                const totalInitialPaid = lot.initialPayments?.reduce((acc, p) => acc + Number(p.actual), 0) || 0;
                const totalQuotasPaid = lot.payments.reduce((acc, p) => acc + Number(p.actual), 0);
                const netKept = (totalInitialPaid + totalQuotasPaid) - (lot.refundAmount || 0);

                return (
                  <tr key={lot.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">{lot.loteNumber}</span>
                    </td>
                    <td className="p-4 text-xs text-zinc-400">{lot.clientName}</td>
                    <td className="p-4 text-xs font-bold text-amber-400">
                      {netKept > 0 ? `+${formatCurrency(netKept)} (retenido)` : 'Sin retencion'}
                    </td>
                    <td className="p-4 text-xs font-bold text-rose-400">
                      {formatCurrency(lot.refundAmount || 0)}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/superadmin/gestion-lotes/${projectSlug}/lote/${lot.id}`}
                        className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
