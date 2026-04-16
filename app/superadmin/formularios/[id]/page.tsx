"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, FileText } from 'lucide-react'
import { useFormularios, useFormEditor } from '../_hooks'
import type { Formulario } from '../_types'
import { FormBuildPanel } from '../_components/FormBuildPanel'
import { FormFlowPanel } from '../_components/FormFlowPanel'
import { FormSharePanel } from '../_components/FormSharePanel'
import { FormAppearancePanel } from '../_components/FormAppearancePanel'
import { useToast } from '@/components/ui/Toast'

const tabs = [
  { id: 'build', label: 'Constructor' },
  { id: 'flow', label: 'Flujo' },
  { id: 'appearance', label: 'Diseño' },
  { id: 'share', label: 'Compartir' },
]

export default function FormEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { formularios, loading, update } = useFormularios()
  const { showToast } = useToast()
  const [form, setForm] = useState<Formulario | null>(null)

  useEffect(() => {
    if (!loading && formularios.length >= 0) {
      const found = formularios.find(f => f.id === params.id)
      if (found) {
        setForm(found)
      } else {
        showToast('Formulario no encontrado', 'error')
        router.push('/superadmin/formularios')
      }
    }
  }, [formularios, loading, params.id, router, showToast])

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/10 border-t-blis-red rounded-full animate-spin" />
      </div>
    )
  }

  return <FormEditor form={form} onSave={async (data) => {
    await update(data.id, data)
    showToast('Formulario guardado', 'success')
    router.push('/superadmin/formularios')
  }} onBack={() => router.push('/superadmin/formularios')} />
}

function FormEditor({ form, onSave, onBack }: {
  form: Formulario
  onSave: (data: Formulario) => Promise<void>
  onBack: () => void
}) {
  const editor = useFormEditor(form)
  const { showToast } = useToast()

  const handleSave = async () => {
    editor.setSaving(true)
    try {
      await onSave(editor.formData)
    } catch {
      showToast('Error al guardar', 'error')
    } finally {
      editor.setSaving(false)
    }
  }

  const renderTab = () => {
    switch (editor.activeTab) {
      case 'build': return <FormBuildPanel editor={editor} />
      case 'flow': return <FormFlowPanel editor={editor} />
      case 'appearance': return <FormAppearancePanel editor={editor} />
      case 'share': return <FormSharePanel editor={editor} />
      default: return <FormBuildPanel editor={editor} />
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#050505]">
      <header className="h-14 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-blis-red text-white rounded-lg hover:bg-blis-red/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </button>
          <FileText className="w-4 h-4 text-blis-red" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <input
              type="text"
              value={editor.formData.nombre}
              onChange={e => editor.updateField('nombre', e.target.value)}
              className="bg-transparent text-white text-sm font-bold outline-none border-b border-transparent hover:border-white/10 focus:border-blis-red transition-colors max-w-[200px]"
            />
          </div>
        </div>

        <div className="flex bg-[#111] rounded-lg p-1 border border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => editor.setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
                editor.activeTab === tab.id ? 'bg-white/10 text-white shadow' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={editor.saving}
          className="bg-white text-black px-4 py-2 rounded-lg font-bold text-xs hover:bg-white/90 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {editor.saving && <Loader2 className="w-3 h-3 animate-spin" />}
          Guardar
        </button>
      </header>

      <div className="flex-1 overflow-hidden">
        {renderTab()}
      </div>
    </div>
  )
}