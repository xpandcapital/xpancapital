'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
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
    cargarFolders, cargarMensajes, cargarDesdeCache, cambiarFolder, buscar, irPagina, optimisticUpdate,
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
  const [splitVertical, setSplitVertical] = useState(false)
  const [showAddCuenta, setShowAddCuenta] = useState(false)
  const [showConfigCuenta, setShowConfigCuenta] = useState(false)

  const fetchingRef = useRef(false)
  const cuentaRef = useRef(cuentaActiva); cuentaRef.current = cuentaActiva
  const activeFolderRef = useRef(activeFolder); activeFolderRef.current = activeFolder
  const selectedUidRef = useRef(selectedUid); selectedUidRef.current = selectedUid
  const mensajeRef = useRef(mensaje); mensajeRef.current = mensaje

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      const key = e.key.toLowerCase()
      if (key === 'r' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('reply'); setRespuestaOpen(true) }
      else if (key === 'a' && e.ctrlKey && !e.shiftKey) { e.preventDefault(); setRespuestaModo('replyAll'); setRespuestaOpen(true) }
      else if (key === 'f' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('forward'); setRespuestaOpen(true) }
      else if (key === 'n' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('compose'); setRespuestaOpen(true) }
      else if (key === 'escape') { setRespuestaOpen(false); setSelectedUids([]) }
      else if (key === '?' && e.shiftKey) { alert('Atajos:\nR=Responder  F=Reenviar  N=Nuevo\nDel=Eliminar  S=Estrella  E=Archivar  /=Buscar  Esc=Cerrar') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Montar: cargar cuentas y si existen → auto-conectar + cargar bandeja
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

  // Al cambiar carpeta → cargar mensajes automaticamente
  useEffect(() => {
    if (!cuentaActiva) return
    cargarMensajes(cuentaActiva.id, activeFolder, 1)
  }, [activeFolder])

  // Busqueda con debounce (Enter no necesario, pero con delay)
  useEffect(() => {
    if (!cuentaActiva || searchQuery === undefined) return
    const timer = setTimeout(() => {
      cargarMensajes(cuentaActiva.id, activeFolder, 1, searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleConectado = async (result: any) => {
    const list = await cargarCuentas()
    if (list && list.length > 0) {
      const cuentaConectada = list.find((c: any) => c.email === result.email)
      if (cuentaConectada) {
        seleccionarCuenta(cuentaConectada)
        setConectado(true)
        cargarFolders(cuentaConectada.id)
        cargarMensajes(cuentaConectada.id, 'INBOX', 1)
      }
    }
    setShowAddCuenta(false)
  }

  const handleSelectMessage = async (uid: number) => {
    if (!cuentaActiva) return
    setSelectedUid(uid)
    cargarMensaje(cuentaActiva.id, uid, activeFolder)
  }

  const handleRefresh = () => {
    if (!cuentaActiva || fetchingRef.current) return
    fetchingRef.current = true
    cargarMensajes(cuentaActiva.id, activeFolder, 1).finally(() => { fetchingRef.current = false })
  }

  const pageQueueRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePageChange = (newPage: number) => {
    if (!cuentaActiva || newPage < 1 || newPage > totalPages) return
    // Cancelar click anterior si viene uno nuevo rapido
    if (pageQueueRef.current) clearTimeout(pageQueueRef.current)
    pageQueueRef.current = setTimeout(() => {
      irPagina(cuentaActiva!.id, newPage)
    }, 200)
  }

  const handleFolderChange = (folder: string) => {
    cambiarFolder(folder)
    setSelectedUids([])
    setSelectedUid(null)
    // cargarMensajes se dispara por el useEffect de activeFolder
  }

  const handleSearch = (query: string) => {
    buscar(query)
  }

  const handleSearchSubmit = () => {
    if (!cuentaActiva || !searchQuery) return
    cargarMensajes(cuentaActiva.id, activeFolder, 1, searchQuery)
  }

  const handleResponder = (modo: 'reply' | 'replyAll' | 'forward') => {
    setRespuestaModo(modo)
    setRespuestaOpen(true)
  }

  // Optimistic: actualizar UI al instante, API en background sin refrescar lista
  const handleAccion = async (action: string, uid: number) => {
    if (!cuentaActiva) return
    // Optimistic instantaneo
    if (action === 'flag') optimisticUpdate(uid, { isFlagged: true } as any)
    else if (action === 'unflag') optimisticUpdate(uid, { isFlagged: false } as any)
    else if (action === 'markRead') optimisticUpdate(uid, { isRead: true } as any)
    else if (action === 'markUnread') optimisticUpdate(uid, { isRead: false } as any)
    // API en background sin esperar
    ejecutarAccion(cuentaActiva.id, activeFolder, action, [uid]).catch(() => {})
  }

  const handleBulkAction = async (action: string) => {
    if (!cuentaActiva || selectedUids.length === 0) return
    setSelectedUids([])
    // Fire and forget, que IMAP lo procese en background
    ejecutarAccion(cuentaActiva.id, activeFolder, action, selectedUids).catch(() => {})
    // Solo refrescar si fue delete o move
    if (['delete', 'moveToSpam', 'moveToArchive', 'moveToTrash'].includes(action)) {
      setTimeout(() => cargarMensajes(cuentaActiva!.id, activeFolder, 1), 800)
    }
  }

  const handleSwitchCuenta = (cuenta: any) => {
    seleccionarCuenta(cuenta)
    setSelectedUid(null)
    setSelectedUids([])
    buscar('')
    cargarFolders(cuenta.id)
    // Cargar bandeja automaticamente al cambiar cuenta
    cargarMensajes(cuenta.id, 'INBOX', 1)
  }

  const handleAgregarCuenta = () => setShowAddCuenta(true)
  const handleConfigCuenta = () => setShowConfigCuenta(true)
  const handleConfigGuardado = () => cargarCuentas()
  const handleToggleSplit = () => setSplitVertical(!splitVertical)
  const handleExportPDF = () => window.print()

  const handleDesconectar = () => {
    if (cuentaActiva) {
      const id = cuentaActiva.id
      desconectarCuenta(id)
      const remaining = (cuentas || []).filter(c => c.id !== id)
      if (remaining.length > 0) {
        seleccionarCuenta(remaining[0])
        cargarFolders(remaining[0].id)
        cargarMensajes(remaining[0].id, 'INBOX', 1)
      } else {
        setConectado(false)
      }
    }
  }

  if (!cuentaActiva) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-180px)]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Conectando al servidor...</p>
        </div>
      </div>
    )
  }

  if (!conectado) {
    return <CorreoLogin onConectado={handleConectado} />
  }

  return (
    <div className={`flex h-[calc(100vh-180px)] min-h-[500px] bg-zinc-950/50 rounded-3xl border border-white/5 overflow-hidden ${splitVertical ? 'flex-col' : ''}`}>
      <CorreoSidebar
        folders={folders}
        activeFolder={activeFolder}
        onFolderChange={handleFolderChange}
        onRedactar={() => { setRespuestaModo('compose'); setRespuestaOpen(true) }}
        onDesconectar={handleDesconectar}
        onSwitchCuenta={handleSwitchCuenta}
        onAgregarCuenta={handleAgregarCuenta}
        onConfigCuenta={handleConfigCuenta}
        moverCuentaArriba={moverCuentaArriba}
        moverCuentaAbajo={moverCuentaAbajo}
        onToggleSplit={handleToggleSplit}
        onToggleTheme={() => {}}
        onExportPDF={handleExportPDF}
        cuentas={cuentas || []}
        cuentaActiva={cuentaActiva}
        loading={false}
        splitVertical={splitVertical}
        themeLight={false}
      />

      <CorreoLista
        messages={messages}
        loading={bandejaLoading}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onSearchSubmit={handleSearchSubmit}
        onSelectMessage={handleSelectMessage}
        onLoadMore={() => {}}
        hasMore={false}
        onRefresh={handleRefresh}
        total={total}
        activeFolder={activeFolder}
        selectedUids={selectedUids}
        onSelectUids={setSelectedUids}
        onBulkAction={handleBulkAction}
        neverLoaded={false}
        selectedUid={selectedUid}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <CorreoVisor
        mensaje={mensaje}
        loading={mensajeLoading}
        traduciendo={traduciendo}
        mostrandoTraduccion={mostrarTraduccion}
        traduccion={traduccion}
        toggleTraduccion={toggleTraduccion}
        verOriginal={verOriginal}
        cuentaId={cuentaActiva?.id || ''}
        activeFolder={activeFolder}
        onResponder={handleResponder}
        onAccion={handleAccion}
        onExportPDF={handleExportPDF}
        respuestaOpen={respuestaOpen}
        respuestaModo={respuestaModo}
        onRespuestaEnviada={() => { if (cuentaActiva) cargarMensajes(cuentaActiva.id, activeFolder, 1) }}
        onRespuestaClose={() => setRespuestaOpen(false)}
        cuentaEmail={cuentaActiva?.email || ''}
        cuentaNombre={cuentaActiva?.nombre_mostrado || ''}
        cuentaFirma={cuentaActiva?.firma || ''}
        cuentaPlantillaDefault={cuentaActiva?.plantilla_default_id || ''}
      />

      {showAddCuenta && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button onClick={() => setShowAddCuenta(false)} className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-zinc-800 text-gray-400 hover:text-white">✕</button>
            <CorreoLogin onConectado={handleConectado} />
          </div>
        </div>
      )}

      <CorreoConfigCuenta open={showConfigCuenta} cuenta={cuentaActiva} onClose={() => setShowConfigCuenta(false)} onGuardado={handleConfigGuardado} />
    </div>
  )
}
