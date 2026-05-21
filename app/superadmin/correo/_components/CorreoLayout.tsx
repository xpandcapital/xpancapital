'use client'

import { useState, useEffect, useCallback } from 'react'
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

export function CorreoLayout() {
  const { cuentaActiva, loading: cuentaLoading, cargarCuentas, desconectarCuenta, seleccionarCuenta } = useCorreoCuenta()
  const {
    folders, activeFolder, messages, total, hasMore, loading: bandejaLoading,
    searchQuery, cargarFolders, cargarMensajes, cambiarFolder, buscar, cargarMas, setError: setBandejaError
  } = useCorreoBandeja()
  const {
    mensaje, loading: mensajeLoading, traduciendo, mostrarTraduccion, traduccion,
    cargarMensaje, marcarComoLeido, toggleTraduccion, verOriginal
  } = useCorreoMensaje()
  const { enviarRespuesta, ejecutarAccion, sending } = useCorreoEnvio()

  const [conectado, setConectado] = useState(false)
  const [respuestaOpen, setRespuestaOpen] = useState(false)
  const [respuestaModo, setRespuestaModo] = useState<'reply' | 'replyAll' | 'forward' | 'compose'>('reply')
  const [selectedUid, setSelectedUid] = useState<number | null>(null)

  useEffect(() => {
    cargarCuentas()
  }, [])

  useEffect(() => {
    if (cuentaActiva) {
      cargarFolders(cuentaActiva.id)
      cargarMensajes(cuentaActiva.id, activeFolder, 1)
    }
  }, [cuentaActiva])

  useEffect(() => {
    if (cuentaActiva) {
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

  const handleConectado = async (result: any) => {
    await cargarCuentas()
    const cuentas = await cargarCuentas()
    if (cuentas && cuentas.length > 0) {
      const cuentaConectada = cuentas.find((c: any) => c.email === result.email)
      if (cuentaConectada) {
        seleccionarCuenta(cuentaConectada)
        setConectado(true)
      }
    }
  }

  const handleSelectMessage = async (uid: number) => {
    if (!cuentaActiva) return
    setSelectedUid(uid)
    await cargarMensaje(cuentaActiva.id, uid, activeFolder)
    await marcarComoLeido(cuentaActiva.id, uid, activeFolder)
  }

  const handleRefresh = () => {
    if (cuentaActiva) {
      cargarMensajes(cuentaActiva.id, activeFolder, 1)
    }
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

  const handleDesconectar = () => {
    if (cuentaActiva) {
      desconectarCuenta(cuentaActiva.id)
      setConectado(false)
    }
  }

  if (!conectado || !cuentaActiva) {
    return <CorreoLogin onConectado={handleConectado} />
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-zinc-950/50 rounded-3xl border border-white/5 overflow-hidden">
      <CorreoSidebar
        folders={folders}
        activeFolder={activeFolder}
        onFolderChange={cambiarFolder}
        onRedactar={() => {
          setRespuestaModo('compose')
          setRespuestaOpen(true)
        }}
        onDesconectar={handleDesconectar}
        loading={bandejaLoading && messages.length === 0}
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
      />

      <CorreoVisor
        mensaje={mensaje}
        loading={mensajeLoading}
        cuentaId={cuentaActiva?.id || ''}
        activeFolder={activeFolder}
        onResponder={handleResponder}
        onAccion={handleAccion}
      />

      <CorreoRespuesta
        open={respuestaOpen}
        modo={respuestaModo}
        mensajeOriginal={mensaje}
        cuentaEmail={cuentaActiva?.email || ''}
        cuentaNombre={cuentaActiva?.nombre_mostrado || ''}
        cuentaId={cuentaActiva?.id || ''}
        activeFolder={activeFolder}
        onClose={() => setRespuestaOpen(false)}
        onEnviado={() => {
          cargarMensajes(cuentaActiva!.id, activeFolder, 1)
        }}
      />
    </div>
  )
}
