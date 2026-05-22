'use client'

import { useState, useEffect, useRef } from 'react'
import { CorreoLogin } from './CorreoLogin'
import { CorreoSidebar } from './CorreoSidebar'
import { CorreoLista } from './CorreoLista'
import { CorreoVisor } from './CorreoVisor'
import { CorreoRespuesta } from './CorreoRespuesta'
import { useCorreoCuenta } from '../_hooks/useCorreoCuenta'
import { useCorreoBandeja } from '../_hooks/useCorreoBandeja'
import { useCorreoMensaje } from '../_hooks/useCorreoMensaje'
import { useCorreoEnvio } from '../_hooks/useCorreoEnvio'

export function CorreoLayout() {
  const { cuentaActiva, cuentas, cargarCuentas, desconectarCuenta, seleccionarCuenta } = useCorreoCuenta()
  const {
    folders, activeFolder, messages, total, hasMore, loading: bandejaLoading, searchQuery,
    cargarFolders, cargarMensajes, cambiarFolder, buscar, cargarMas,
  } = useCorreoBandeja()
  const {
    mensaje, loading: mensajeLoading, traduciendo, mostrarTraduccion, traduccion,
    cargarMensaje, toggleTraduccion, verOriginal,
  } = useCorreoMensaje()
  const { ejecutarAccion } = useCorreoEnvio()

  const [conectado, setConectado] = useState(false)
  const [respuestaOpen, setRespuestaOpen] = useState(false)
  const [respuestaModo, setRespuestaModo] = useState<'reply' | 'replyAll' | 'forward' | 'compose'>('reply')
  const [selectedUid, setSelectedUid] = useState<number | null>(null)
  const [selectedUids, setSelectedUids] = useState<number[]>([])
  const [splitVertical, setSplitVertical] = useState(false)
  const [themeLight, setThemeLight] = useState(false)
  const [neverLoaded, setNeverLoaded] = useState(true)
  const [showAddCuenta, setShowAddCuenta] = useState(false)

  const fetchingRef = useRef(false)
  const conectadoRef = useRef(false)
  const cuentaRef = useRef(cuentaActiva); cuentaRef.current = cuentaActiva
  const activeFolderRef = useRef(activeFolder); activeFolderRef.current = activeFolder
  const selectedUidRef = useRef(selectedUid); selectedUidRef.current = selectedUid
  const mensajeRef = useRef(mensaje); mensajeRef.current = mensaje
  const messagesRef = useRef(messages); messagesRef.current = messages

  // Auto-detect theme (once on mount)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    setThemeLight(mq.matches)
    const handler = (e: MediaQueryListEvent) => setThemeLight(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Keyboard shortcuts (stable via refs, only registered once)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      const key = e.key.toLowerCase()
      if (key === 'r' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('reply'); setRespuestaOpen(true) }
      else if (key === 'a' && e.ctrlKey && !e.shiftKey) { e.preventDefault(); setRespuestaModo('replyAll'); setRespuestaOpen(true) }
      else if (key === 'f' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('forward'); setRespuestaOpen(true) }
      else if (key === 'n' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('compose'); setRespuestaOpen(true) }
      else if (key === 'escape') { setRespuestaOpen(false); setSelectedUids([]) }
      else if (key === '?' && e.shiftKey) { alert('Atajos:\nR=Responder  Shift+A=Responder todos  F=Reenviar  N=Nuevo\nDel=Eliminar  S=Estrella  E=Archivar  /=Buscar  Esc=Cerrar') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // SOLO carga lista de cuentas al montar con timeout. NADA de IMAP.
  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      if (!cancelled && !conectadoRef.current) {
        // Timeout: Supabase no responde, mostrar login de todas formas
        setConectado(false)
      }
    }, 8000)

    cargarCuentas().then((list) => {
      clearTimeout(timer)
      if (cancelled) return
      if (list && list.length > 0) {
        seleccionarCuenta(list[0])
        setConectado(true)
      }
      // Si no hay cuentas, mostrar login (conectado=false)
    }).catch(() => {
      clearTimeout(timer)
      if (!cancelled) setConectado(false)
    })
    return () => { cancelled = true; clearTimeout(timer) }
  }, [])

  // Al conectar una cuenta nueva via login
  const handleConectado = async (result: any) => {
    const list = await cargarCuentas()
    if (list && list.length > 0) {
      const cuentaConectada = list.find((c: any) => c.email === result.email)
      if (cuentaConectada) {
        seleccionarCuenta(cuentaConectada)
        setConectado(true)
        cargarFolders(cuentaConectada.id)
      }
    }
    setShowAddCuenta(false)
  }

  const handleAgregarCuenta = () => {
    setShowAddCuenta(true)
  }

  // Refresh manual — unico lugar donde se cargan mensajes
  const handleRefresh = async () => {
    const cta = cuentaRef.current
    if (!cta || fetchingRef.current) return
    fetchingRef.current = true
    setNeverLoaded(false)
    try {
      if (folders.length === 0) await cargarFolders(cta.id)
      await cargarMensajes(cta.id, activeFolderRef.current, 1)
    } finally {
      fetchingRef.current = false
    }
  }

  // Cambiar carpeta: solo cambia el estado, no carga nada. El usuario debe hacer refresh.
  const handleFolderChange = (folder: string) => {
    cambiarFolder(folder)
    setSelectedUids([])
    setSelectedUid(null)
  }

  // Busqueda: solo al presionar Enter
  const handleSearch = (query: string) => {
    buscar(query)
  }

  const handleSearchSubmit = async () => {
    const cta = cuentaRef.current
    if (!cta || fetchingRef.current || !searchQuery) return
    fetchingRef.current = true
    try {
      await cargarMensajes(cta.id, activeFolderRef.current, 1, searchQuery)
    } finally {
      fetchingRef.current = false
    }
  }

  // Abrir mensaje: carga individual bajo demanda
  const handleSelectMessage = async (uid: number) => {
    if (!cuentaActiva) return
    setSelectedUid(uid)
    cargarMensaje(cuentaActiva.id, uid, activeFolder)
  }

  const handleLoadMore = () => {
    if (cuentaActiva && !fetchingRef.current) cargarMas(cuentaActiva.id)
  }

  const handleResponder = (modo: 'reply' | 'replyAll' | 'forward') => {
    setRespuestaModo(modo)
    setRespuestaOpen(true)
  }

  const handleAccion = async (action: string, uid: number) => {
    const cta = cuentaRef.current
    if (!cta) return
    try {
      await ejecutarAccion(cta.id, activeFolderRef.current, action, [uid])
      if (messagesRef.current.length > 0) cargarMensajes(cta.id, activeFolderRef.current, 1)
    } catch {}
  }

  const handleBulkAction = async (action: string) => {
    const cta = cuentaRef.current
    if (!cta || selectedUids.length === 0) return
    try {
      await ejecutarAccion(cta.id, activeFolderRef.current, action, selectedUids)
      setSelectedUids([])
      if (messagesRef.current.length > 0) cargarMensajes(cta.id, activeFolderRef.current, 1)
    } catch {}
  }

  const handleSwitchCuenta = (cuenta: any) => {
    seleccionarCuenta(cuenta)
    setSelectedUid(null)
    setSelectedUids([])
    // Al cambiar cuenta: carga carpetas, NO mensajes
    cargarFolders(cuenta.id)
  }

  const handleToggleSplit = () => setSplitVertical(!splitVertical)
  const handleToggleTheme = () => setThemeLight(!themeLight)
  const handleExportPDF = () => window.print()

  const handleDesconectar = () => {
    if (cuentaActiva) {
      const id = cuentaActiva.id
      desconectarCuenta(id)
      const remaining = (cuentas || []).filter(c => c.id !== id)
      if (remaining.length > 0) {
        seleccionarCuenta(remaining[0])
      } else {
        setConectado(false)
      }
    }
  }

  if (!conectado || !cuentaActiva) {
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
        onToggleSplit={handleToggleSplit}
        onToggleTheme={handleToggleTheme}
        onExportPDF={handleExportPDF}
        cuentas={cuentas || []}
        cuentaActiva={cuentaActiva}
        loading={false}
        splitVertical={splitVertical}
        themeLight={themeLight}
      />

      <CorreoLista
        messages={messages}
        loading={bandejaLoading}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onSearchSubmit={handleSearchSubmit}
        onSelectMessage={handleSelectMessage}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        onRefresh={handleRefresh}
        total={total}
        activeFolder={activeFolder}
        selectedUids={selectedUids}
        onSelectUids={setSelectedUids}
        onBulkAction={handleBulkAction}
        neverLoaded={neverLoaded}
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
      />

      <CorreoRespuesta
        open={respuestaOpen}
        modo={respuestaModo}
        mensajeOriginal={mensaje}
        cuentaEmail={cuentaActiva?.email || ''}
        cuentaNombre={cuentaActiva?.nombre_mostrado || ''}
        cuentaFirma={cuentaActiva?.firma || ''}
        cuentaId={cuentaActiva?.id || ''}
        activeFolder={activeFolder}
        onClose={() => setRespuestaOpen(false)}
        onEnviado={() => {}}
      />

      {/* Modal para agregar nueva cuenta (sin cerrar sesion actual) */}
      {showAddCuenta && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowAddCuenta(false)}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-zinc-800 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
            <CorreoLogin onConectado={handleConectado} />
          </div>
        </div>
      )}
    </div>
  )
}
