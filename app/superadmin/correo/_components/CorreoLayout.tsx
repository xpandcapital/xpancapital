'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, ArrowLeft, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { CorreoLogin } from './CorreoLogin'
import { CorreoSidebar } from './CorreoSidebar'
import { CorreoLista } from './CorreoLista'
import { CorreoVisor } from './CorreoVisor'
import { CorreoRespuesta } from './CorreoRespuesta'
import { CorreoConfigCuenta } from './CorreoConfigCuenta'
import { useCorreoCuenta } from '../_hooks/useCorreoCuenta'
import { useCorreoBandeja } from '../_hooks/useCorreoBandeja'
import { useCorreoMensaje } from '../_hooks/useCorreoMensaje'
import { useCorreoEnvio } from '../_hooks/useCorreoEnvio'

export function CorreoLayout({ sidebarOpen, onToggleSidebar }: { sidebarOpen: boolean; onToggleSidebar: (v: boolean) => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { cuentaActiva, cuentas, cargarCuentas, desconectarCuenta, seleccionarCuenta, moverCuentaArriba, moverCuentaAbajo } = useCorreoCuenta()
  const {
    folders, activeFolder, messages, total, page, totalPages, hasMore, loading: bandejaLoading, searchQuery,
    cargarFolders, cargarMensajes, cargarDesdeCache, cambiarFolder, buscar, irPagina, setPageOptimistic, optimisticUpdate,
  } = useCorreoBandeja()
  const {
    mensaje, loading: mensajeLoading, traduciendo, mostrarTraduccion, traduccion,
    cargarMensaje, toggleTraduccion, verOriginal, setMensaje,
  } = useCorreoMensaje()
  const { ejecutarAccion } = useCorreoEnvio()

  const [conectado, setConectado] = useState(() => {
    try { return JSON.parse(localStorage.getItem('blis_correo_cuentas') || '[]').length > 0 } catch { return false }
  })
  const [respuestaOpen, setRespuestaOpen] = useState(false)
  const [respuestaModo, setRespuestaModo] = useState<'reply' | 'replyAll' | 'forward' | 'compose'>('reply')
  const [selectedUid, setSelectedUid] = useState<number | null>(null)
  const [selectedUids, setSelectedUids] = useState<number[]>([])
  const [showAddCuenta, setShowAddCuenta] = useState(false)
  const [showConfigCuenta, setShowConfigCuenta] = useState(false)
  const [undoAction, setUndoAction] = useState<{ action: string; uid: number; timer: number } | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list')

  const fetchingRef = useRef(false)
  const cuentaRef = useRef(cuentaActiva); cuentaRef.current = cuentaActiva
  const activeFolderRef = useRef(activeFolder); activeFolderRef.current = activeFolder
  const selectedUidRef = useRef(selectedUid); selectedUidRef.current = selectedUid
  const mensajeRef = useRef(mensaje); mensajeRef.current = mensaje
  const pageQueueRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const trackedPageRef = useRef(page)
  trackedPageRef.current = page

  // Actualizar URL manteniendo folder/page/msg
  const updateUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString())
    Object.entries(overrides).forEach(([k, v]) => { if (v) p.set(k, v); else p.delete(k) })
    if (!overrides.folder && activeFolderRef.current) p.set('folder', activeFolderRef.current)
    const str = p.toString()
    router.replace(str ? `?${str}` : window.location.pathname, { scroll: false })
  }

  const handlePageChange = (newPage: number) => {
    if (!cuentaActiva || newPage < 1 || newPage > totalPages) return
    trackedPageRef.current = newPage
    setPageOptimistic(newPage)
    if (pageQueueRef.current) clearTimeout(pageQueueRef.current)
    pageQueueRef.current = setTimeout(() => {
      if (!cuentaActiva) return
      irPagina(cuentaActiva.id, trackedPageRef.current)
    }, 250)
    updateUrl({ page: String(newPage) })
  }

  const handleSelectMessage = async (uid: number) => {
    if (!cuentaActiva) return
    setSelectedUid(uid)
    optimisticUpdate(uid, { isRead: true } as any)
    cargarMensaje(cuentaActiva.id, uid, activeFolder)
    setMobileView('detail')
    onToggleSidebar(false)
    updateUrl({ msg: String(uid) })
  }

  const handleBackToList = () => {
    setMobileView('list')
    setSelectedUid(null)
    updateUrl({ msg: '' })
  }

  const handleFolderChange = (f: string) => {
    cambiarFolder(f)
    setSelectedUids([])
    setSelectedUid(null)
    onToggleSidebar(false)
    updateUrl({ folder: f, page: '1', msg: '' })
  }

  const handleSwitchCuentaExt = (cuenta: any) => {
    handleSwitchCuenta(cuenta)
    updateUrl({ folder: 'INBOX', page: '1', msg: '' })
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      const key = e.key.toLowerCase()
      if (key === 'r' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('reply'); setRespuestaOpen(true) }
      else if (key === 'a' && e.ctrlKey && !e.shiftKey) { e.preventDefault(); setRespuestaModo('replyAll'); setRespuestaOpen(true) }
      else if (key === 'f' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('forward'); setRespuestaOpen(true) }
      else if (key === 'n' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('compose'); setRespuestaOpen(true) }
      else if (key === 'escape') { setRespuestaOpen(false); setSelectedUids([]); onToggleSidebar(false) }
      else if (key === '?' && e.shiftKey) { alert('Atajos:\nR=Responder  F=Reenviar  N=Nuevo\nDel=Eliminar  S=Estrella  E=Archivar  /=Buscar  Esc=Cerrar') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Montar: cargar cuentas y si existen -> auto-conectar + cargar bandeja (respetando URL)
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => { if (!cancelled && !cuentaRef.current) setConectado(false) }, 8000)
    const urlFolder = searchParams.get('folder') || 'INBOX'
    cargarCuentas().then((list) => {
      clearTimeout(timer)
      if (cancelled) return
      if (list && list.length > 0) {
        seleccionarCuenta(list[0])
        setConectado(true)
        cargarFolders(list[0].id)
        // Iniciar en la carpeta de la URL o INBOX
        if (urlFolder !== 'INBOX') cambiarFolder(urlFolder)
        cargarMensajes(list[0].id, urlFolder, 1)
      }
    }).catch(() => { clearTimeout(timer); if (!cancelled) setConectado(false) })
    return () => { cancelled = true; clearTimeout(timer) }
  }, [])

  useEffect(() => { if (cuentaActiva) cargarMensajes(cuentaActiva.id, activeFolder, 1) }, [activeFolder])
  useEffect(() => {
    if (!cuentaActiva || searchQuery === undefined) return
    const timer = setTimeout(() => cargarMensajes(cuentaActiva.id, activeFolder, 1, searchQuery), 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleConectado = async (result: any) => {
    const list = await cargarCuentas()
    if (list && list.length > 0) {
      const cuentaConectada = list.find((c: any) => c.email === result.email)
      if (cuentaConectada) { seleccionarCuenta(cuentaConectada); setConectado(true); cargarFolders(cuentaConectada.id); cargarMensajes(cuentaConectada.id, 'INBOX', 1) }
    }
    setShowAddCuenta(false)
  }

  const handleRefresh = () => { if (cuentaActiva && !fetchingRef.current) { fetchingRef.current = true; cargarMensajes(cuentaActiva.id, activeFolder, 1).finally(() => { fetchingRef.current = false }) } }
  const handleSearch = (q: string) => buscar(q)
  const handleSearchSubmit = () => { if (cuentaActiva && searchQuery) cargarMensajes(cuentaActiva.id, activeFolder, 1, searchQuery) }
  const handleResponder = (m: 'reply' | 'replyAll' | 'forward') => { setRespuestaModo(m); setRespuestaOpen(true) }
  const handleAccion = async (action: string, uid: number) => {
    if (!cuentaActiva) return
    // Optimistic UI inmediato
    if (action === 'flag') {
      optimisticUpdate(uid, { isFlagged: true } as any)
      if (mensaje?.uid === uid) setMensaje({ ...mensaje, isFlagged: true, flags: [...(mensaje.flags || []), '\\Flagged'] })
    } else if (action === 'unflag') {
      optimisticUpdate(uid, { isFlagged: false } as any)
      if (mensaje?.uid === uid) setMensaje({ ...mensaje, isFlagged: false })
    } else if (action === 'markRead') {
      optimisticUpdate(uid, { isRead: true } as any)
      if (mensaje?.uid === uid) setMensaje({ ...mensaje, isRead: true })
    } else if (action === 'markUnread') {
      optimisticUpdate(uid, { isRead: false } as any)
      if (mensaje?.uid === uid) setMensaje({ ...mensaje, isRead: false })
    }
    if (['delete', 'moveToSpam', 'moveToArchive'].includes(action)) {
      // Cerrar visor si estamos borrando/moviendo el mensaje actual
      if (uid === selectedUid) { setSelectedUid(null); setMensaje(null) }
      const undoRef = { action, uid, timer: 5 }
      setUndoAction(undoRef)
      const interval = setInterval(() => {
        setUndoAction(prev => {
          if (!prev || prev.uid !== uid) { clearInterval(interval); return null }
          const next = prev.timer - 1
          if (next <= 0) { ejecutarAccion(cuentaActiva!.id, activeFolder, action, [uid]).then(() => cargarMensajes(cuentaActiva!.id, activeFolder, 1)).catch(() => {}); clearInterval(interval); return null }
          return { ...prev, timer: next }
        })
      }, 1000)
      return
    }
    ejecutarAccion(cuentaActiva.id, activeFolder, action, [uid]).catch(() => {})
  }
  const handleUndo = () => { setUndoAction(null); if (cuentaActiva) cargarMensajes(cuentaActiva.id, activeFolder, 1) }
  const handleBulkAction = async (action: string) => {
    if (!cuentaActiva || selectedUids.length === 0) return; setSelectedUids([])
    if (['delete', 'moveToSpam', 'moveToArchive'].includes(action)) setTimeout(() => cargarMensajes(cuentaActiva!.id, activeFolder, 1), 800)
  }
  const handleSwitchCuenta = (cuenta: any) => { seleccionarCuenta(cuenta); setSelectedUid(null); setSelectedUids([]); buscar(''); cargarFolders(cuenta.id); cargarMensajes(cuenta.id, 'INBOX', 1) }
  const handleAgregarCuenta = () => setShowAddCuenta(true)
  const handleConfigCuenta = () => { setShowConfigCuenta(true); onToggleSidebar(false) }
  const handleConfigGuardado = () => cargarCuentas()
  const handleDesconectar = () => {
    if (cuentaActiva) { const id = cuentaActiva.id; desconectarCuenta(id); const r = (cuentas || []).filter(c => c.id !== id); if (r.length > 0) { seleccionarCuenta(r[0]); cargarFolders(r[0].id); cargarMensajes(r[0].id, 'INBOX', 1) } else setConectado(false) }
  }

  if (!conectado && !cuentaActiva) return <CorreoLogin onConectado={handleConectado} />
  if (!cuentaActiva) return <div className="flex items-center justify-center h-[calc(100vh-180px)]"><div className="text-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto mb-3" /><p className="text-sm text-gray-400">Conectando al servidor...</p></div></div>

  const sidebarContent = (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Mobile close button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 md:hidden shrink-0">
        <span className="text-sm font-bold text-white">Menú</span>
        <button onClick={() => onToggleSidebar(false)} className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <CorreoSidebar
          folders={folders} activeFolder={activeFolder} onFolderChange={handleFolderChange}
          onRedactar={() => { setRespuestaModo('compose'); setRespuestaOpen(true); setMobileView('detail'); onToggleSidebar(false) }}
          onDesconectar={handleDesconectar} onSwitchCuenta={handleSwitchCuentaExt} onAgregarCuenta={handleAgregarCuenta}
          onConfigCuenta={handleConfigCuenta} moverCuentaArriba={moverCuentaArriba} moverCuentaAbajo={moverCuentaAbajo}
          onToggleSplit={() => {}} onToggleTheme={() => {}} onExportPDF={() => window.print()}
          cuentas={cuentas || []} cuentaActiva={cuentaActiva} loading={false} splitVertical={false} themeLight={false}
        />
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-[calc(100vw-4rem)] md:max-w-full mx-auto md:mx-0 h-[calc(100dvh-112px)] md:h-full min-h-0 md:bg-zinc-950/50 md:rounded-3xl md:border md:border-white/5 flex flex-col" style={{ overflowX: 'clip' }}>
      {/* ===== DESKTOP LAYOUT (md+) ===== */}
      <div className="hidden md:flex h-full max-w-full overflow-hidden">
        <div className="w-56 shrink-0 border-r border-white/5 bg-zinc-950 h-full overflow-hidden">
          {sidebarContent}
        </div>
        <CorreoLista
          messages={messages} loading={bandejaLoading} searchQuery={searchQuery} onSearch={handleSearch}
          onSearchSubmit={handleSearchSubmit} onSelectMessage={handleSelectMessage} onLoadMore={() => {}}
          hasMore={false} onRefresh={handleRefresh} total={total} activeFolder={activeFolder}
          selectedUids={selectedUids} onSelectUids={setSelectedUids} onBulkAction={handleBulkAction}
          neverLoaded={false} selectedUid={selectedUid} page={page} totalPages={totalPages} onPageChange={handlePageChange}
          onStar={(uid) => handleAccion(messages.find(m => m.uid === uid)?.isFlagged ? 'unflag' : 'flag', uid)}
          onSwipeDelete={(uid) => { if (uid === selectedUid) { setSelectedUid(null); setMensaje(null) }; handleAccion('delete', uid) }}
          onSwipeSpam={(uid) => { if (uid === selectedUid) { setSelectedUid(null); setMensaje(null) }; handleAccion('moveToSpam', uid) }}
        />
        <CorreoVisor
          mensaje={mensaje} loading={mensajeLoading} traduciendo={traduciendo} mostrandoTraduccion={mostrarTraduccion}
          traduccion={traduccion} toggleTraduccion={toggleTraduccion} verOriginal={verOriginal}
          cuentaId={cuentaActiva?.id || ''} activeFolder={activeFolder} onResponder={handleResponder}
          onAccion={handleAccion} onExportPDF={() => window.print()}
          respuestaOpen={respuestaOpen} respuestaModo={respuestaModo}
          onRespuestaEnviada={() => { if (cuentaActiva) cargarMensajes(cuentaActiva.id, activeFolder, 1) }}
          onRespuestaClose={() => setRespuestaOpen(false)}
          cuentaEmail={cuentaActiva?.email || ''} cuentaNombre={cuentaActiva?.nombre_mostrado || ''}
          cuentaFirma={cuentaActiva?.firma || ''} cuentaPlantillaDefault={cuentaActiva?.plantilla_default_id || ''}
        />
      </div>

      {/* ===== MOBILE LAYOUT (< md) ===== */}
      <div className="flex md:hidden flex-col h-full max-w-full">
        {/* Mobile top bar: hamburger + search + avatar */}
        {mobileView === 'list' && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 shrink-0 sticky top-0 bg-black z-10">
            <button onClick={() => onToggleSidebar(true)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors shrink-0">
              <Menu className="w-5 h-5" />
            </button>
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit() }}
                placeholder="Buscar correos..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-3 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blis-red/30 transition-all"
              />
            </div>
            {/* Avatar */}
            {cuentaActiva && (
              <div className="shrink-0">
                {cuentaActiva.avatar_url ? (
                  <img src={cuentaActiva.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: (cuentaActiva.color || '#d5c108') }}>
                    {cuentaActiva.email.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* Mobile content */}
        <div className="flex-1 min-h-0 w-full" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {mobileView === 'list' && (
            <CorreoLista
              messages={messages} loading={bandejaLoading} searchQuery={searchQuery} onSearch={handleSearch}
              onSearchSubmit={handleSearchSubmit} onSelectMessage={handleSelectMessage} onLoadMore={() => {}}
              hasMore={false} onRefresh={handleRefresh} total={total} activeFolder={activeFolder}
              selectedUids={selectedUids} onSelectUids={setSelectedUids} onBulkAction={handleBulkAction}
              neverLoaded={false} selectedUid={selectedUid} page={page} totalPages={totalPages} onPageChange={handlePageChange}
              onStar={(uid) => handleAccion(messages.find(m => m.uid === uid)?.isFlagged ? 'unflag' : 'flag', uid)}
              onSwipeDelete={(uid) => { if (uid === selectedUid) { setSelectedUid(null); setMensaje(null) }; handleAccion('delete', uid) }}
              onSwipeSpam={(uid) => { if (uid === selectedUid) { setSelectedUid(null); setMensaje(null) }; handleAccion('moveToSpam', uid) }}
            />
          )}
          {mobileView === 'detail' && (
            <CorreoVisor
              mensaje={mensaje} loading={mensajeLoading} traduciendo={traduciendo} mostrandoTraduccion={mostrarTraduccion}
              traduccion={traduccion} toggleTraduccion={toggleTraduccion} verOriginal={verOriginal}
              cuentaId={cuentaActiva?.id || ''} activeFolder={activeFolder} onResponder={handleResponder}
              onAccion={handleAccion} onExportPDF={() => window.print()} onBack={handleBackToList}
              respuestaOpen={respuestaOpen} respuestaModo={respuestaModo}
              onRespuestaEnviada={() => { if (cuentaActiva) cargarMensajes(cuentaActiva.id, activeFolder, 1) }}
              onRespuestaClose={() => setRespuestaOpen(false)}
              cuentaEmail={cuentaActiva?.email || ''} cuentaNombre={cuentaActiva?.nombre_mostrado || ''}
              cuentaFirma={cuentaActiva?.firma || ''} cuentaPlantillaDefault={cuentaActiva?.plantilla_default_id || ''}
            />
          )}
        </div>
      </div>

      {/* Slide-in sidebar (mobile) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-y-0 left-16 right-0 z-[997] bg-black/60 md:hidden" onClick={() => onToggleSidebar(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-16 top-20 bottom-0 z-[998] w-72 md:hidden overflow-hidden shadow-2xl bg-zinc-950 pt-4 flex flex-col">
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      {showAddCuenta && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md"><button onClick={() => setShowAddCuenta(false)} className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-zinc-800 text-gray-400 hover:text-white">✕</button><CorreoLogin onConectado={handleConectado} /></div>
        </div>
      )}
      {undoAction && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium shadow-lg">
            <span>{undoAction.action === 'delete' ? 'Eliminado' : undoAction.action === 'moveToSpam' ? 'Movido a spam' : 'Archivado'}</span>
            <button onClick={handleUndo} className="px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-xs font-semibold">Deshacer ({undoAction.timer}s)</button>
          </motion.div>
        </div>
      )}
      <CorreoConfigCuenta open={showConfigCuenta} cuenta={cuentaActiva} onClose={() => setShowConfigCuenta(false)} onGuardado={handleConfigGuardado} />

      {/* Modal de Redactar (compose) */}
      <AnimatePresence>
        {respuestaOpen && respuestaModo === 'compose' && cuentaActiva && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 md:p-8 pt-16 md:pt-20 overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) { setRespuestaOpen(false); setRespuestaModo('reply') } }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CorreoRespuesta
                open
                modo="compose"
                mensajeOriginal={null}
                cuentaEmail={cuentaActiva?.email || ''}
                cuentaNombre={cuentaActiva?.nombre_mostrado || ''}
                cuentaFirma={cuentaActiva?.firma || ''}
                cuentaPlantillaDefault={cuentaActiva?.plantilla_default_id || ''}
                cuentaId={cuentaActiva?.id || ''}
                activeFolder={activeFolder}
                onClose={() => { setRespuestaOpen(false); setRespuestaModo('reply') }}
                onEnviado={() => { if (cuentaActiva) cargarMensajes(cuentaActiva.id, activeFolder, 1); setRespuestaOpen(false); setRespuestaModo('reply') }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

