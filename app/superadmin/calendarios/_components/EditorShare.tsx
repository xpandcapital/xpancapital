"use client"

import { ExternalLink, Code } from 'lucide-react'
import type { useCalendarEditor } from '../_hooks/useCalendarEditor'

type Editor = ReturnType<typeof useCalendarEditor>

function copyToClipboard(text: string) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-9999px'
  document.body.appendChild(textArea)
  textArea.select()
  try { document.execCommand('copy') } catch {}
  document.body.removeChild(textArea)
}

export function EditorShare({ editor }: { editor: Editor }) {
  const { formData } = editor
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const publicUrl = `${baseUrl}/calendario/${formData.slug}`
  const iframeCode = `<iframe src="${publicUrl}" width="100%" height="700px" frameborder="0" style="border-radius: 12px; background: transparent;"></iframe>`

  const handleCopy = async (text: string, e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      copyToClipboard(text)
    }
    const btn = e.currentTarget
    const original = btn.innerText
    btn.innerText = '¡Copiado!'
    setTimeout(() => { btn.innerText = original }, 2000)
  }

  return (
    <div className="p-8">
      <div className="border-b border-white/5 pb-4 mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-wide">Compartir y Publicar</h2>
        <p className="text-white/40 text-sm mt-1">Comparte el enlace o incrusta el calendario.</p>
      </div>

      <div className="space-y-8">
        <div className="bg-white/[0.02] p-8 rounded-2xl border border-white/5">
          <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
            <ExternalLink size={18} className="text-blis-red" /> Enlace directo
          </label>
          <p className="text-sm text-white/30 mb-6">Comparte este enlace por email, WhatsApp o redes.</p>
          <div className="flex flex-col md:flex-row gap-3">
            <input readOnly value={publicUrl}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm font-medium" />
            <button onClick={(e) => handleCopy(publicUrl, e)}
              className="bg-white text-black px-6 py-3 rounded-xl text-sm font-bold transition-colors whitespace-nowrap hover:bg-white/90">
              Copiar enlace
            </button>
          </div>
        </div>

        <div className="bg-white/[0.02] p-8 rounded-2xl border border-white/5">
          <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wide">
            <Code size={18} className="text-blis-red" /> Incrustar código (Iframe)
          </label>
          <p className="text-sm text-white/30 mb-6">Añade este código HTML a tu página web (WordPress, HTML).</p>
          <div className="relative">
            <textarea readOnly value={iframeCode} rows={3}
              className="w-full bg-[#0a0a0a] border border-white/10 text-emerald-400 font-mono text-xs p-5 rounded-xl outline-none resize-none" />
            <button onClick={(e) => handleCopy(iframeCode, e)}
              className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-lg text-xs font-bold transition-colors">
              Copiar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}