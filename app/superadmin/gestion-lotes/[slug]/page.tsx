'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLotes } from './_hooks/useLotes';
import { useProject } from './_hooks/ProjectContext';
import { DashboardStats } from './_components/DashboardStats';
import { DashboardTable } from './_components/DashboardTable';
import { DesistidosTable } from './_components/DesistidosTable';
import { exportToCSV, exportToJSON } from './_utils/csv';
import { EmptyState } from './_components/shared/EmptyState';
import { AlertCircle, LayoutGrid, List, FileSpreadsheet, Download, RefreshCw, Settings } from 'lucide-react';

export default function DashboardPage() {
  const { activeProjectId, slug } = useProject();
  const { isSyncing, loadError, sortedLots, sortedDesistidoLots, desistidoLots, dashboardStats } = useLotes(activeProjectId || '');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  if (loadError) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white/[0.03] backdrop-blur-xl border border-rose-500/20 rounded-2xl p-8 text-center">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <p className="text-sm font-bold text-rose-400 uppercase tracking-wider">Error de conexion</p>
        <p className="text-xs text-zinc-500 mt-2">{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-bold text-zinc-400 hover:text-white uppercase px-4 py-2 rounded-lg transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (sortedLots.length === 0 && desistidoLots.length === 0 && !isSyncing) {
    return (
      <EmptyState
        title="Sin lotes registrados"
        description="Sube documentos o importa un backup para comenzar"
        action={
          <Link
            href={`/superadmin/gestion-lotes/${slug}/configuracion`}
            className="bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all inline-flex items-center gap-2"
          >
            <Settings className="w-3.5 h-3.5" />Configurar Proyecto
          </Link>
        }
      />
    );
  }

  if (isSyncing && sortedLots.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-zinc-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-lg font-black text-white uppercase tracking-tight">Estado de Cobranzas</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
            className="bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2"
          >
            {viewMode === 'table' ? <><LayoutGrid className="w-3.5 h-3.5" /> Grilla</> : <><List className="w-3.5 h-3.5" /> Lista</>}
          </button>
          <button onClick={() => exportToCSV(sortedLots, { startMonth: '', signatureMonth: '', escrituraMonth: '', masterplanImage: null, lotPins: [] }, '')}
            className="bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
          <button onClick={() => exportToJSON(sortedLots, { startMonth: '', signatureMonth: '', escrituraMonth: '', masterplanImage: null, lotPins: [] }, '')}
            className="bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
          <button disabled
            className="bg-white/[0.03] border border-white/[0.06] text-zinc-400 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Sincronizar
          </button>
        </div>
      </div>

      <DashboardStats stats={dashboardStats} desistidosCount={desistidoLots.length} />
      <DashboardTable lots={sortedLots} signatureMonth="" projectSlug={slug} viewMode={viewMode} />
      <DesistidosTable lots={sortedDesistidoLots} projectSlug={slug} />
    </div>
  );
}
