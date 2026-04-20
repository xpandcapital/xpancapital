"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Save, Upload, FileText, X, Loader2, ChevronDown } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { Postulante, ESTADO_LABELS, ESTADO_COLORS, gruposPreguntas, diccionarioPreguntas } from '../_types'

type Tab = 'datos' | 'logistica' | 'profesional' | 'experiencia' | 'psicologia' | 'alineacion' | 'admin'

const TAB_CONFIG: { id: Tab; label: string; groupIndex: number }[] = [
  { id: 'datos', label: 'Datos Personales', groupIndex: 1 },
  { id: 'logistica', label: 'Logística', groupIndex: 2 },
  { id: 'profesional', label: 'Profesional', groupIndex: 3 },
  { id: 'experiencia', label: 'Experiencia', groupIndex: 4 },
  { id: 'psicologia', label: 'Psicología', groupIndex: 5 },
  { id: 'alineacion', label: 'Alineación', groupIndex: 6 },
  { id: 'admin', label: 'Admin', groupIndex: 0 },
]

const ESTADO_OPTIONS = [
  { value: 'nuevo', label: 'Nuevo', color: 'bg-blue-500' },
  { value: 'en_revision', label: 'En Revisión', color: 'bg-amber-500' },
  { value: 'entrevista', label: 'Entrevista', color: 'bg-purple-500' },
  { value: 'aceptado', label: 'Aceptado', color: 'bg-emerald-500' },
  { value: 'rechazado', label: 'Rechazado', color: 'bg-rose-500' },
]

