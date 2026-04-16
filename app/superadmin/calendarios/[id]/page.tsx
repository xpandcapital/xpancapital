"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useCalendars, useCalendarEditor } from '../_hooks'
import type { Calendario } from '../_types'
import { CalendarEditorSidebar } from '../_components/EditorSidebar'
import { EditorDetails } from '../_components/EditorDetails'
import { EditorTeam } from '../_components/EditorTeam'
import { EditorSchedule } from '../_components/EditorSchedule'
import { EditorRules } from '../_components/EditorRules'
import { EditorForm } from '../_components/EditorForm'
import { EditorAppearance } from '../_components/EditorAppearance'
import { EditorShare } from '../_components/EditorShare'
import { useToast } from '@/components/ui/Toast'

export default function CalendarEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { calendars, loading, update } = useCalendars()
  const { showToast } = useToast()
  const [calendar, setCalendar] = useState<Calendario | null>(null)

  useEffect(() => {
    if (!loading && calendars.length > 0) {
      const found = calendars.find(c => c.id === params.id)
      if (found) {
        setCalendar(found)
      } else {
        showToast('Calendario no encontrado', 'error')
        router.push('/superadmin/calendarios')
      }
    }
  }, [calendars, loading, params.id, router, showToast])

  if (loading || !calendar) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/10 border-t-blis-red rounded-full animate-spin" />
      </div>
    )
  }

  return <CalendarEditor calendar={calendar} onUpdate={async (data) => {
    const result = await update(data.id, data)
    if (result.success) {
      showToast('Calendario guardado', 'success')
      router.push('/superadmin/calendarios')
    } else {
      showToast('Error al guardar', 'error')
    }
  }} onBack={() => router.push('/superadmin/calendarios')} />
}

function CalendarEditor({ calendar, onUpdate, onBack }: {
  calendar: Calendario
  onUpdate: (data: Calendario) => Promise<void>
  onBack: () => void
}) {
  const editor = useCalendarEditor(calendar)
  const { showToast } = useToast()

  const handleSave = async () => {
    editor.setSaving(true)
    try {
      await onUpdate(editor.formData)
    } finally {
      editor.setSaving(false)
    }
  }

  const tabs: Record<string, React.ReactNode> = {
    basico: <EditorDetails editor={editor} />,
    equipo: <EditorTeam editor={editor} />,
    horarios: <EditorSchedule editor={editor} />,
    reglas: <EditorRules editor={editor} />,
    form: <EditorForm editor={editor} />,
    apariencia: <EditorAppearance editor={editor} />,
    compartir: <EditorShare editor={editor} />,
  }

  return (
    <div className="flex flex-col h-screen bg-[#050505]">
      <header className="h-16 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-blis-red text-white rounded-lg shadow-lg hover:bg-blis-red/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <input
              type="text"
              value={editor.formData.nombre}
              onChange={e => editor.updateField('nombre', e.target.value)}
              className="bg-transparent text-white font-bold outline-none border-b border-transparent hover:border-white/10 focus:border-blis-red transition-colors"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={editor.saving}
          className="px-6 py-2 bg-white text-black rounded-lg font-bold text-sm hover:bg-white/90 transition-all shadow-[0_0_10px_rgba(255,255,255,0.2)] disabled:opacity-50 flex items-center gap-2"
        >
          {editor.saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <CalendarEditorSidebar activeTab={editor.activeTab} onTabChange={editor.setActiveTab} />
        <main className="flex-1 overflow-y-auto p-8 bg-[#050505]">
          <div className="max-w-4xl mx-auto bg-[#0a0a0a] border border-white/5 rounded-3xl min-h-[600px]">
            {tabs[editor.activeTab] || tabs.basico}
          </div>
        </main>
      </div>
    </div>
  )
}