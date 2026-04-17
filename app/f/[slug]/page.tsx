"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Check, ChevronDown, ArrowLeft } from 'lucide-react'
import type { Formulario, FormField, FormAppearance } from '@/app/superadmin/formularios/_types'
import { defaultAppearance } from '@/app/superadmin/formularios/_types'

function hexToRgba(hex: string, opacity: number) {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${opacity / 100})`
}

function FormFieldRenderer({ field, app }: { field: FormField; app: FormAppearance }) {
  const inputStyle: React.CSSProperties = {
    backgroundColor: app.inputBgColor,
    color: app.inputTextColor,
    borderColor: app.inputBorderColor,
    borderWidth: '1px',
    borderStyle: 'solid',
  }

  if (field.type === 'textarea') {
    return (
      <div>
        <label className="block text-sm font-bold mb-2" style={{ color: app.textColor }}>
          {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          required={field.required}
          placeholder={field.placeholder}
          rows={3}
          className="w-full rounded-xl px-4 py-3.5 transition-all border"
          style={{ ...inputStyle, resize: 'none' }}
        />
      </div>
    )
  }

  if (field.type === 'phone') {
    return (
      <div>
        <label className="block text-sm font-bold mb-2" style={{ color: app.textColor }}>
          {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex rounded-xl overflow-hidden border" style={{ ...inputStyle, borderColor: app.inputBorderColor }}>
          <div className="px-4 py-3.5 border-r font-medium flex items-center gap-2" style={{ color: app.placeholderColor, borderColor: app.inputBorderColor }}>
            🇪🇨 +593
          </div>
          <input required={field.required} type="tel" placeholder={field.placeholder}
            className="flex-1 px-4 py-3.5 bg-transparent" style={{ color: app.inputTextColor }} />
        </div>
      </div>
    )
  }

  if (field.type === 'dropdown') {
    return (
      <div>
        <label className="block text-sm font-bold mb-2" style={{ color: app.textColor }}>
          {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative rounded-xl">
          <select required={field.required} defaultValue=""
            className="w-full rounded-xl px-4 py-3.5 transition-shadow appearance-none cursor-pointer border"
            style={inputStyle}>
            <option value="" disabled>Selecciona una opción</option>
            {field.options?.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-4 pointer-events-none" size={18} style={{ color: app.placeholderColor }} />
        </div>
      </div>
    )
  }

  if (field.type === 'radio') {
    return (
      <div>
        <label className="block text-sm font-bold mb-2" style={{ color: app.textColor }}>
          {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="space-y-3 mt-2">
          {field.options?.map((opt, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer">
              <input required={field.required} type="radio" name={`grp_${field.id}`}
                className="w-5 h-5 rounded-full" style={{ accentColor: app.primaryColor }} />
              <span className="font-medium text-sm" style={{ color: app.textColor }}>{opt}</span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  if (field.type === 'checkbox') {
    return (
      <div>
        <label className="block text-sm font-bold mb-2" style={{ color: app.textColor }}>
          {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="space-y-3 mt-2">
          {field.options?.map((opt, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer">
              <input required={field.required} type="checkbox"
                className="w-5 h-5 rounded" style={{ accentColor: app.primaryColor }} />
              <span className="font-medium text-sm" style={{ color: app.textColor }}>{opt}</span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm font-bold mb-2" style={{ color: app.textColor }}>
        {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        required={field.required}
        type={field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : field.type === 'url' ? 'url' : 'text'}
        placeholder={field.placeholder}
        className="w-full rounded-xl px-4 py-3.5 transition-shadow border"
        style={inputStyle}
      />
    </div>
  )
}

export default function PublicFormPage() {
  const params = useParams()
  const slug = params.slug as string
  const [form, setForm] = useState<Formulario | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/formularios/public/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setForm(data.data)
        } else {
          setError('Formulario no encontrado')
        }
      })
      .catch(() => setError('Error al cargar'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/10 border-t-blis-red rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-blis-red/10 rounded-3xl flex items-center justify-center mb-6 border border-blis-red/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#be0b3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Formulario no encontrado</h1>
        <p className="text-white/40 mb-6">Este formulario no existe o ya no está disponible.</p>
        <a href="/" className="px-6 py-3 bg-blis-red rounded-2xl text-white font-bold hover:scale-[1.02] transition-all">
          Volver al inicio
        </a>
      </div>
    )
  }

  const app = form.apariencia || defaultAppearance

  const formPages: FormField[][] = []
  let currentPage: FormField[] = []
  form.campos.forEach(f => {
    if (f.type === 'page_break') { formPages.push(currentPage); currentPage = [] }
    else { currentPage.push(f) }
  })
  formPages.push(currentPage)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep < formPages.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setSubmitted(true)
      const redirectStep = form.pasos_flujo?.find(s => s.type === 'redirect')
      if (redirectStep?.url) {
        setTimeout(() => { window.location.href = redirectStep.url }, 2000)
      }
    }
  }

  const bgColor = hexToRgba(app.backgroundColor, app.backgroundOpacity)

  return (
    <div className="min-h-screen flex flex-col font-sans relative" style={{ backgroundColor: bgColor }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-form input::placeholder, .custom-form textarea::placeholder { color: ${app.placeholderColor}; opacity: 1; }
        .custom-form input:focus, .custom-form textarea:focus, .custom-form select:focus { border-color: ${app.focusColor} !important; outline: none; box-shadow: 0 0 0 3px ${hexToRgba(app.focusColor, 20)}; }
      ` }} />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto relative z-10 py-10 px-4">
        <div
          className="w-full shadow-2xl overflow-hidden flex flex-col custom-form"
          style={{
            backgroundColor: hexToRgba(app.backgroundColor, app.backgroundOpacity),
            borderRadius: `${app.borderRadius}px`,
            border: app.backgroundOpacity < 100 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            backdropFilter: app.backgroundOpacity < 100 ? 'blur(20px)' : 'none',
          }}
        >
          <div className="h-2 w-full" style={{ backgroundColor: app.primaryColor }} />

          {submitted ? (
            <div className="flex flex-col items-center text-center"
              style={{ paddingTop: `${app.paddingTop}px`, paddingBottom: `${app.paddingBottom}px`, paddingLeft: `${app.paddingLeft}px`, paddingRight: `${app.paddingRight}px` }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg"
                style={{ backgroundColor: app.primaryColor, color: app.buttonTextColor }}>
                <Check size={40} />
              </div>
              <h2 className="text-3xl font-black mb-2" style={{ color: app.textColor }}>¡Gracias!</h2>
              <p className="opacity-70" style={{ color: app.textColor }}>Hemos recibido tu información correctamente.</p>
              {form.pasos_flujo?.some(s => s.type === 'redirect') && (
                <p className="text-sm mt-6 font-bold" style={{ color: app.primaryColor }}>Redirigiendo al siguiente paso...</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6"
              style={{ paddingTop: `${app.paddingTop}px`, paddingBottom: `${app.paddingBottom}px`, paddingLeft: `${app.paddingLeft}px`, paddingRight: `${app.paddingRight}px` }}>

              <div className="text-center mb-2">
                <h1 className="text-3xl font-black" style={{ color: app.textColor }}>{form.nombre}</h1>
                {formPages.length > 1 && (
                  <p className="text-sm mt-2 opacity-60 font-medium" style={{ color: app.textColor }}>
                    Paso {currentStep + 1} de {formPages.length}
                  </p>
                )}
              </div>

              {formPages[currentStep]?.map(field => (
                <FormFieldRenderer key={field.id} field={field} app={app} />
              ))}

              <div className="mt-4 flex gap-4">
                {currentStep > 0 && (
                  <button type="button" onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1 py-4 rounded-lg font-bold text-sm shadow-xl transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: app.inputBgColor, color: app.textColor, border: `1px solid ${app.inputBorderColor}`, borderRadius: `${app.borderRadius}px` }}>
                    Atrás
                  </button>
                )}
                {app.showButton && (
                  <button type="submit"
                    className="flex-1 py-4 rounded-lg font-bold text-sm shadow-xl hover:scale-[1.02] transition-transform"
                    style={{ backgroundColor: app.primaryColor, color: app.buttonTextColor, borderRadius: `${app.borderRadius}px` }}>
                    {currentStep < formPages.length - 1 ? 'Siguiente' : form.texto_boton}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}