"use client"

import { use, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Upload, ChevronDown, ChevronUp, Send, AlertCircle, Loader2, Briefcase } from 'lucide-react'
import type { PuestoTrabajo, PuestoPregunta } from '@/app/superadmin/postulantes/_types'

type PreguntaConPuesto = PuestoPregunta & {
  pregunta: NonNullable<PuestoPregunta['pregunta']>
}

interface GroupedQuestions {
  titulo: string
  preguntas: PreguntaConPuesto[]
}

export default function PostulanteFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const [puesto, setPuesto] = useState<PuestoTrabajo | null>(null)
  const [groupedQuestions, setGroupedQuestions] = useState<GroupedQuestions[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [fileUploads, setFileUploads] = useState<Record<string, { file: File; url: string } | null>>({})
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/postulantes/puestos/by-slug/${resolvedParams.slug}`)
        const data = await res.json()
        if (!data.success) {
          setError(data.error || 'Puesto no encontrado')
          return
        }
        setPuesto(data.data.puesto)
        const preguntas: PreguntaConPuesto[] = (data.data.preguntas || []).filter(
          (pp: PreguntaConPuesto) => pp.pregunta && pp.visible_formulario
        )
        const groups: Record<string, PreguntaConPuesto[]> = {}
        for (const pp of preguntas) {
          const grupo = pp.pregunta?.grupo || 'Otro'
          if (!groups[grupo]) groups[grupo] = []
          groups[grupo].push(pp)
        }
        const grouped: GroupedQuestions[] = Object.entries(groups).map(([titulo, preguntas]) => ({
          titulo,
          preguntas: preguntas.sort((a, b) => a.orden - b.orden),
        }))
        setGroupedQuestions(grouped)
      } catch {
        setError('Error al cargar el formulario')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [resolvedParams.slug])

  const totalQuestions = groupedQuestions.reduce((sum, g) => sum + g.preguntas.length, 0)
  const answeredCount = Object.values(formValues).filter(v => v && v.trim()).length + Object.values(fileUploads).filter(v => v?.url).length
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  const handleChange = (preguntaId: string, value: string) => {
    setFormValues(prev => ({ ...prev, [preguntaId]: value }))
    setValidationErrors(prev => {
      const next = { ...prev }
      delete next[preguntaId]
      return next
    })
  }

  const handleFileSelect = async (preguntaId: string, preguntaKey: string, file: File) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type)) {
      setValidationErrors(prev => ({ ...prev, [preguntaId]: 'Solo PDF, DOC o DOCX' }))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setValidationErrors(prev => ({ ...prev, [preguntaId]: 'Máximo 10MB' }))
      return
    }
    setUploading(prev => ({ ...prev, [preguntaId]: true }))
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'cvs')
      const res = await fetch('/api/postulantes/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setFileUploads(prev => ({ ...prev, [preguntaId]: { file, url: data.url } }))
        setFormValues(prev => ({ ...prev, [preguntaKey]: data.url }))
      } else {
        setValidationErrors(prev => ({ ...prev, [preguntaId]: data.error || 'Error al subir' }))
      }
    } catch {
      setValidationErrors(prev => ({ ...prev, [preguntaId]: 'Error al subir archivo' }))
    } finally {
      setUploading(prev => ({ ...prev, [preguntaId]: false }))
    }
  }

  const toggleGroup = (titulo: string) => {
    setCollapsedGroups(prev => ({ ...prev, [titulo]: !prev[titulo] }))
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    for (const g of groupedQuestions) {
      for (const pp of g.preguntas) {
        if (pp.requerido) {
          const key = pp.pregunta.key
          const val = formValues[key]
          const hasFile = !!fileUploads[pp.pregunta_id]?.url
          if ((!val || !val.trim()) && !hasFile) {
            errors[pp.pregunta_id] = 'Este campo es requerido'
          }
        }
      }
    }
    if (!formValues.correo_contacto?.trim()) {
      errors['correo_contacto'] = 'Correo es requerido'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (!puesto) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const flatFields: Record<string, string> = { ...formValues }
      const respuestas: Array<{ pregunta_id: string; valor: string }> = []

      for (const g of groupedQuestions) {
        for (const pp of g.preguntas) {
          const val = formValues[pp.pregunta.key] || ''
          if (val) {
            respuestas.push({ pregunta_id: pp.pregunta_id, valor: val })
          }
        }
      }

      const payload = {
        ...flatFields,
        puesto_trabajo_id: puesto.id,
        puesto_postula: puesto.nombre,
        respuestas,
      }

      const res = await fetch('/api/postulantes/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.error) {
        if (res.status === 409) {
          setSubmitError('Ya existe una postulación con este correo electrónico.')
        } else {
          setSubmitError(data.error)
        }
        return
      }

      setSubmitted(true)
    } catch {
      setSubmitError('Error al enviar. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-white/20 border-t-blis-red rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-sm">Cargando formulario...</p>
        </div>
      </div>
    )
  }

  if (error || !puesto) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 rounded-full bg-blis-red/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-blis-red" />
          </div>
          <h1 className="text-3xl font-black mb-3">Formulario no encontrado</h1>
          <p className="text-gray-400 mb-8">{error || 'El puesto que buscas no existe o no está disponible.'}</p>
          <a href="/" className="px-8 py-3 bg-blis-red text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:scale-105 transition-all shadow-[0_10px_20px_rgba(213,193,8,0.3)]">
            Volver al inicio
          </a>
        </div>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-8">
            <Check className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black mb-3">¡Postulación enviada!</h1>
          <p className="text-gray-400 mb-2">Gracias por aplicar a <span className="text-white font-semibold">{puesto.nombre}</span>.</p>
          <p className="text-gray-500 text-sm mb-8">Revisaremos tu información y te contactaremos pronto.</p>
          <a href="/" className="px-8 py-3 bg-blis-red text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:scale-105 transition-all shadow-[0_10px_20px_rgba(213,193,8,0.3)]">
            Volver al inicio
          </a>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blis-red/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 py-12 sm:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blis-red/10 border border-blis-red/20 rounded-full mb-6">
              <Briefcase className="w-4 h-4 text-blis-red" />
              <span className="text-blis-red text-xs font-bold uppercase tracking-wider">Postulación</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">{puesto.nombre}</h1>
            {puesto.descripcion && <p className="text-gray-400 text-sm max-w-lg mx-auto">{puesto.descripcion}</p>}

            <div className="mt-8 max-w-xs mx-auto">
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500 mb-2">
                <span>Progreso</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #d5c108, #209f89)' }} initial={{ width: '0%' }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.3 }} />
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {groupedQuestions.map((group, gi) => {
              const isCollapsed = collapsedGroups[group.titulo]
              return (
                <motion.div key={group.titulo} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}
                  className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden">
                  <button type="button" onClick={() => toggleGroup(group.titulo)}
                    className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-blis-red bg-blis-red/10 rounded-md px-2 py-1">{gi + 1}</span>
                      <h2 className="text-sm font-bold uppercase tracking-wider">{group.titulo}</h2>
                      <span className="text-[10px] text-gray-500">{group.preguntas.length} preguntas</span>
                    </div>
                    {isCollapsed ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500" />}
                  </button>

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-5 pb-5 space-y-4">
                          {group.preguntas.map(pp => (
                            <QuestionField key={pp.pregunta_id} pp={pp} value={formValues[pp.pregunta.key] || ''}
                              error={validationErrors[pp.pregunta_id]}
                              onChange={val => handleChange(pp.pregunta_id, val)}
                              onFileChange={file => handleFileSelect(pp.pregunta_id, pp.pregunta.key, file)}
                              uploading={uploading[pp.pregunta_id] || false}
                              uploadedFile={fileUploads[pp.pregunta_id] || null} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}

            {submitError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{submitError}</p>
              </motion.div>
            )}

            <div className="pt-4 pb-20">
              <button type="submit" disabled={submitting}
                className="w-full py-4 bg-blis-red text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(213,193,8,0.4)]">
                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</> : <><Send className="w-5 h-5" /> Enviar Postulación</>}
              </button>
              <p className="text-center text-gray-600 text-xs mt-3">Al enviar, confirmas que la información es verídica.</p>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

interface QuestionFieldProps {
  pp: PreguntaConPuesto
  value: string
  error?: string
  onChange: (val: string) => void
  onFileChange: (file: File) => void
  uploading: boolean
  uploadedFile: { file: File; url: string } | null
}

function QuestionField({ pp, value, error, onChange, onFileChange, uploading, uploadedFile }: QuestionFieldProps) {
  const { pregunta } = pp
  const label = pp.label_publico || pregunta.label_base
  const helpText = pp.texto_apoyo_publico || pregunta.texto_apoyo || ''
  const type = pregunta.tipo
  const opciones = pregunta.opciones || []

  const baseClass = `w-full bg-black/50 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all placeholder:text-gray-600 ${error ? 'border-red-500/50 focus:border-red-400' : 'border-white/10 focus:border-blis-red/50'}`

  return (
    <div>
      <label className="block mb-2">
        <span className="text-sm font-semibold text-white">{label}</span>
        {pp.requerido && <span className="text-blis-red ml-1">*</span>}
      </label>
      {helpText && <p className="text-gray-500 text-xs mb-2">{helpText}</p>}

      {type === 'text' && (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={pregunta.placeholder || ''} className={baseClass} />
      )}

      {type === 'textarea' && (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={pregunta.placeholder || ''} rows={3} className={`${baseClass} resize-none`} />
      )}

      {type === 'number' && (
        <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={pregunta.placeholder || ''} className={baseClass} />
      )}

      {type === 'date' && (
        <input type="date" value={value} onChange={e => onChange(e.target.value)} className={baseClass} />
      )}

      {type === 'boolean' && (
        <div className="flex items-center gap-4">
          {[{ val: 'Sí', label: 'Sí' }, { val: 'No', label: 'No' }].map(opt => (
            <button key={opt.val} type="button" onClick={() => onChange(opt.val)}
              className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${value === opt.val ? 'bg-blis-red/10 border-blis-red/40 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {type === 'select' && opciones.length > 0 && (
        <select value={value} onChange={e => onChange(e.target.value)} className={baseClass}>
          <option value="">Seleccionar...</option>
          {opciones.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      )}

      {type === 'select' && opciones.length === 0 && (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={pregunta.placeholder || ''} className={baseClass} />
      )}

      {type === 'checkbox' && opciones.length > 0 && (
        <div className="space-y-2">
          {opciones.map(opt => {
            const checked = value ? value.split(',').map(s => s.trim()).includes(opt.value) : false
            return (
              <label key={opt.value} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                <input type="checkbox" checked={checked} onChange={e => {
                  const current = value ? value.split(',').map(s => s.trim()).filter(Boolean) : []
                  const next = e.target.checked ? [...current, opt.value] : current.filter(v => v !== opt.value)
                  onChange(next.join(', '))
                }} className="w-4 h-4 rounded border-white/20 bg-black/50 text-blis-red focus:ring-blis-red focus:ring-offset-0" />
                <span className="text-sm">{opt.label}</span>
              </label>
            )
          })}
        </div>
      )}

      {type === 'file' && (
        <div>
          {uploadedFile ? (
            <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300 truncate">{uploadedFile.file.name}</span>
              <button type="button" onClick={() => { onFileChange(null as any); onChange('') }} className="ml-auto text-gray-500 hover:text-white text-xs">Quitar</button>
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center p-6 border border-dashed rounded-xl cursor-pointer transition-all ${uploading ? 'border-blis-red/30 bg-blis-red/5' : 'border-white/10 hover:border-blis-red/30 hover:bg-blis-red/5'}`}>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFileChange(f) }} disabled={uploading} />
              <Upload className={`w-6 h-6 mb-2 ${uploading ? 'animate-pulse text-blis-red' : 'text-gray-500'}`} />
              <p className="text-sm text-gray-400">{uploading ? 'Subiendo...' : 'PDF, DOC o DOCX (máx. 10MB)'}</p>
            </label>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}
