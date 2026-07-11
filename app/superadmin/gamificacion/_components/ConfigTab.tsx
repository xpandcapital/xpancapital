'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import type { GamificacionConfig } from '@/lib/types/database'

interface Props {
  config: GamificacionConfig
  onSave: (updates: Partial<GamificacionConfig>) => Promise<any>
}

export function ConfigTab({ config, onSave }: Props) {
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const handleChange = async (key: keyof GamificacionConfig, value: number | boolean) => {
    setSaving(prev => ({ ...prev, [key]: true }))
    setSaved(prev => ({ ...prev, [key]: false }))
    try {
      await onSave({ [key]: value })
      setSaved(prev => ({ ...prev, [key]: true }))
      setTimeout(() => setSaved(prev => ({ ...prev, [key]: false })), 2000)
    } catch {} finally {
      setSaving(prev => ({ ...prev, [key]: false }))
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Puntos por Cursos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Lección completada (default)" value={config.puntos_leccion_completada} onChange={v => handleChange('puntos_leccion_completada', v)} saving={saving.puntos_leccion_completada} saved={saved.puntos_leccion_completada} />
          <Field label="Curso completado (default)" value={config.puntos_curso_completado} onChange={v => handleChange('puntos_curso_completado', v)} saving={saving.puntos_curso_completado} saved={saved.puntos_curso_completado} />
        </div>
        <p className="text-gray-600 text-xs mt-2">Estos son valores por defecto. Cada curso puede sobrescribirlos desde su editor.</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Puntos por Comunidad</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Post creado" value={config.puntos_post_comunidad} onChange={v => handleChange('puntos_post_comunidad', v)} saving={saving.puntos_post_comunidad} saved={saved.puntos_post_comunidad} />
          <Field label="Comentario" value={config.puntos_comentario_comunidad} onChange={v => handleChange('puntos_comentario_comunidad', v)} saving={saving.puntos_comentario_comunidad} saved={saved.puntos_comentario_comunidad} />
          <Field label="Reacción" value={config.puntos_reaccion} onChange={v => handleChange('puntos_reaccion', v)} saving={saving.puntos_reaccion} saved={saved.puntos_reaccion} />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Puntos por Blog</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Comentario en blog" value={config.puntos_comentario_blog} onChange={v => handleChange('puntos_comentario_blog', v)} saving={saving.puntos_comentario_blog} saved={saved.puntos_comentario_blog} />
          <Field label="Lectura de artículo" value={config.puntos_lectura_blog} onChange={v => handleChange('puntos_lectura_blog', v)} saving={saving.puntos_lectura_blog} saved={saved.puntos_lectura_blog} />
          <Field label="Puntos por día activo" value={config.puntos_dia_activo} onChange={v => handleChange('puntos_dia_activo', v)} saving={saving.puntos_dia_activo} saved={saved.puntos_dia_activo} />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Topes diarios anti-spam</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Máx comentarios comunidad/día" value={config.max_comentarios_comunidad_dia} onChange={v => handleChange('max_comentarios_comunidad_dia', v)} saving={saving.max_comentarios_comunidad_dia} saved={saved.max_comentarios_comunidad_dia} />
          <Field label="Máx posts comunidad/día" value={config.max_posts_comunidad_dia} onChange={v => handleChange('max_posts_comunidad_dia', v)} saving={saving.max_posts_comunidad_dia} saved={saved.max_posts_comunidad_dia} />
          <Field label="Máx reacciones/día" value={config.max_reacciones_dia} onChange={v => handleChange('max_reacciones_dia', v)} saving={saving.max_reacciones_dia} saved={saved.max_reacciones_dia} />
          <Field label="Máx comentarios blog/día" value={config.max_comentarios_blog_dia} onChange={v => handleChange('max_comentarios_blog_dia', v)} saving={saving.max_comentarios_blog_dia} saved={saved.max_comentarios_blog_dia} />
          <Field label="Máx lecturas blog/día" value={config.max_lecturas_blog_dia} onChange={v => handleChange('max_lecturas_blog_dia', v)} saving={saving.max_lecturas_blog_dia} saved={saved.max_lecturas_blog_dia} />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Puntos de Certificado</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Puntos base (1er intento)" value={config.puntos_certificado_base} onChange={v => handleChange('puntos_certificado_base', v)} saving={saving.puntos_certificado_base} saved={saved.puntos_certificado_base} />
          <Field label="Decremento por intento extra" value={config.puntos_certificado_decremento_intento} onChange={v => handleChange('puntos_certificado_decremento_intento', v)} saving={saving.puntos_certificado_decremento_intento} saved={saved.puntos_certificado_decremento_intento} />
          <Field label="Decremento por bloqueo reiniciado" value={config.puntos_certificado_decremento_bloqueo} onChange={v => handleChange('puntos_certificado_decremento_bloqueo', v)} saving={saving.puntos_certificado_decremento_bloqueo} saved={saved.puntos_certificado_decremento_bloqueo} />
          <Field label="Máx. intentos por ciclo" value={config.max_intentos_certificado} onChange={v => handleChange('max_intentos_certificado', v)} saving={saving.max_intentos_certificado} saved={saved.max_intentos_certificado} />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-2">Estado</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.activo}
            onChange={e => handleChange('activo', e.target.checked)}
            className="w-5 h-5 rounded border-gray-600 bg-gray-800 accent-[#f5e100]"
          />
          <span className="text-gray-300">Sistema de gamificación activo</span>
          {saving.activo && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
          {saved.activo && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        </label>
      </section>
    </div>
  )
}

function Field({ label, value, onChange, saving, saved }: { label: string; value: number; onChange: (v: number) => void; saving?: boolean; saved?: boolean }) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-gray-400">{label}</label>
        {saving && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
        {saved && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
      </div>
      <input
        type="number"
        value={value}
        onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#f5e100] focus:outline-none"
      />
    </div>
  )
}

