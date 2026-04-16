"use client"

import { ExternalLink, Code } from 'lucide-react'
import type { useFormEditor } from '../_hooks/useFormEditor'

type Editor = ReturnType<typeof useFormEditor>

export function FormSharePanel({ editor }: { editor: Editor }) {
  const { formData } = editor
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const publicUrl = `${baseUrl}/f/${formData.slug}`
  const iframeCode = `<iframe src="${publicUrl}" width="100%" height="800px" frameborder="0" style="border-radius: 12px; background: transparent;"></iframe>`

  const handleCopy = async (text: string, e: React.MouseEvent<HTMLButtonElement>) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    const btn = e.currentTarget
    const original = btn.innerText
    btn.innerText = '¡Copiado!'
    setTimeout(() => { btn.innerText = original }, 2000)
  }

  return (
    <div className="flex-1 bg-[#050505] p-10 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-white/5">
          <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wide">Enlace directo</h3>
          <p className="text-sm text-white/30 mb-6">Comparte este enlace por email o redes.</p>
          <div className="flex flex-col md:flex-row gap-3">
            <input readOnly value={publicUrl}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm font-medium" />
            <button onClick={(e) => handleCopy(publicUrl, e)}
              className="bg-white text-black px-6 py-3 rounded-xl text-sm font-bold transition-colors whitespace-nowrap hover:bg-white/90">
              Copiar enlace
            </button>
          </div>
        </div>

        <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-white/5">
          <h3 className="text-lg font-black text-white mb-2 uppercase tracking-wide">Incrustar (Iframe)</h3>
          <p className="text-sm text-white/30 mb-6">Incrusta el formulario renderizado con todos tus estilos visuales directamente en tu web.</p>
          <div className="relative">
            <textarea readOnly value={iframeCode} rows={3}
              className="w-full bg-[#050505] border border-white/10 text-emerald-400 font-mono text-xs p-5 rounded-xl outline-none resize-none" />
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