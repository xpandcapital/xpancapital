'use client'

import type { GamificacionConfig } from '@/lib/types/database'

interface Props {
  config: GamificacionConfig
  onSave: (updates: Partial<GamificacionConfig>) => Promise<any>
}

export function ConfigTab({ config, onSave }: Props) {
  const handleChange = async (key: keyof GamificacionConfig, value: number | boolean) => {
    await onSave({ [key]: value })
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Puntos por Cursos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Lección completada (default)" value={config.puntos_leccion_completada} onChange={v => handleChange('puntos_leccion_completada', v)} />
          <Field label="Curso completado (default)" value={config.puntos_curso_completado} onChange={v => handleChange('puntos_curso_completado', v)} />
        </div>
        <p className="text-gray-600 text-xs mt-2">Estos son valores por defecto. Cada curso puede sobrescribirlos desde su editor.</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Puntos por Comunidad</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Post creado" value={config.puntos_post_comunidad} onChange={v => handleChange('puntos_post_comunidad', v)} />
          <Field label="Comentario" value={config.puntos_comentario_comunidad} onChange={v => handleChange('puntos_comentario_comunidad', v)} />
          <Field label="Reacción" value={config.puntos_reaccion} onChange={v => handleChange('puntos_reaccion', v)} />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Puntos por Blog</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Comentario en blog" value={config.puntos_comentario_blog} onChange={v => handleChange('puntos_comentario_blog', v)} />
          <Field label="Lectura de artículo" value={config.puntos_lectura_blog} onChange={v => handleChange('puntos_lectura_blog', v)} />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Topes diarios anti-spam</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Máx comentarios comunidad/día" value={config.max_comentarios_comunidad_dia} onChange={v => handleChange('max_comentarios_comunidad_dia', v)} />
          <Field label="Máx posts comunidad/día" value={config.max_posts_comunidad_dia} onChange={v => handleChange('max_posts_comunidad_dia', v)} />
          <Field label="Máx reacciones/día" value={config.max_reacciones_dia} onChange={v => handleChange('max_reacciones_dia', v)} />
          <Field label="Máx comentarios blog/día" value={config.max_comentarios_blog_dia} onChange={v => handleChange('max_comentarios_blog_dia', v)} />
          <Field label="Máx lecturas blog/día" value={config.max_lecturas_blog_dia} onChange={v => handleChange('max_lecturas_blog_dia', v)} />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-4">Puntos de Certificado</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Puntos base (1er intento)" value={config.puntos_certificado_base} onChange={v => handleChange('puntos_certificado_base', v)} />
          <Field label="Decremento por intento extra" value={config.puntos_certificado_decremento_intento} onChange={v => handleChange('puntos_certificado_decremento_intento', v)} />
          <Field label="Decremento por bloqueo reiniciado" value={config.puntos_certificado_decremento_bloqueo} onChange={v => handleChange('puntos_certificado_decremento_bloqueo', v)} />
          <Field label="Máx. intentos por ciclo" value={config.max_intentos_certificado} onChange={v => handleChange('max_intentos_certificado', v)} />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-white mb-2">Estado</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.activo}
            onChange={e => handleChange('activo', e.target.checked)}
            className="w-5 h-5 rounded border-gray-600 bg-gray-800 accent-[#ff1e56]"
          />
          <span className="text-gray-300">Sistema de gamificación activo</span>
        </label>
      </section>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-[#ff1e56] focus:outline-none"
      />
    </div>
  )
}
