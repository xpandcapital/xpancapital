'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Loader2, Camera, Palette, Upload } from 'lucide-react'
import type { EmailCuenta } from '../_types'
import { SearchableSelect } from '@/components/ui/SearchableSelect'

interface Props {
  open: boolean
  cuenta: EmailCuenta | null
  onClose: () => void
  onGuardado: () => void
}

const PRESET_COLORS = [
  '#d5c108', '#4F46E5', '#0891B2', '#059669',
  '#D97706', '#DC2626', '#7C3AED', '#DB2777',
  '#0F172A', '#334155',
]

export function CorreoConfigCuenta({ open, cuenta, onClose, onGuardado }: Props) {
  const [nombre, setNombre] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [color, setColor] = useState('#d5c108')
  const [firma, setFirma] = useState('')
  const [plantillaDefault, setPlantillaDefault] = useState('')
  const [templates, setTemplates] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && cuenta) {
      setNombre(cuenta.nombre_mostrado || '')
      setDepartamento(cuenta.departamento || '')
      setAvatarUrl(cuenta.avatar_url || '')
      setColor(cuenta.color || '#d5c108')
      setFirma(cuenta.firma || '')
      setPlantillaDefault(cuenta.plantilla_default_id || '')
      cargarTemplates()
    }
  }, [open, cuenta])

  const cargarTemplates = async () => {
    try {
      const res = await fetch('/api/email-templates')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) setTemplates(data.data)
    } catch {}
  }

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'media')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir')
      setAvatarUrl(data.url || data.publicUrl || '')
    } catch (e: any) {
      setError('Error al subir imagen: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleGuardar = async () => {
    if (!cuenta) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/correo/cuentas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cuenta.id,
          nombre_mostrado: nombre,
          departamento: departamento || null,
          avatar_url: avatarUrl || null,
          color: color || null,
          firma: firma || null,
          plantilla_default_id: plantillaDefault || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')
      onGuardado()
      onClose()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (!open || !cuenta) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
          <h3 className="text-sm font-bold text-white">Configurar cuenta</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {/* Nombre */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Nombre para mostrar</label>
            <input
              type="text" value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Central Xpand Capital"
              className="w-full"
            />
          </div>

          {/* Departamento */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Departamento / Área</label>
            <input
              type="text" value={departamento} onChange={e => setDepartamento(e.target.value)}
              placeholder="Atención al Cliente"
              className="w-full"
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1 flex items-center gap-1">
              <Camera className="w-3 h-3" /> Imagen / Logo
            </label>
            <div className="flex items-center gap-3">
              <input
                type="url" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://...logo.png"
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blis-red/30 transition-all"
              />
              <input
                type="file" ref={fileRef} accept="image/*" onChange={handleUploadAvatar}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 text-xs text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-colors"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploading ? 'Subiendo...' : 'Archivo'}
              </button>
            </div>
            {avatarUrl && (
              <div className="mt-2 w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                <img src={avatarUrl} alt="Avatar" className="w-full" />
              </div>
            )}
          </div>

          {/* Color de acento */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase mb-2 flex items-center gap-1">
              <Palette className="w-3 h-3" /> Color de acento
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-lg border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="w-px h-6 bg-white/10" />
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
              />
            </div>
          </div>

          {/* Firma */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Firma HTML</label>
            <textarea
              value={firma} onChange={e => setFirma(e.target.value)}
              placeholder='&lt;p&gt;Saludos,&lt;br&gt;&lt;b&gt;Central Xpand Capital&lt;/b&gt;&lt;/p&gt;'
              className="w-full"
            />
          </div>

          {/* Plantilla predeterminada */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Plantilla por defecto al responder</label>
            <SearchableSelect
              value={plantillaDefault}
              onChange={setPlantillaDefault}
              options={[
                { value: '', label: 'Ninguna (texto plano)' },
                ...templates.map((t: any) => ({ value: t.id, label: t.nombre })),
              ]}
              className="w-full"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-blis-red/10 border border-blis-red/20">
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-white/5 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleGuardar}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blis-red text-white text-sm font-semibold hover:bg-blis-red-neon disabled:opacity-40 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : 'Guardar'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}


