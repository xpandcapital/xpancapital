'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Lote } from '../../_types';

interface Props {
  lot: Lote;
  projectSlug: string;
}

export function LoteHeader({ lot, projectSlug }: Props) {
  const isDesistido = lot.status === 'Desistido';

  return (
    <>
      {isDesistido && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 p-4 text-center">
          <p className="text-xs font-black text-rose-400 uppercase tracking-wider">
            Expediente Desistido - Resolucion de Contrato
          </p>
        </div>
      )}
      <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <Link
            href={`/superadmin/gestion-lotes/${projectSlug}`}
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Volver
          </Link>
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              Lote {lot.loteNumber}
              {isDesistido && <span className="text-rose-500 ml-2 text-sm">DESISTIDO</span>}
            </h2>
            <p className="text-xs text-zinc-500">{lot.clientName || 'Sin cliente'}</p>
          </div>
        </div>
      </div>
    </>
  );
}
