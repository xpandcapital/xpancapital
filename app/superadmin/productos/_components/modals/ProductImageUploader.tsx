"use client"

import { X, Plus } from "lucide-react"

interface ProductImageUploaderProps {
  image: string | null
  onImageChange: (url: string | null) => void
}

export function ProductImageUploader({ image, onImageChange }: ProductImageUploaderProps) {
  const handleImageUpload = async (file: File) => {
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('La imagen excede el límite de 10MB')
      return
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'productos')
    
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        onImageChange(data.url)
      } else {
        alert(data.error || 'Error al subir imagen')
      }
    } catch {
      alert('Error al subir imagen')
    }
  }

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Imagen del Producto</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          className="aspect-square rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 group hover:border-blis-red/30 transition-all cursor-pointer bg-white/[0.02]"
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (file) await handleImageUpload(file)
            }
            input.click()
          }}
        >
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-gray-600 group-hover:text-blis-red" />
          </div>
          <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Añadir Imagen</span>
        </div>
        {image && (
          <div className="aspect-square rounded-[2rem] bg-zinc-900 border border-white/5 overflow-hidden relative group">
            <img src={image} className="w-full h-full object-cover" alt="Producto" />
            <button
              type="button"
              onClick={() => onImageChange(null)}
              className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}