export default function PostulanteEditPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const id = params.id as string

  const [postulante, setPostulante] = useState<Postulante | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('datos')
  const [form, setForm] = useState<Record<string, any>>({})
  const [uploading, setUploading] = useState(false)

  const fetchPostulante = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/postulantes/${id}`)
      const data = await res.json()
      if (data.success && data.data) {
        setPostulante(data.data)
        setForm(data.data)
      } else {
        showToast('Postulante no encontrado', 'error')
        router.push('/superadmin/postulantes')
      }
    } catch { showToast('Error al cargar', 'error') }
    finally { setLoading(false) }
  }, [id, router, showToast])

  useEffect(() => { fetchPostulante() }, [fetchPostulante])

  const upd = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/postulantes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Cambios guardados', 'success')
        setPostulante(data.data)
        setForm(data.data)
      } else {
        showToast(data.error || 'Error al guardar', 'error')
      }
    } catch { showToast('Error al guardar', 'error') }
    finally { setSaving(false) }
  }

  const handleUploadCV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'cvs')
      const res = await fetch('/api/postulantes/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        upd('cv_archivo', data.url)
        await fetch(`/api/postulantes/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cv_archivo: data.url }),
        })
        showToast('CV subido correctamente', 'success')
      } else {
        showToast(data.error || 'Error al subir', 'error')
      }
    } catch { showToast('Error al subir archivo', 'error') }
    finally { setUploading(false) }
  }

  const input = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 placeholder:text-gray-600"
  const selectCls = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 appearance-none"
  const dateCls = "w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blis-red/50 [color-scheme:dark]"
  const label = "text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block"

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 text-blis-red animate-spin" /></div>
  }

  if (!postulante) return null

  const currentGroup = gruposPreguntas[TAB_CONFIG.find(t => t.id === activeTab)?.groupIndex || 0]

  return (
    <div className="w-full mx-auto px-4 md:px-8 pt-8 pb-20 bg-black">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/superadmin/postulantes')} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 rounded-xl bg-blis-red/10 text-blis-red border border-blis-red/20 flex items-center justify-center font-black text-lg">
          {(form.nombre_completo || '?').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-white truncate">{form.nombre_completo || 'Sin nombre'}</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">{form.correo_contacto}</span>
            {form.puesto_postula && <span className="text-gray-600 text-[10px]">· {form.puesto_postula}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {ESTADO_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => upd('estado', opt.value)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${form.estado === opt.value ? `${opt.color} text-white` : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-blis-red text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
          <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TAB_CONFIG.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-blis-red text-white shadow-[0_4px_12px_rgba(190,11,60,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 md:p-8">
        {activeTab === 'admin' && (
          <div className="space-y-5">
            <h2 className="text-lg font-black text-white uppercase tracking-wide border-b border-white/5 pb-4">Administración</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className={label}>Puesto que postula</label><input type="text" value={form.puesto_postula || ''} onChange={e => upd('puesto_postula', e.target.value)} className={input} /></div>
              <div><label className={label}>Calificación</label><input type="text" value={form.calificacion || ''} onChange={e => upd('calificacion', e.target.value)} className={input} /></div>
              <div><label className={label}>Fecha de entrevista</label><input type="date" value={form.fecha_entrevista?.split('T')[0] || ''} onChange={e => upd('fecha_entrevista', e.target.value)} className={dateCls} /></div>
              <div><label className={label}>Proyecto interesado</label><input type="text" value={form.proyecto_interesado || ''} onChange={e => upd('proyecto_interesado', e.target.value)} className={input} /></div>
              <div>
                <label className={label}>Tipo de entrevista</label>
                <div className="relative">
                  <select value={form.entrevista_tipo || ''} onChange={e => upd('entrevista_tipo', e.target.value)} className={selectCls}>
                    <option value="">Sin definir</option>
                    <option value="presencial">Presencial</option>
                    <option value="videoconferencia">Videoconferencia</option>
                    <option value="telefonica">Telefónica</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div><label className={label}>Notas de entrevista</label><textarea value={form.entrevista_notas || ''} onChange={e => upd('entrevista_notas', e.target.value)} className={`${input} resize-none`} rows={3} /></div>
            </div>
            <div className="border-t border-white/5 pt-5">
              <label className={label}>CV / Portafolio</label>
              <div className="flex items-center gap-4">
                {form.cv_archivo ? (
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-1">
                    <FileText className="w-5 h-5 text-blis-red" />
                    <a href={form.cv_archivo} target="_blank" rel="noopener noreferrer" className="text-white text-sm hover:text-blis-red transition-colors underline">Ver CV</a>
                    <button onClick={async () => { upd('cv_archivo', null); await fetch(`/api/postulantes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cv_archivo: null }) }); showToast('CV eliminado', 'success') }} className="p-1 hover:bg-red-500/10 rounded text-gray-500 hover:text-red-400"><X className="w-4 h-4" /></button>
                  </div>
                ) : null}
                <label className={`flex items-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : 'bg-white/5 border border-dashed border-white/20 hover:border-blis-red/50 hover:bg-blis-red/5'}`}>
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">{uploading ? 'Subiendo...' : form.cv_archivo ? 'Reemplazar' : 'Subir CV'}</span>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={handleUploadCV} className="hidden" disabled={uploading} />
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'admin' && currentGroup && (
          <div className="space-y-5">
            <h2 className="text-lg font-black text-white uppercase tracking-wide border-b border-white/5 pb-4">{currentGroup.titulo}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {currentGroup.campos.map(key => {
                const lbl = diccionarioPreguntas[key] || key
                const value = form[key]
                const isLongText = key.startsWith('experiencia') || key.startsWith('motivo') || key.startsWith('resolucion') || key.startsWith('manejo') || key.startsWith('porque') || key.startsWith('conocimiento') || key.startsWith('areas') || key.startsWith('actualizacion') || key.startsWith('informacion') || key.startsWith('preguntas_candidato') || key.startsWith('condicion') || key.startsWith('disponibilidad_horarios') || key.startsWith('compromisos') || key.startsWith('capacitaciones') || key.startsWith('herramientas') || key.startsWith('roles_disfrutados') || key.startsWith('trabajo_equipo') || key.startsWith('entrevista_notas')
                const isSelect = key === 'estado_civil' || key === 'disponibilidad_inmediata' || key === 'disponibilidad_viaje' || key === 'preferencia_trabajo' || key === 'nivel_estudios'
                const isBoolean = key === 'check_portafolio'
                const isDate = key === 'fecha_nacimiento' || key === 'fecha_entrevista'
                const isCvField = key === 'cv_archivo'

                if (isCvField) return null

                if (isBoolean) {
                  return (
                    <div key={key} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={!!value} onChange={e => upd(key, e.target.checked)} className="sr-only peer" />
                        <div className="w-12 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blis-red after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                      </label>
                      <span className="text-white text-sm font-bold">{lbl}</span>
                    </div>
                  )
                }

                if (isLongText) {
                  return (
                    <div key={key} className="md:col-span-2">
                      <label className={label}>{lbl}</label>
                      <textarea value={value || ''} onChange={e => upd(key, e.target.value)} className={`${input} resize-none`} rows={3} />
                    </div>
                  )
                }

                if (isSelect && key === 'estado_civil') {
                  return (
                    <div key={key}>
                      <label className={label}>{lbl}</label>
                      <div className="relative">
                        <select value={value || ''} onChange={e => upd(key, e.target.value)} className={selectCls}>
                          <option value="">Seleccionar</option>
                          <option value="soltero/a">Soltero/a</option>
                          <option value="casado/a">Casado/a</option>
                          <option value="divorciado/a">Divorciado/a</option>
                          <option value="viudo/a">Viudo/a</option>
                          <option value="union_libre">Unión libre</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  )
                }

                if (isSelect && (key === 'disponibilidad_inmediata' || key === 'disponibilidad_viaje')) {
                  return (
                    <div key={key}>
                      <label className={label}>{lbl}</label>
                      <div className="relative">
                        <select value={value || ''} onChange={e => upd(key, e.target.value)} className={selectCls}>
                          <option value="">Seleccionar</option>
                          <option value="si">Sí</option>
                          <option value="no">No</option>
                          <option value="condicionado">Condicionado</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  )
                }

                if (isSelect && key === 'preferencia_trabajo') {
                  return (
                    <div key={key}>
                      <label className={label}>{lbl}</label>
                      <div className="relative">
                        <select value={value || ''} onChange={e => upd(key, e.target.value)} className={selectCls}>
                          <option value="">Seleccionar</option>
                          <option value="solo">Solo</option>
                          <option value="en_equipo">En equipo</option>
                          <option value="indiferente">Indiferente</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  )
                }

                if (isSelect && key === 'nivel_estudios') {
                  return (
                    <div key={key}>
                      <label className={label}>{lbl}</label>
                      <div className="relative">
                        <select value={value || ''} onChange={e => upd(key, e.target.value)} className={selectCls}>
                          <option value="">Seleccionar</option>
                          <option value="primaria">Primaria</option>
                          <option value="secundaria">Secundaria</option>
                          <option value="tecnico">Técnico</option>
                          <option value="universitario">Universitario</option>
                          <option value="postgrado">Postgrado</option>
                          <option value="maestria">Maestría</option>
                          <option value="doctorado">Doctorado</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  )
                }

                if (isDate) {
                  return (
                    <div key={key}>
                      <label className={label}>{lbl}</label>
                      <input type="date" value={value?.split('T')[0] || ''} onChange={e => upd(key, e.target.value)} className={dateCls} />
                    </div>
                  )
                }

                return (
                  <div key={key}>
                    <label className={label}>{lbl}</label>
                    <input type={key.includes('salarial') || key.includes('anos') ? 'number' : 'text'} value={value || ''} onChange={e => upd(key, e.target.value)} className={input} />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="bg-blis-red text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_10px_20px_rgba(190,11,60,0.3)]">
          <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  )
}