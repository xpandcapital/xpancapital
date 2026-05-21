'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CorreoLogin } from './CorreoLogin'
import { CorreoSidebar } from './CorreoSidebar'
import { CorreoLista } from './CorreoLista'
import { CorreoVisor } from './CorreoVisor'
import { CorreoRespuesta } from './CorreoRespuesta'
import { useCorreoCuenta } from '../_hooks/useCorreoCuenta'
import { useCorreoBandeja } from '../_hooks/useCorreoBandeja'
import { useCorreoMensaje } from '../_hooks/useCorreoMensaje'
import { useCorreoEnvio } from '../_hooks/useCorreoEnvio'
import type { EmailMessageFull } from '../_types'

type CuentaCache = {
  folders: any[]
  activeFolder: string
  messages: any[]
  total: number
  page: number
  hasMore: boolean
  searchQuery: string
}

export function CorreoLayout() {
  const { cuentaActiva, cuentas, loading: cuentaLoading, cargarCuentas, desconectarCuenta, seleccionarCuenta } = useCorreoCuenta()
  const {
    folders, activeFolder, messages, total, hasMore, loading: bandejaLoading,
    searchQuery, cargarFolders, cargarMensajes, cambiarFolder, buscar, cargarMas, setError: setBandejaError
  } = useCorreoBandeja()
  const {
    mensaje, loading: mensajeLoading, traduciendo, mostrarTraduccion, traduccion,
    cargarMensaje, toggleTraduccion, verOriginal
  } = useCorreoMensaje()
  const { enviarRespuesta, ejecutarAccion, sending } = useCorreoEnvio()

  const [conectado, setConectado] = useState(false)
  const [respuestaOpen, setRespuestaOpen] = useState(false)
  const [respuestaModo, setRespuestaModo] = useState<'reply' | 'replyAll' | 'forward' | 'compose'>('reply')
  const [selectedUid, setSelectedUid] = useState<number | null>(null)
  const [selectedUids, setSelectedUids] = useState<number[]>([])
  const [cuentaCaches, setCuentaCaches] = useState<Record<string, CuentaCache>>({})
  const [splitVertical, setSplitVertical] = useState(false)
  const [themeLight, setThemeLight] = useState(false)

  // Auto-detect theme
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    setThemeLight(mq.matches)
    const handler = (e: MediaQueryListEvent) => setThemeLight(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      const key = e.key.toLowerCase()
      if (key === 'r' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('reply'); setRespuestaOpen(true) }
      if (key === 'a' && e.ctrlKey && !e.shiftKey) { e.preventDefault(); setRespuestaModo('replyAll'); setRespuestaOpen(true) }
      if (key === 'f' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('forward'); setRespuestaOpen(true) }
      if (key === 'n' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setRespuestaModo('compose'); setRespuestaOpen(true) }
      if (key === 'delete' && selectedUid) { e.preventDefault(); handleAccion('delete', selectedUid) }
      if (key === 's' && selectedUid && !e.ctrlKey) { e.preventDefault(); handleAccion(mensaje?.isFlagged ? 'unflag' : 'flag', selectedUid) }
      if (key === 'e' && selectedUid) { e.preventDefault(); handleAccion('moveToArchive', selectedUid) }
      if (key === '/' && !e.ctrlKey) { e.preventDefault(); buscar('') }
      if (key === 'escape') { setRespuestaOpen(false); setSelectedUids([]) }
      if (key === '?' && e.shiftKey) { alert('Atajos:\nR=Responder  A=Responder todos  F=Reenviar  N=Nuevo\nDel=Eliminar  S=Estrella  E=Archivar  /=Buscar  Esc=Cerrar') }
      if (key === 'j' && !e.ctrlKey && cuentaActiva) { /* navigate next message */ }
      if (key === 'k' && !e.ctrlKey && cuentaActiva) { /* navigate prev message */ }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedUid, mensaje, cuentaActiva])

  useEffect(() => {
    cargarCuentas()
  }, [])

  useEffect(() => {
    if (cuentaActiva) {
      const cached = cuentaCaches[cuentaActiva.id]
      if (cached) {
        cargarFolders(cuentaActiva.id)
        cargarMensajes(cuentaActiva.id, cached.activeFolder, 1, cached.searchQuery)
      } else {
        cargarFolders(cuentaActiva.id)
        cargarMensajes(cuentaActiva.id, activeFolder, 1)
      }
    }
  }, [cuentaActiva])

  useEffect(() => {
    if (cuentaActiva) {
      if (cuentaCaches[cuentaActiva.id]) {
        const cached = cuentaCaches[cuentaActiva.id]
        if (cached.activeFolder === activeFolder && cached.messages.length > 0) return
      }
      cargarMensajes(cuentaActiva.id, activeFolder, 1)
    }
  }, [activeFolder])

  useEffect(() => {
    if (cuentaActiva && searchQuery !== undefined) {
      const timer = setTimeout(() => {
        cargarMensajes(cuentaActiva.id, activeFolder, 1, searchQuery)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [searchQuery])

  // Cache current state before switching
  const saveCache = useCallback(() => {
    if (cuentaActiva) {
      setCuentaCaches(prev => ({
        ...prev,
        [cuentaActiva.id]: { folders, activeFolder, messages, total, page: 1, hasMore, searchQuery }
      }))
    }
  }, [cuentaActiva, folders, activeFolder, messages, total, hasMore, searchQuery])

  const handleConectado = async (result: any) => {
    await cargarCuentas()
    const cuentasList = await cargarCuentas()
    if (cuentasList && cuentasList.length > 0) {
      const cuentaConectada = cuentasList.find((c: any) => c.email === result.email)
      if (cuentaConectada) {
        saveCache()
        seleccionarCuenta(cuentaConectada)
        setConectado(true)
      }
    }
  }

  const handleSelectMessage = async (uid: number) => {
    if (!cuentaActiva) return
    setSelectedUid(uid)
    await cargarMensaje(cuentaActiva.id, uid, activeFolder)
  }

  const handleRefresh = () => {
    if (cuentaActiva) cargarMensajes(cuentaActiva.id, activeFolder, 1)
  }

  const handleLoadMore = () => {
    if (cuentaActiva) cargarMas(cuentaActiva.id)
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
    saveCache()
    seleccionarCuenta(cuenta)
    setSelectedUid(null)
    setSelectedUids([])
  }

  const handleToggleSplit = () => setSplitVertical(!splitVertical)
  const handleToggleTheme = () => setThemeLight(!themeLight)

  const handleExportPDF = () => {
    window.print()
  }

  const handleDesconectar = () => {
    if (cuentaActiva) {
      desconectarCuenta(cuentaActiva.id)
      setConectado(conexiones => {
        const remaining = cuentas?.filter(c => c.id !== cuentaActiva?.id) || []
        if (remaining.length > 0) {
          seleccionarCuenta(remaining[0])
          return true
        }
        return false
      })
    }
  }

  if (!conectado || !cuentaActiva) {
    return <CorreoLogin onConectado={handleConectado} />
  }

  return (
    <div className={`flex h-[calc(100vh-120px)] bg-zinc-950/50 rounded-3xl border border-white/5 overflow-hidden ${splitVertical ? 'flex-col' : ''} ${themeLight ? 'theme-light' : ''}`}>
      <CorreoSidebar
        folders={folders}
        activeFolder={activeFolder}
        onFolderChange={(f) => { saveCache(); cambiarFolder(f); setSelectedUids([]) }}
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
