'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, Menu, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

export function CorreoLayout() {
  const { cuentaActiva, cuentas, cargarCuentas, desconectarCuenta, seleccionarCuenta, moverCuentaArriba, moverCuentaAbajo } = useCorreoCuenta()
  const {
    folders, activeFolder, messages, total, page, totalPages, hasMore, loading: bandejaLoading, searchQuery,
    cargarFolders, cargarMensajes, cargarDesdeCache, cambiarFolder, buscar, irPagina, setPageOptimistic, optimisticUpdate,
  } = useCorreoBandeja()
  const {
    mensaje, loading: mensajeLoading, traduciendo, mostrarTraduccion, traduccion,
    cargarMensaje, toggleTraduccion, verOriginal,
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list')

  const fetchingRef = useRef(false)
  const cuentaRef = useRef(cuentaActiva); cuentaRef.current = cuentaActiva
  const activeFolderRef = useRef(activeFolder); activeFolderRef.current = activeFolder
  const selectedUidRef = useRef(selectedUid); selectedUidRef.current = selectedUid
  const mensajeRef = useRef(mensaje); mensajeRef.current = mensaje
  const pageQueueRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      const key = e.key.toLowerCase()
      if (key === 'r' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('reply'); setRespuestaOpen(true) }
      else if (key === 'a' && e.ctrlKey && !e.shiftKey) { e.preventDefault(); setRespuestaModo('replyAll'); setRespuestaOpen(true) }
      else if (key === 'f' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('forward'); setRespuestaOpen(true) }
      else if (key === 'n' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('compose'); setRespuestaOpen(true) }
      else if (key === 'escape') { setRespuestaOpen(false); setSelectedUids([]); setSidebarOpen(false) }
      else if (key === '?' && e.shiftKey) { alert('Atajos:\nR=Responder  F=Reenviar\nDel=Eliminar  S=Estrella  E=Archivar  /=Buscar  Esc=Cerrar') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Montar: cargar cuentas y si existen -> auto-conectar + cargar bandeja
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => { if (!cancelled && !cuentaRef.current) setConectado(false) }, 8000)
    cargarCuentas().then((list) => {
      clearTimeout(timer)
      if (cancelled) return
      if (list && list.length > 0) {
        seleccionarCuenta(list[0])
        setConectado(true)
        cargarFolders(list[0].id)
        cargarMensajes(list[0].id, 'INBOX', 1)
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

  const handleSelectMessage = async (uid: number) => {
    if (!cuentaActiva) return
    setSelectedUid(uid)
    optimisticUpdate(uid, { isRead: true } as any)
    cargarMensaje(cuentaActiva.id, uid, activeFolder)
    setMobileView('detail')
    setSidebarOpen(false)
  }

  const handleBackToList = () => {
    setMobileView('list')
    setSelectedUid(null)
  }

  const handleRefresh = () => { if (cuentaActiva && !fetchingRef.current) { fetchingRef.current = true; cargarMensajes(cuentaActiva.id, activeFolder, 1).finally(() => { fetchingRef.current = false }) } }
  const handlePageChange = (newPage: number) => {
    if (!cuentaActiva || newPage < 1 || newPage > totalPages) return
    setPageOptimistic(newPage)
    if (pageQueueRef.current) clearTimeout(pageQueueRef.current)
    pageQueueRef.current = setTimeout(() => { if (cuentaActiva) irPagina(cuentaActiva.id, newPage) }, 250)
  }
  const handleFolderChange = (f: string) => { cambiarFolder(f); setSelectedUids([]); setSelectedUid(null); setSidebarOpen(false) }
  const handleSearch = (q: string) => buscar(q)
  const handleSearchSubmit = () => { if (cuentaActiva && searchQuery) cargarMensajes(cuentaActiva.id, activeFolder, 1, searchQuery) }
  const handleResponder = (m: 'reply' | 'replyAll' | 'forward') => { setRespuestaModo(m); setRespuestaOpen(true) }

  const handleAccion = async (action: string, uid: number) => {
    if (!cuentaActiva) return
    if (action === 'flag') optimisticUpdate(uid, { isFlagged: true } as any)
    else if (action === 'unflag') optimisticUpdate(uid, { isFlagged: false } as any)
    else if (action === 'markRead') optimisticUpdate(uid, { isRead: true } as any)
    else if (action === 'markUnread') optimisticUpdate(uid, { isRead: false } as any)
    if (['delete', 'moveToSpam', 'moveToArchive'].includes(action)) {
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
  const handleConfigCuenta = () => { setShowConfigCuenta(true); setSidebarOpen(false) }
  const handleConfigGuardado = () => cargarCuentas()
  const handleDesconectar = () => {
    if (cuentaActiva) { const id = cuentaActiva.id; desconectarCuenta(id); const r = (cuentas || []).filter(c => c.id !== id); if (r.length > 0) { seleccionarCuenta(r[0]); cargarFolders(r[0].id); cargarMensajes(r[0].id, 'INBOX', 1) } else setConectado(false) }
  }

  if (!cuentaActiva) return <div className="flex items-center justify-center h-[calc(100vh-180px)]"><div className="text-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto mb-3" /><p className="text-sm text-gray-400">Conectando al servidor...</p></div></div>
  if (!conectado) return <CorreoLogin onConectado={handleConectado} />

  const sidebarContent = (
    <div className="flex flex-col flex-1 min-h-0 h-full">
      {/* Mobile close button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 md:hidden shrink-0">
        <span className="text-sm font-bold text-white">Menú</span>
        <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <CorreoSidebar
          folders={folders} activeFolder={activeFolder} onFolderChange={handleFolderChange}
          onRedactar={() => { setRespuestaModo('compose'); setRespuestaOpen(true); setSidebarOpen(false) }}
          onDesconectar={handleDesconectar} onSwitchCuenta={handleSwitchCuenta} onAgregarCuenta={handleAgregarCuenta}
          onConfigCuenta={handleConfigCuenta} moverCuentaArriba={moverCuentaArriba} moverCuentaAbajo={moverCuentaAbajo}
          onToggleSplit={() => {}} onToggleTheme={() => {}} onExportPDF={() => window.print()}
          cuentas={cuentas || []} cuentaActiva={cuentaActiva} loading={false} splitVertical={false} themeLight={false}
        />
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-full h-[calc(100dvh-120px)] min-h-[400px] bg-zinc-950/50 md:rounded-3xl md:border md:border-white/5 overflow-hidden flex flex-col">
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
      <div className="flex md:hidden flex-col h-full max-w-full overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            {mobileView === 'detail' ? (
              <button onClick={handleBackToList} className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <span className="text-sm font-bold text-white truncate max-w-[180px]">
                {activeFolder === 'INBOX' ? 'Bandeja' : activeFolder.split('.').pop()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {mobileView === 'list' && <span className="text-[10px] text-gray-600 font-mono">{total}</span>}
            <button onClick={handleRefresh} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <Loader2 className={`w-4 h-4 ${bandejaLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile content */}
        <div className="flex-1 min-h-0 overflow-hidden w-full">
          {mobileView === 'list' && (
            <CorreoLista
              messages={messages} loading={bandejaLoading} searchQuery={searchQuery} onSearch={handleSearch}
              onSearchSubmit={handleSearchSubmit} onSelectMessage={handleSelectMessage} onLoadMore={() => {}}
              hasMore={false} onRefresh={handleRefresh} total={total} activeFolder={activeFolder}
              selectedUids={selectedUids} onSelectUids={setSelectedUids} onBulkAction={handleBulkAction}
              neverLoaded={false} selectedUid={selectedUid} page={page} totalPages={totalPages} onPageChange={handlePageChange}
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
              className="fixed inset-y-0 left-16 right-0 z-[997] bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
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
    </div>
  )
}
