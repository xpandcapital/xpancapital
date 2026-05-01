'use client';

import { useProject } from '../_hooks/ProjectContext';
import { useLotes } from '../_hooks/useLotes';
import { useSorteo } from '../_hooks/useSorteo';
import { RaffleWheel } from '../_components/RaffleWheel';

export default function SorteosPage() {
  const { activeProjectId, activeProjectName } = useProject();
  const lotes = useLotes(activeProjectId || '');
  const sorteo = useSorteo();
  const participants = sorteo.getParticipants(lotes.activeLots);

  const handlePrint = () => {
    if (!sorteo.state.winner) return;
    const win = window.open('', '_blank', 'width=700,height=600');
    win?.document.write(`<div style="padding:40px;font-family:sans-serif;text-align:center;border:4px solid #b45309;border-radius:16px;max-width:600px;margin:auto;"><h1 style="color:#b45309;text-transform:uppercase;">Certificado de Sorteo</h1><p style="font-size:18px;">Se certifica que el ganador es:</p><h2 style="font-size:28px;">${sorteo.state.winner.clientName}</h2><p>Lote: ${sorteo.state.winner.loteNumber}</p><p>Proyecto: ${activeProjectName}</p><p style="font-size:11px;color:#999;margin-top:30px;">Seleccion aleatoria - ${sorteo.state.audit?.timestamp || ''}</p></div>`);
    win?.document.close();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <RaffleWheel state={sorteo.state} lots={lotes.activeLots} participants={participants} onExecute={() => sorteo.execute(lotes.activeLots, activeProjectName || '')} onReset={sorteo.reset} onPrint={handlePrint} onSetDuration={sorteo.setDuration} />
    </div>
  );
}
