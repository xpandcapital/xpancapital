'use client';

import { formatMonthYear } from '../_utils/months';
import { formatCurrency } from '../_utils/formatters';
import { Lote } from '../_types';
import Link from 'next/link';
import { Eye, CheckCircle2 } from 'lucide-react';

interface Props {
  lots: Lote[];
  signatureMonth: string;
  projectSlug: string;
  viewMode: 'table' | 'grid';
}

export function DashboardTable({ lots, signatureMonth, projectSlug, viewMode }: Props) {
  if (lots.length === 0) {
    return (
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-12 text-center">
        <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Sin lotes</p>
        <p className="text-zinc-600 text-xs mt-1">Sube documentos o importa un backup para comenzar</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {lots.map(lot => {
          const totalInitialPaid = lot.initialPayments?.reduce((acc, p) => acc + Number(p.actual), 0) || 0;
          const totalQuotasPaid = lot.payments.reduce((acc, p) => acc + Number(p.actual), 0);
          const totalExpected = lot.initialPayments?.reduce((acc, p) => acc + Number(p.expected), 0) || 0;
          const pastDueInitial = Math.max(0, totalExpected - totalInitialPaid);
          const pastDueQuotas = lot.payments.reduce((acc, p) => acc + Math.max(0, p.expected - p.actual), 0);
          const toPayNow = pastDueInitial + pastDueQuotas + (lot.lateFees || 0);
          const sigMonth = lot.signatureMonth || signatureMonth;
          const isDesistido = lot.status === 'Desistido';
          const isAlDia = toPayNow === 0 && !isDesistido;

          return (
            <Link key={lot.id} href={`/superadmin/gestion-lotes/${projectSlug}/lote/${lot.id}`} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 bg-white/[0.03] rounded-lg border border-white/[0.06] group-hover:border-rose-500/30 transition-colors">
                  <Eye className="w-3.5 h-3.5 text-zinc-500 group-hover:text-rose-400 transition-colors" />
                </div>
                <div>
                  <span className="text-xs font-black text-white uppercase tracking-wider">Lote {lot.loteNumber}</span>
                  <p className="text-[10px] text-zinc-500 truncate">{lot.owners?.map(o => o.name).filter(Boolean).join(' y ') || lot.clientName}</p>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  {isDesistido ? (
                    <span className="text-zinc-600 text-xs font-bold">Desistido</span>
                  ) : isAlDia ? (
                    <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg text-[9px] font-black inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Al dia
                    </span>
                  ) : (
                    <span className="text-rose-400 text-sm font-black">{formatCurrency(toPayNow)}</span>
                  )}
                </div>
                <span className="text-[8px] font-bold text-zinc-600">{formatMonthYear(sigMonth)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-white/[0.02] text-zinc-500 text-[9px] uppercase tracking-wider border-b border-white/[0.06]">
              <th className="p-4 font-bold w-10"></th>
              <th className="p-4 font-bold">Lote / Cliente</th>
              <th className="p-4 font-bold text-center">Docs</th>
              <th className="p-4 font-bold">Pagado Historico</th>
              <th className="p-4 font-bold text-rose-400">A Cobrar</th>
              <th className="p-4 font-bold text-cyan-400">Cuotas Futuras</th>
              <th className="p-4 font-bold text-amber-400">Saldo Escritura</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {lots.map(lot => {
              const totalInitialExpected = lot.initialPayments?.reduce((acc, p) => acc + Number(p.expected), 0) || 0;
              const totalInitialPaid = lot.initialPayments?.reduce((acc, p) => acc + Number(p.actual), 0) || 0;
              const totalQuotasPaid = lot.payments.reduce((acc, p) => acc + Number(p.actual), 0);
              const pastDueInitial = Math.max(0, totalInitialExpected - totalInitialPaid);
              const pastDueQuotas = lot.payments.reduce((acc, p) => acc + Math.max(0, p.expected - p.actual), 0);
              const lateFees = lot.lateFees || 0;
              const toPayNow = pastDueInitial + pastDueQuotas + lateFees;
              const sigMonth = lot.signatureMonth || signatureMonth;
              const escMonth = lot.escrituraMonth || '2027-01';
              const futureQuotasTotal = (lot.expectedQuota || 0) * Math.max(0, lot.payments.filter(p => p.month >= sigMonth && p.month < escMonth).length);
              const saldoEscritura = Math.max(0, lot.totalPrice - totalInitialPaid - totalQuotasPaid - (lot.tradeInValue || 0) - toPayNow - futureQuotasTotal);

              return (
                <tr key={lot.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4">
                    <Link href={`/superadmin/gestion-lotes/${projectSlug}/lote/${lot.id}`} className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] group-hover:border-rose-500/30 group-hover:bg-rose-500/10 transition-all">
                      <Eye className="w-3.5 h-3.5 text-zinc-500 group-hover:text-rose-400 transition-colors" />
                    </Link>
                  </td>
                  <td className="p-4">
                    <Link href={`/superadmin/gestion-lotes/${projectSlug}/lote/${lot.id}`} className="group/link">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">{lot.loteNumber}</span>
                      <p className="text-xs text-zinc-400 mt-0.5 group-hover/link:text-zinc-300 transition-colors">
                        {lot.owners?.map(o => o.name).filter(Boolean).join(' y ') || lot.clientName}
                      </p>
                    </Link>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-black/60 border border-white/[0.06] px-2 py-1 rounded-lg text-[10px] font-black text-zinc-500">{lot.documents?.length || 0}</span>
                  </td>
                  <td className="p-4 text-xs font-bold text-white">{formatCurrency(totalInitialPaid + totalQuotasPaid)}</td>
                  <td className={`p-4 text-xs font-bold ${toPayNow > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {lot.status === 'Desistido' ? <span className="text-zinc-600">-</span> : formatCurrency(toPayNow)}
                  </td>
                  <td className="p-4 text-xs font-bold text-cyan-400">{formatCurrency(futureQuotasTotal)}</td>
                  <td className="p-4 text-xs font-bold text-amber-400">{formatCurrency(saldoEscritura)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
