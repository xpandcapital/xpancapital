'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Server, Plus, Trash2, Loader2, AlertCircle, CheckCircle, Globe, Shield, Key } from 'lucide-react'
import { CorreoLogin } from '../../correo/_components/CorreoLogin'

interface CorreoServer {
  id: string
  nombre: string
  dominio: string
  imap_host: string
  imap_port: number
  imap_secure: boolean
  smtp_host: string
  smtp_port: number
  smtp_secure: boolean
  creado_en: string
}

export default function CorreoServidoresPage() {
  const [servidores, setServidores] = useState<CorreoServer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState<CorreoServer | null>(null)
  const [form, setForm] = useState({
    nombre: '',
    dominio: '',
    imap_host: '',
    imap_port: 993,
    imap_secure: true,
    smtp_host: '',
    smtp_port: 465,
    smtp_secure: true,
  })
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const cargarServidores = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/correo/servidores')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setServidores(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargarServidores() }, [])

  const handleGuardar = async () => {
    if (!form.nombre || !form.dominio || !form.imap_host || !form.smtp_host) {
      setError('Completa todos los campos requeridos')
      return
    }

    setSaving(true)
    setError('')
    try {
      const url = '/api/correo/servidores'
      const method = editando ? 'PUT' : 'POST'
      const body = editando ? { id: editando.id, ...form } : form

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')

      setShowForm(false)
      setEditando(null)
      setForm({ nombre: '', dominio: '', imap_host: '', imap_port: 993, imap_secure: true, smtp_host: '', smtp_port: 465, smtp_secure: true })
      cargarServidores()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar este servidor? Las cuentas asociadas dejarán de funcionar.')) return
    try {
      await fetch(`/api/correo/servidores?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      cargarServidores()
    } catch {}
  }

  const handleEditar = (server: CorreoServer) => {
    setForm({
      nombre: server.nombre,
      dominio: server.dominio,
      imap_host: server.imap_host,
      imap_port: server.imap_port,
      imap_secure: server.imap_secure,
      smtp_host: server.smtp_host,
      smtp_port: server.smtp_port,
      smtp_secure: server.smtp_secure,
    })
    setEditando(server)
    setShowForm(true)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Servidores de Correo</h2>
          <p className="text-sm text-gray-400">Configura los servidores IMAP/SMTP corporativos por dominio</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setEditando(null); setForm({ nombre: '', dominio: '', imap_host: '', imap_port: 993, imap_secure: true, smtp_host: '', smtp_port: 465, smtp_secure: true }); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blis-red text-white text-sm font-semibold
            hover:bg-blis-red-neon transition-all"
        >
          <Plus className="w-4 h-4" />
          Agregar Servidor
        </motion.button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      ) : servidores.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/50 border border-white/5 rounded-3xl">
          <Server className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">No hay servidores configurados</p>
          <p className="text-sm text-gray-600 mt-1">Agrega tu primer servidor IMAP/SMTP</p>
        </div>
      ) : (
        <div className="space-y-3">
          {servidores.map((server) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-zinc-900/50 border border-white/10 rounded-2xl hover:border-white/15 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{server.nombre}</h3>
                    <p className="text-sm text-gray-400">@{server.dominio}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        IMAP: {server.imap_host}:{server.imap_port} ({server.imap_secure ? 'SSL' : 'No TLS'})
                      </span>
                      <span className="flex items-center gap-1">
                        <Key className="w-3 h-3" />
                        SMTP: {server.smtp_host}:{server.smtp_port} ({server.smtp_secure ? 'SSL' : 'No TLS'})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditar(server)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Editar
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEliminar(server.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-zinc-900/50 border border-white/10 rounded-2xl space-y-4">
              <h3 className="font-semibold text-white">
                {editando ? 'Editar Servidor' : 'Nuevo Servidor'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Nombre</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Servidor Principal"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600
                      focus:outline-none focus:border-blis-red/30 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Dominio</label>
                  <input
                    type="text"
                    value={form.dominio}
                    onChange={(e) => setForm(f => ({ ...f, dominio: e.target.value }))}
                    placeholder="xpandcapital.org"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600
                      focus:outline-none focus:border-blis-red/30 transition-all"
                  />
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Servidor IMAP (Entrada)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Host</label>
                    <input
                      type="text"
                      value={form.imap_host}
                      onChange={(e) => setForm(f => ({ ...f, imap_host: e.target.value }))}
                      placeholder="mail.dominio.com"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600
                        focus:outline-none focus:border-blis-red/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Puerto</label>
                    <input
                      type="number"
                      value={form.imap_port}
                      onChange={(e) => setForm(f => ({ ...f, imap_port: parseInt(e.target.value) || 993 }))}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white
                        focus:outline-none focus:border-blis-red/30 transition-all"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.imap_secure}
                    onChange={(e) => setForm(f => ({ ...f, imap_secure: e.target.checked }))}
                    className="rounded bg-white/10 border-white/20"
                  />
                  <span className="text-xs text-gray-400">Conexión segura (SSL/TLS)</span>
                </label>
              </div>

              <div className="border-t border-white/5 pt-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Servidor SMTP (Salida)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Host</label>
                    <input
                      type="text"
                      value={form.smtp_host}
                      onChange={(e) => setForm(f => ({ ...f, smtp_host: e.target.value }))}
                      placeholder="mail.dominio.com"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600
                        focus:outline-none focus:border-blis-red/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Puerto</label>
                    <input
                      type="number"
                      value={form.smtp_port}
                      onChange={(e) => setForm(f => ({ ...f, smtp_port: parseInt(e.target.value) || 465 }))}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white
                        focus:outline-none focus:border-blis-red/30 transition-all"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.smtp_secure}
                    onChange={(e) => setForm(f => ({ ...f, smtp_secure: e.target.checked }))}
                    className="rounded bg-white/10 border-white/20"
                  />
                  <span className="text-xs text-gray-400">Conexión segura (SSL/TLS)</span>
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blis-red/10 border border-blis-red/20">
                  <AlertCircle className="w-4 h-4 text-blis-red" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGuardar}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blis-red text-white text-sm font-semibold
                    hover:bg-blis-red-neon disabled:opacity-40 transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {editando ? 'Actualizar' : 'Crear Servidor'}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

