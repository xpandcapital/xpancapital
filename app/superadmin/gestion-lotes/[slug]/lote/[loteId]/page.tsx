'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '../../_hooks/ProjectContext';
import { useLotes } from '../../_hooks/useLotes';
import { useAIProcessing } from '../../_hooks/useAIProcessing';
import {
  LoteHeader, LoteOwners, LoteContractual, LoteComercial, LoteTimeline,
  LoteDocuments, LoteInitialPayments, LotePayments, LoteReminders,
  LoteObservations, LoteLiquidacion, LoteMath, LoteAIComposer,
} from '../../_components/LoteDetail';
import { ConfirmAction } from '../../_components/shared/ConfirmAction';
import { generateMonthList } from '../../_utils/months';

export default function LoteDetailPage() {
  const params = useParams();
  const { activeProjectId, slug } = useProject();
  const loteId = params?.loteId as string;
  const router = useRouter();
  const lotes = useLotes(activeProjectId || '');
  const lot = useMemo(() => lotes.lots.find(l => l.id === loteId) || null, [lotes.lots, loteId]);
  const [isDrag, setIsDrag] = useState(false);

  const { processSingleLot } = useAIProcessing(
    useCallback(() => lot ? generateMonthList(lot.startMonth || '2025-04', lot.signatureMonth || '2026-04', true).join(', ') : '', [lot]),
    { startMonth: '2025-04', signatureMonth: '2026-04', escrituraMonth: '2027-01' },
    (updated) => lotes.updateSelectedLot(updated),
    () => {},
    (msg) => console.error(msg)
  );

  if (!lot) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <p className="text-zinc-400 font-bold uppercase">Lote no encontrado</p>
        <button onClick={() => router.push(`/superadmin/gestion-lotes/${slug}`)} className="mt-4 text-rose-400 hover:text-rose-300 text-xs font-bold uppercase">
          Volver al Dashboard
        </button>
      </div>
    );
  }

  const isDesistido = lot.status === 'Desistido';
  const totalInitialPaid = lot.initialPayments?.reduce((acc, p) => acc + Number(p.actual), 0) || 0;
  const totalInitialExpected = lot.initialPayments?.reduce((acc, p) => acc + Number(p.expected), 0) || 0;
  const totalQuotasPaid = lot.payments?.reduce((acc, p) => acc + Number(p.actual), 0) || 0;
  const pastDueInitial = Math.max(0, totalInitialExpected - totalInitialPaid);
  const pastDueQuotas = lot.payments?.reduce((acc, p) => acc + Math.max(0, p.expected - p.actual), 0) || 0;
  const lateFees = lot.lateFees || 0;
  const toPayNow = isDesistido ? 0 : pastDueInitial + pastDueQuotas + lateFees;
  const saldoEscritura = Math.max(0, (lot.totalPrice || 0) - totalInitialPaid - totalQuotasPaid - (lot.tradeInValue || 0) - toPayNow);

  const handleSingleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const updated = await processSingleLot(files, lot);
    if (updated) lotes.updateSelectedLot(updated);
    e.target.value = '';
  };

  const handleDragDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDrag(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    const updated = await processSingleLot(files, lot);
    if (updated) lotes.updateSelectedLot(updated);
  };

  return (
    <div className="max-w-6xl mx-auto mt-4 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
      <LoteHeader lot={lot} projectSlug={slug} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <LoteOwners lot={lot} onAddOwner={() => lotes.addOwner(lot.id)} onUpdateOwner={(ownerId, f, v) => lotes.updateOwner(lot.id, ownerId, f, v)} onRemoveOwner={(ownerId) => lotes.removeOwner(lot.id, ownerId)} />
            <LoteContractual lot={lot} onChange={(f, v) => lotes.updateLotField(lot.id, f, v)} />
            <LoteComercial lot={lot} onChange={(f, v) => lotes.updateLotField(lot.id, f, v)} />
            <LoteTimeline lot={lot} onChange={(f, v) => lotes.updateLotField(lot.id, f, v)} />
            <LoteDocuments lot={lot} isDrag={isDrag} onDragEnter={(e) => { e.preventDefault(); setIsDrag(true); }} onDragLeave={(e) => { e.preventDefault(); setIsDrag(false); }} onDragOver={(e) => { e.preventDefault(); }} onDrop={handleDragDrop} onFileInput={handleSingleFileUpload} />
          </div>
          <div className="lg:col-span-3 space-y-6">
            <LoteObservations lot={lot} onChange={(f, v) => lotes.updateLotField(lot.id, f, v)} />
            <LoteReminders lot={lot} onAdd={() => lotes.addReminder(lot.id)} onUpdate={(id, f, v) => lotes.updateReminder(lot.id, id, f, v)} onRemove={(id) => lotes.removeReminder(lot.id, id)} />
            <LoteInitialPayments lot={lot} onAdd={() => lotes.addInitialPayment(lot.id)} onUpdate={(id, f, v) => lotes.updateInitialPayment(lot.id, id, f, v)} onRemove={(id) => lotes.removeInitialPayment(lot.id, id)} />
          </div>
        </div>

        <LotePayments lot={lot} onToggleShow={() => lotes.updateLotField(lot.id, 'showQuotas', !lot.showQuotas)} onUpdatePayment={(idx, f, v) => lotes.updatePaymentField(lot.id, idx, f, v)} onClearPayments={() => lotes.clearAllPayments(lot.id)} />
        <LoteLiquidacion lot={lot} isDesistido={isDesistido} totalInitialPaid={totalInitialPaid} totalQuotasPaid={totalQuotasPaid} onChange={(f, v) => lotes.updateLotField(lot.id, f, v)} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoteMath lot={lot} totalInitialPaid={totalInitialPaid} totalQuotasPaid={totalQuotasPaid} totalExpected={totalInitialExpected} toPayNow={toPayNow} saldoEscritura={saldoEscritura} pastDueInitial={pastDueInitial} pastDueQuotas={pastDueQuotas} />
          <LoteAIComposer lot={lot} isDesistido={isDesistido} toPayNow={toPayNow} pastDueInitial={pastDueInitial} pastDueQuotas={pastDueQuotas} lateFees={lateFees} saldoEscritura={saldoEscritura} signatureMonth={lot.signatureMonth || '2026-04'} escrituraMonth={lot.escrituraMonth || '2027-01'} onUpdate={(partial) => lotes.updateSelectedLot({ ...lot, ...partial })} onError={(msg) => console.error(msg)} />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/[0.06]">
          <ConfirmAction message="Deseas eliminar este expediente?" onConfirm={() => { lotes.deleteLot(lot.id); router.push(`/superadmin/gestion-lotes/${slug}`); }} variant="danger" confirmLabel="Eliminar" />
          <button onClick={() => lotes.toggleLotStatus(lot.id, 0)} className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${isDesistido ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'}`}>
            {isDesistido ? 'Reactivar Lote' : 'Desistir Lote'}
          </button>
        </div>
      </div>
    </div>
  );
}
