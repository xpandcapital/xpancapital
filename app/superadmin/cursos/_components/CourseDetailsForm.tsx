'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Camera, ImageIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { SearchableSelect } from "@/components/ui/SearchableSelect"
import type { Course, CertificateTemplate } from '../_types'

interface CourseDetailsFormProps {
  course: Course
  certificateTemplates: CertificateTemplate[]
  onUpdate: (course: Course) => void
  onImageFileSelect: (file: File) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

export function CourseDetailsForm({
  course, certificateTemplates, onUpdate,
  onImageFileSelect, fileInputRef
}: CourseDetailsFormProps) {
  const [expanded, setExpanded] = useState(true)

  const toggleActiveClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
  const toggleInactiveClass = "bg-red-500/10 border-red-500/30 text-red-400"

  return (
    <section className="bg-zinc-950 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
      {/* Header colapsable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-3 px-4 md:px-5 hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
            <span className="text-gray-400 text-xs font-black">i</span>
          </div>
          <h2 className="text-sm font-black text-white uppercase tracking-tighter">Información del Curso</h2>
        </div>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
          : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        }
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="border-t border-white/10 px-5 md:px-8 py-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-6 w-full">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Título Principal</label>
                        <input type="text" value={course.title} onChange={(e) => onUpdate({ ...course, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red transition-all text-sm font-bold" placeholder="Ej. Fotografía Inmobiliaria Masterclass" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Categoría</label>
                        <input
                          type="text"
                          value={course.category}
                          onChange={(e) => onUpdate({ ...course, category: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red transition-all text-xs font-bold"
                          placeholder="Ej. Capacitaciones"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Certificado</label>
                        <SearchableSelect
                          value={course.certificateTemplateId || ''}
                          onChange={(value) => {
                            onUpdate({
                              ...course,
                              certificateTemplateId: value || null,
                              hasCertificate: !!value
                            })
                          }}
                          options={[
                            { value: "", label: "Ninguno" },
                            ...certificateTemplates.map(template => ({
                              value: template.id,
                              label: template.nombre,
                            })),
                          ]}
                          placeholder="Seleccionar certificado..."
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Comentarios</label>
                        <button
                          onClick={() => onUpdate({ ...course, allowComments: !course.allowComments })}
                          className={`w-full py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${course.allowComments ? toggleActiveClass : toggleInactiveClass}`}
                        >
                          {course.allowComments ? 'Activo' : 'Off'}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Para Equipo</label>
                        <button
                          onClick={() => onUpdate({ ...course, paraEquipo: !course.paraEquipo })}
                          className={`w-full py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${course.paraEquipo ? toggleActiveClass : toggleInactiveClass}`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          {course.paraEquipo ? 'Solo Equipo' : 'Clientes'}
                        </button>
                        <p className="text-[8px] text-gray-500 leading-tight">
                          {course.paraEquipo
                            ? 'Solo visible para miembros del equipo'
                            : 'Visible para todos los clientes'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Progreso Secuencial</label>
                        <button
                          onClick={() => onUpdate({ ...course, sequentialProgress: !course.sequentialProgress })}
                          className={`w-full py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${course.sequentialProgress ? toggleActiveClass : toggleInactiveClass}`}
                        >
                          {course.sequentialProgress ? 'Activado' : 'Desactivado'}
                        </button>
                        <p className="text-[8px] text-gray-600">Las lecciones se desbloquean en orden</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Completar para Avanzar</label>
                        <button
                          onClick={() => onUpdate({ ...course, requireCompletion: !course.requireCompletion })}
                          className={`w-full py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${course.requireCompletion ? toggleActiveClass : toggleInactiveClass}`}
                        >
                          {course.requireCompletion ? 'Requerido' : 'Opcional'}
                        </button>
                        <p className="text-[8px] text-gray-600">Marcar como completado para avanzar</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#f5e100] uppercase tracking-widest">Pts por Completar Curso</label>
                        <input type="number" value={course.puntosCompletado || 500} onChange={(e) => onUpdate({ ...course, puntosCompletado: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red transition-all text-xs font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#f5e100] uppercase tracking-widest">Pts por Lección</label>
                        <input type="number" value={course.puntosPorLeccion || 50} onChange={(e) => onUpdate({ ...course, puntosPorLeccion: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red transition-all text-xs font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#f5e100] uppercase tracking-widest">Pts por Certificado</label>
                        <input type="number" value={course.puntosCertificado || 1000} onChange={(e) => onUpdate({ ...course, puntosCertificado: parseInt(e.target.value) || 0 })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blis-red transition-all text-xs font-bold" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-56 flex-shrink-0 space-y-2">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Portada del Curso</label>
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-square w-full bg-zinc-900 rounded-[1.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blis-red/30 hover:bg-white/5 transition-all group relative overflow-hidden shadow-inner">
                    {course.image ? (
                      <>
                        <img src={course.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Course" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-700 group-hover:text-blis-red transition-colors">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Subir Imagen</p>
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) onImageFileSelect(file) }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
