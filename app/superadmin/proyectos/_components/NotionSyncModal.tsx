'use client'

import { useRouter } from 'next/navigation'
import { X, Loader2, RefreshCw, List, Sparkles } from 'lucide-react'
import type { Project } from '../_types'
import { getProjectSlug } from '../_types'

interface NotionSyncModalProps {
  project: Project | null
  onClose: () => void
  notionDbId: string
  setNotionDbId: (id: string) => void
  notionReceiptsDbId: string
  setNotionReceiptsDbId: (id: string) => void
  notionSyncing: boolean
  notionResult: any
  notionReceiptsResult: any
  onSync: () => void
  onAIParse: () => void
  aiParsing: boolean
  aiParseResult: any
}

export function NotionSyncModal({
  project,
  onClose,
  notionDbId,
  setNotionDbId,
  notionReceiptsDbId,
  setNotionReceiptsDbId,
  notionSyncing,
  notionResult,
  notionReceiptsResult,
  onSync,
  onAIParse,
  aiParsing,
  aiParseResult
}: NotionSyncModalProps) {
  const router = useRouter()

  if (!project) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => !notionSyncing && onClose()}>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
          <div>
            <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Notion Sync</p>
            <h3 className="text-sm font-black text-white">{project.name}</h3>
          </div>
          <button onClick={() => !notionSyncing && onClose()} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 disabled:opacity-50" disabled={notionSyncing}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Inputs */}
          <div className="space-y-3">
            <div>
              <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold block mb-1.5">URL de Lotes *</label>
              <input
                value={notionDbId}
                onChange={e => setNotionDbId(e.target.value)}
                placeholder="https://notion.so/Lotes-..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 font-mono"
                disabled={notionSyncing}
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold block mb-1.5">URL de Recibos (opcional)</label>
              <input
                value={notionReceiptsDbId}
                onChange={e => setNotionReceiptsDbId(e.target.value)}
                placeholder="https://notion.so/Recibos-..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-white/20 font-mono"
                disabled={notionSyncing}
              />
            </div>
          </div>

          {/* Syncing Animation */}
          {notionSyncing && (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <Loader2 className="w-8 h-8 text-blis-red animate-spin" />
              <p className="text-xs text-white/60">Sincronizando con Notion...</p>
            </div>
          )}

          {/* Resultado Lotes */}
          {notionResult && !notionSyncing && (
            <div className={`rounded-xl p-3 border ${notionResult.success ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              {notionResult.success ? (
                <div>
                  <p className="text-emerald-400 font-black text-sm">✅ {notionResult.message}</p>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div className="bg-white/5 rounded-xl p-2.5 text-center">
                      <p className="text-xl font-black text-white">{notionResult.synced}</p>
                      <p className="text-[9px] text-white/40 uppercase">Sincronizados</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 text-center">
                      <p className="text-xl font-black text-white">{notionResult.total}</p>
                      <p className="text-[9px] text-white/40 uppercase">En Notion</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 text-center">
                      <p className={`text-xl font-black ${notionResult.errors > 0 ? 'text-red-400' : 'text-white'}`}>{notionResult.errors}</p>
                      <p className="text-[9px] text-white/40 uppercase">Errores</p>
                    </div>
                  </div>
                  {/* Botón para ir a Gestión de Lotes */}
                  <button
                    onClick={() => {
                      const slug = getProjectSlug(project?.name || '')
                      router.push(`/superadmin/gestion-lotes/${slug}`)
                    }}
                    className="w-full mt-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl text-emerald-400 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                  >
                    <List className="w-4 h-4" /> Ver Lotes en Gestión
                  </button>
                  
                  {/* Botón de Análisis AI */}
                  <button
                    onClick={onAIParse}
                    disabled={aiParsing}
                    className="w-full mt-2 py-2 bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-50 border border-purple-500/30 rounded-xl text-purple-400 font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                  >
                    {aiParsing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Analizando con AI...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Analizar "Forma de Pago" con AI</>
                    )}
                  </button>
                  
                  {/* Resultado del análisis AI */}
                  {aiParseResult && (
                    <div className={`mt-2 rounded-lg p-2 text-[10px] ${aiParseResult.success ? 'bg-purple-500/10 text-purple-400' : 'bg-red-500/10 text-red-400'}`}>
                      {aiParseResult.success ? (
                        <p>✓ {aiParseResult.message || `${aiParseResult.processed} lotes analizados`}</p>
                      ) : (
                        <p>❌ {aiParseResult.error}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-red-400 font-bold text-xs">❌ Error</p>
                  <p className="text-red-400/70 text-[10px] mt-1">{notionResult.error}</p>
                </div>
              )}
            </div>
          )}

          {/* Resultado Recibos */}
          {notionReceiptsResult && !notionSyncing && (
            <div className={`rounded-xl p-3 border ${notionReceiptsResult.success ? 'bg-blue-500/5 border-blue-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              {notionReceiptsResult.success ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-blue-400 font-bold text-xs">💳 Recibos</p>
                    <span className="text-[10px] text-white/40">{notionReceiptsResult.synced} total</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-base font-black text-white">{notionReceiptsResult.synced}</p>
                      <p className="text-[7px] text-white/40 uppercase">Recibos</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-base font-black text-emerald-400">{notionReceiptsResult.linked}</p>
                      <p className="text-[7px] text-white/40 uppercase">Vinculados</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-base font-black text-amber-400">{notionReceiptsResult.unlinked || 0}</p>
                      <p className="text-[7px] text-white/40 uppercase">Sin vínculo</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-base font-black text-red-400">{notionReceiptsResult.desistido || 0}</p>
                      <p className="text-[7px] text-white/40 uppercase">Desistidos</p>
                    </div>
                  </div>
                  {notionReceiptsResult.payments_mapped !== undefined && (
                    <div className="mt-2 p-2 bg-emerald-500/10 rounded-lg">
                      <p className="text-[8px] text-emerald-400">✓ {notionReceiptsResult.payments_mapped} lotes actualizados con pagos</p>
                    </div>
                  )}
                  {notionReceiptsResult.unlinked > 0 && notionReceiptsResult.unlinked_sample && (
                    <div className="mt-2 p-2 bg-amber-500/10 rounded-lg">
                      <p className="text-[8px] text-amber-400/80">Algunos recibos no tienen lote asociado. Verifica el campo "Lotes y Cuotas" en Notion.</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-400 text-xs">{notionReceiptsResult.error || 'Error al sincronizar recibos'}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/5 flex gap-2 shrink-0">
          <button onClick={() => !notionSyncing && onClose()} className="flex-1 py-2.5 bg-white/5 border border-white/5 rounded-xl text-white/60 hover:bg-white/10 transition-all font-bold text-[10px] uppercase tracking-widest" disabled={notionSyncing}>
            Cerrar
          </button>
          <button
            onClick={onSync}
            disabled={notionSyncing || !notionDbId.trim()}
            className="flex-1 py-2.5 bg-blis-red hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
          >
            {notionSyncing ? <><Loader2 className="w-4 h-4 animate-spin" /> Sincronizando...</> : <><RefreshCw className="w-4 h-4" /> Sincronizar</>}
          </button>
        </div>
      </div>
    </div>
  )
}
