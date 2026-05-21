'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const { cuentaActiva, cuentas, loading: cuentaLoading, cargarCuentas, desconectarCuenta, seleccionarCuenta } = useCorreoCuenta()
  const {
    folders, activeFolder, messages, total, hasMore, loading: bandejaLoading,
    searchQuery, cargarFolders, cargarMensajes, cambiarFolder, buscar, cargarMas,
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
  const [initialized, setInitialized] = useState(false)

  // Ref to prevent concurrent fetches
  const fetchingRef = useRef(false)
  const cuentaRef = useRef(cuentaActiva)
  cuentaRef.current = cuentaActiva
  const activeFolderRef = useRef(activeFolder)
  activeFolderRef.current = activeFolder
  const searchRef = useRef(searchQuery)
  searchRef.current = searchQuery
  const selectedUidRef = useRef(selectedUid)
  selectedUidRef.current = selectedUid
  const mensajeRef = useRef(mensaje)
  mensajeRef.current = mensaje

  // Auto-detect theme (once on mount)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    setThemeLight(mq.matches)
    const handler = (e: MediaQueryListEvent) => setThemeLight(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Keyboard shortcuts (stable, no state deps needed via refs)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      const key = e.key.toLowerCase()
      if (key === 'r' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('reply'); setRespuestaOpen(true) }
      else if (key === 'a' && e.ctrlKey && !e.shiftKey) { e.preventDefault(); setRespuestaModo('replyAll'); setRespuestaOpen(true) }
      else if (key === 'f' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('forward'); setRespuestaOpen(true) }
      else if (key === 'n' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('compose'); setRespuestaOpen(true) }
      else if (key === 'delete' && selectedUidRef.current) { e.preventDefault(); handleAccionInterna('delete', selectedUidRef.current) }
      else if (key === 's' && selectedUidRef.current && !e.ctrlKey) { e.preventDefault(); handleAccionInterna(mensajeRef.current?.isFlagged ? 'unflag' : 'flag', selectedUidRef.current) }
      else if (key === 'e' && selectedUidRef.current) { e.preventDefault(); handleAccionInterna('moveToArchive', selectedUidRef.current) }
      else if (key === '/' && !e.ctrlKey) { e.preventDefault(); buscar('') }
      else if (key === 'escape') { setRespuestaOpen(false); setSelectedUids([]) }
      else if (key === '?' && e.shiftKey) { alert('Atajos:\nR=Responder  Shift+A=Responder todos  F=Reenviar  N=Nuevo\nDel=Eliminar  S=Estrella  E=Archivar  /=Buscar  Esc=Cerrar') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Load cuentas once on mount
  useEffect(() => {
    let cancelled = false
    cargarCuentas().then((list) => {
      if (cancelled) return
      if (list && list.length > 0) {
        const primera = list[0]
        seleccionarCuenta(primera)
        setConectado(true)
        cargarFolders(primera.id)
        cargarMensajes(primera.id, 'INBOX', 1)
        setInitialized(true)
      }
    })
    return () => { cancelled = true }
  }, [])

  // Cuando cambia activeFolder (solo si ya inicializado y no es trigger de conectado)
  useEffect(() => {
    if (!cuentaActiva || !initialized || fetchingRef.current) return
    fetchingRef.current = true
    cargarMensajes(cuentaActiva.id, activeFolder, 1).finally(() => {
      fetchingRef.current = false
    })
  }, [activeFolder, initialized])

  // Busqueda con debounce (solo si ya inicializado)
  useEffect(() => {
    if (!cuentaActiva || !initialized || searchQuery === undefined) return
    if (fetchingRef.current) return
    const timer = setTimeout(() => {
      if (fetchingRef.current) return
      fetchingRef.current = true
      cargarMensajes(cuentaActiva.id, activeFolder, 1, searchQuery).finally(() => {
        fetchingRef.current = false
      })
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, initialized])

  const handleAccionInterna = async (action: string, uid: number) => {
    const cta = cuentaRef.current
    if (!cta) return
    try {
      await ejecutarAccion(cta.id, activeFolderRef.current, action, [uid])
      cargarMensajes(cta.id, activeFolderRef.current, 1)
    } catch {}
  }

  const handleConectado = async (result: any) => {
    const list = await cargarCuentas()
    if (list && list.length > 0) {
      const cuentaConectada = list.find((c: any) => c.email === result.email)
      if (cuentaConectada) {
        seleccionarCuenta(cuentaConectada)
        setConectado(true)
        setInitialized(true)
        cargarFolders(cuentaConectada.id)
        cargarMensajes(cuentaConectada.id, 'INBOX', 1)
      }
    }
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

  const handleLoadMore = () => {
    if (cuentaActiva && !fetchingRef.current) cargarMas(cuentaActiva.id)
  }

  const handleResponder = (modo: 'reply' | 'replyAll' | 'forward') => {
    setRespuestaModo(modo)
    setRespuestaOpen(true)
  }

  const handleAccion = async (action: string, uid: number) => {
    if (!cuentaActiva) return
    try {
      await ejecutarAccion(cuentaActiva.id, activeFolder, action, [uid])
      cargarMensajes(cuentaActiva.id, activeFolder, 1)
    } catch {}
  }

  const handleBulkAction = async (action: string) => {
    if (!cuentaActiva || selectedUids.length === 0) return
    try {
      await ejecutarAccion(cuentaActiva.id, activeFolder, action, selectedUids)
      setSelectedUids([])
      cargarMensajes(cuentaActiva.id, activeFolder, 1)
    } catch {}
  }

  const handleSwitchCuenta = (cuenta: any) => {
    seleccionarCuenta(cuenta)
    setSelectedUid(null)
    setSelectedUids([])
    cargarFolders(cuenta.id)
    cargarMensajes(cuenta.id, 'INBOX', 1)
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
        cargarFolders(remaining[0].id)
        cargarMensajes(remaining[0].id, 'INBOX', 1)
      } else {
        setConectado(false)
      }
    }
  }

  if (!conectado || !cuentaActiva) {
    return <CorreoLogin onConectado={handleConectado} />
  }

  return (
    <div className={`flex h-[calc(100vh-120px)] bg-zinc-950/50 rounded-3xl border border-white/5 overflow-hidden ${splitVertical ? 'flex-col' : ''}`}>
      <CorreoSidebar
        folders={folders}
        activeFolder={activeFolder}
        onFolderChange={(f) => { cambiarFolder(f); setSelectedUids([]) }}
        onRedactar={() => { setRespuestaModo('compose'); setRespuestaOpen(true) }}
        onDesconectar={handleDesconectar}
        onSwitchCuenta={handleSwitchCuenta}
        onToggleSplit={handleToggleSplit}
        onToggleTheme={handleToggleTheme}
        onExportPDF={handleExportPDF}
        cuentas={cuentas || []}
        cuentaActiva={cuentaActiva}
        loading={bandejaLoading && messages.length === 0}
        splitVertical={splitVertical}
        themeLight={themeLight}
      />

      <CorreoLista
        messages={messages}
        loading={bandejaLoading}
        searchQuery={searchQuery}
        onSearch={buscar}
        onSelectMessage={handleSelectMessage}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        onRefresh={handleRefresh}
        total={total}
        activeFolder={activeFolder}
        selectedUids={selectedUids}
        onSelectUids={setSelectedUids}
        onBulkAction={handleBulkAction}
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
        onEnviado={() => {
          if (cuentaActiva) cargarMensajes(cuentaActiva.id, activeFolder, 1)
        }}
      />
    </div>
  )
}
