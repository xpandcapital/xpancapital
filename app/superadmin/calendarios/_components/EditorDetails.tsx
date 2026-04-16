"use client"

import { Image as ImageIcon, MapPin, Video, PhoneCall, UploadCloud } from 'lucide-react'
import type { useCalendarEditor } from '../_hooks/useCalendarEditor'
import { calendarTypeLabels } from '../_types'

type Editor = ReturnType<typeof useCalendarEditor>

const inputClass = "w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blis-red transition-colors text-sm"

export function EditorDetails({ editor }: { editor: Editor }) {
  const { formData, updateField } = editor

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => updateField('logo', reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const locationTypes = [
    { value: 'presencial', icon: MapPin, label: 'Presencial' },
    { value: 'videoconferencia', icon: Video, label: 'Video' },
    { value: 'telefonica', icon: PhoneCall, label: 'Llamada' },
  ] as const

  return (
    <div className="p-8">
      <div className="border-b border-white/5 pb-4 mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-wide">Detalles básicos</h2>
        <p className="text-white/40 text-sm mt-1">Identidad visual y descripción de la reunión.</p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
              Nombre del calendario *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={e => updateField('nombre', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
              URL Personalizada
            </label>
            <div className="flex rounded-xl overflow-hidden border border-white/10">
              <span className="inline-flex items-center px-4 bg-white/5 text-white/40 text-sm border-r border-white/10">
                /calendario/
              </span>
              <input
                type="text"
                value={formData.slug}
                onChange={e => updateField('slug', e.target.value)}
                className="flex-1 bg-[#0a0a0a] text-white px-3 py-2.5 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
            Logo del Calendario
          </label>
          <div className="flex gap-6 items-center bg-white/[0.02] p-4 rounded-xl border border-white/5">
            {formData.logo ? (
              <img src={formData.logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover border border-white/10 shadow-md" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-white/5 flex items-center justify-center text-white/20 border border-white/5">
                <ImageIcon size={28} />
              </div>
            )}
            <div className="flex-1 space-y-3">
              <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors inline-flex items-center gap-2">
                <UploadCloud size={18} className="text-blis-red" /> Subir imagen
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              <p className="text-[10px] text-white/30 uppercase tracking-wide">O ingresa una URL:</p>
              <input
                type="text"
                value={formData.logo || ''}
                onChange={e => updateField('logo', e.target.value)}
                placeholder="https://ejemplo.com/logo.png"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
            Descripción
          </label>
          <textarea
            value={formData.descripcion || ''}
            onChange={e => updateField('descripcion', e.target.value)}
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Instrucciones para tus clientes..."
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
            Ubicación de la reunión
          </label>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {locationTypes.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => updateField('ubicacion_tipo', value)}
                className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  formData.ubicacion_tipo === value
                    ? 'bg-blis-red/10 border-blis-red text-blis-red'
                    : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={formData.ubicacion_detalle || ''}
            onChange={e => updateField('ubicacion_detalle', e.target.value)}
            placeholder={
              formData.ubicacion_tipo === 'presencial' ? 'Dirección física...' :
              formData.ubicacion_tipo === 'videoconferencia' ? 'Enlace de Zoom/Meet...' :
              'Número de teléfono o instrucciones...'
            }
            className={inputClass}
          />
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest">
            Tipo: <span className="text-blis-red font-bold">{calendarTypeLabels[formData.tipo]}</span>
          </p>
        </div>
      </div>
    </div>
  )
}