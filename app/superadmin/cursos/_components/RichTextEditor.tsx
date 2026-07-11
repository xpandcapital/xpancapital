'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bold, Italic, Underline, List, ListOrdered,
  Heading1, Heading2, Quote, Code,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette,
  Smile, Strikethrough,
  Trash, Undo, Redo, Eraser,
  FileCode, Upload, Scissors, GripHorizontal, RotateCw, FlipHorizontal,
  X, AlertCircle, LinkIcon
} from 'lucide-react'
import { ImageCropper } from './ImageCropper'

interface RichTextEditorProps {
  value: string
  onChange: (val: string) => void
  placeholder: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFull, setIsFull] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [modal, setModal] = useState<{ type: 'link' | 'embed' | 'error', message?: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [localValue, setLocalValue] = useState(value)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [savedSelection, setSavedSelection] = useState<Range | null>(null)
  const [croppingImageSrc, setCroppingImageSrc] = useState<string | null>(null)

  const [isHtmlMode, setIsHtmlMode] = useState(false)
  const [showSizes, setShowSizes] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedImage = selectedImageId && editorRef.current ? (editorRef.current.querySelector(`#${selectedImageId}`) as HTMLImageElement) : null

  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      setSavedSelection(sel.getRangeAt(0).cloneRange())
    }
  }

  const [selectedColor, setSelectedColor] = useState('#FFFFFF')
  const [rgb, setRgb] = useState({ r: 255, g: 255, b: 255 })

  useEffect(() => {
    if (value !== localValue && document.activeElement !== editorRef.current) {
      setLocalValue(value)
      if (editorRef.current) editorRef.current.innerHTML = value
    }
    document.execCommand('defaultParagraphSeparator', false, 'p')
  }, [value])

  useEffect(() => {
    if (!isHtmlMode && editorRef.current && editorRef.current.innerHTML !== localValue) {
      editorRef.current.innerHTML = localValue
    }
  }, [isHtmlMode, localValue])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault()
        selectedImage.remove()
        setSelectedImageId(null)
        if (editorRef.current) {
          const val = editorRef.current.innerHTML
          setLocalValue(val)
          onChange(val)
        }
      }
    }
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element
      if (selectedImage && !target.closest('#img-toolbar') && !target.closest('#image-cropper-overlay') && e.target !== selectedImage) {
        setSelectedImageId(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedImage, onChange])

  const execCommand = (command: string, val: string = '') => {
    if (isHtmlMode) {
      if (!textareaRef.current) return
      const textarea = textareaRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = localValue.substring(start, end)
      let injection = ''

      switch (command) {
        case 'bold': injection = `<strong>${selectedText || 'Texto'}</strong>`; break
        case 'italic': injection = `<em>${selectedText || 'Texto'}</em>`; break
        case 'underline': injection = `<u>${selectedText || 'Texto'}</u>`; break
        case 'strikeThrough': injection = `<del>${selectedText || 'Texto'}</del>`; break
        case 'justifyLeft': injection = `<div style="text-align: left;">${selectedText || 'Texto'}</div>`; break
        case 'justifyCenter': injection = `<div style="text-align: center;">${selectedText || 'Texto'}</div>`; break
        case 'justifyRight': injection = `<div style="text-align: right;">${selectedText || 'Texto'}</div>`; break
        case 'justifyFull': injection = `<div style="text-align: justify;">${selectedText || 'Texto'}</div>`; break
        case 'insertUnorderedList': injection = `<ul>\n  <li>${selectedText || 'Elemento'}</li>\n</ul>`; break
        case 'insertOrderedList': injection = `<ol>\n  <li>${selectedText || 'Elemento'}</li>\n</ol>`; break
        case 'insertText': injection = val; break
        case 'insertHTML': injection = val; break
        case 'createLink': injection = `<a href="${val}">${selectedText || 'Enlace'}</a>`; break
        case 'undo': document.execCommand('undo'); return
        case 'redo': document.execCommand('redo'); return
        case 'removeFormat': injection = selectedText.replace(/<[^>]+>/g, ''); break
        case 'formatBlock':
          if (val === 'BLOCKQUOTE' || val === '<BLOCKQUOTE>') injection = `<blockquote>${selectedText || 'Cita'}</blockquote>`
          else if (val === 'H1' || val === '<H1>') injection = `<h1>${selectedText || 'Título'}</h1>`
          else if (val === 'H2' || val === '<H2>') injection = `<h2>${selectedText || 'Subtítulo'}</h2>`
          else if (val === 'P' || val === '<P>') injection = `<p>${selectedText || 'Párrafo'}</p>`
          break
        case 'fontSize':
          const sizeMap: Record<string, string> = { '1': '10px', '3': '16px', '5': '24px', '7': '32px' }
          injection = `<span style="font-size: ${sizeMap[val] || '16px'}">${selectedText || 'Texto'}</span>`
          break
        case 'foreColor':
          injection = `<span style="color: ${val}">${selectedText || 'Texto'}</span>`
          break
        default: return
      }

      if (injection) {
        const newContent = localValue.substring(0, start) + injection + localValue.substring(end)
        setLocalValue(newContent)
        onChange(newContent)
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus()
            textareaRef.current.setSelectionRange(start + injection.length, start + injection.length)
          }
        }, 0)
      }
      return
    }

    if (editorRef.current) {
      document.execCommand(command, false, val)
      const newContent = editorRef.current.innerHTML
      setLocalValue(newContent)
      onChange(newContent)
    }
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 }
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  }

  const handleColorChange = (hex: string) => {
    setSelectedColor(hex)
    setRgb(hexToRgb(hex))
    execCommand('foreColor', hex)
  }

  const handleRgbChange = (part: 'r' | 'g' | 'b', val: string) => {
    const n = Math.max(0, Math.min(255, parseInt(val) || 0))
    const newRgb = { ...rgb, [part]: n }
    setRgb(newRgb)
    const hc = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    setSelectedColor(hc)
    execCommand('foreColor', hc)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 1024 * 1024) {
        setModal({ type: 'error', message: 'La imagen excede el límite de 1MB.' })
        return
      }
      const reader = new FileReader()
      reader.onload = (prev) => {
        const base64 = prev.target?.result as string
        execCommand('insertImage', base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const Emojis = [
    '😀', '🤣', '😍', '😎', '🤔', '😴', '🤩', '🥳', '😱', '😡', '🤡', '😇',
    '🔥', '⭐', '✅', '🚀', '💡', '💎', '🎯', '📍', '📢', '⚠️', '✨', '🎓',
    '🏆', '💻', '📱', '📈', '🎨', '🛠️', '🧪', '📅', '⏰', '🔒', '🔑', '❤️',
    '👀', '🙌', '👏', '🤝', '💯', '🌟', '🎈'
  ]

  const Toolbar = () => (
    <div className="flex flex-wrap items-center gap-1.5 p-3 bg-zinc-950 border-b border-white/10 overflow-visible relative z-[100]">
      <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5 items-center px-1 gap-1">
        <button
          type="button"
          onClick={() => setIsHtmlMode(!isHtmlMode)}
          className={`py-1.5 px-3 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2 ${isHtmlMode ? 'bg-blis-red text-white' : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <FileCode className="w-3.5 h-3.5" /> HTML
        </button>

        <div className="w-px h-4 bg-white/10 mx-1 self-center" />

        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowSizes(!showSizes); setShowColorPicker(false) }}
            className="bg-transparent text-gray-400 text-[10px] uppercase font-bold tracking-widest py-1.5 px-3 focus:outline-none hover:text-white cursor-pointer h-full flex items-center justify-center min-w-[70px]"
          >
            A Tamaño
          </button>
          <AnimatePresence>
            {showSizes && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full left-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-[200] w-32 overflow-hidden flex flex-col">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('fontSize', '3'); setShowSizes(false) }} className="px-4 py-3 text-left hover:bg-white/5 text-[10px] font-bold text-gray-300 uppercase tracking-widest">A Normal</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('fontSize', '1'); setShowSizes(false) }} className="px-4 py-3 text-left hover:bg-white/5 text-[8px] font-bold text-gray-400 uppercase tracking-widest border-t border-white/5">A Pequeño</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('fontSize', '5'); setShowSizes(false) }} className="px-4 py-3 text-left hover:bg-white/5 text-[12px] font-black text-white uppercase tracking-widest border-t border-white/5">A Grande</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('fontSize', '7'); setShowSizes(false) }} className="px-4 py-3 text-left hover:bg-white/5 text-[14px] font-black text-purple-400 uppercase tracking-widest border-t border-white/5">A Enorme</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('undo') }} title="Deshacer" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Undo className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('redo') }} title="Rehacer" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Redo className="w-3.5 h-3.5" /></button>
      </div>

      <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('bold') }} title="Negrita" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Bold className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('italic') }} title="Cursiva" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Italic className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('underline') }} title="Subrayado" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Underline className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('strikeThrough') }} title="Tachado" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Strikethrough className="w-3.5 h-3.5" /></button>
        <div className="w-px h-6 bg-white/10 mx-1 self-center" />
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<P>') }} title="Párrafo Normal" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all font-serif font-bold text-xs">P</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<H1>') }} title="Título H1" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Heading1 className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<H2>') }} title="Subtítulo H2" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Heading2 className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<BLOCKQUOTE>') }} title="Cita Blockquote" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Quote className="w-3.5 h-3.5" /></button>
        <div className="w-px h-6 bg-white/10 mx-1 self-center" />
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('removeFormat') }} title="Limpiar Formato" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Eraser className="w-3.5 h-3.5" /></button>
      </div>

      <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyLeft') }} title="Izquierda" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignLeft className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyCenter') }} title="Centro" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignCenter className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyRight') }} title="Derecha" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignRight className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyFull') }} title="Justificar" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignJustify className="w-3.5 h-3.5" /></button>
      </div>

      <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertUnorderedList') }} title="Lista Puntos" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><List className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertOrderedList') }} title="Lista Números" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><ListOrdered className="w-3.5 h-3.5" /></button>
      </div>

      <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); setModal({ type: 'embed' }) }} title="Insertar Código (Iframe/Script)" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><FileCode className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); fileInputRef.current?.click() }} title="Subir Imagen Local" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Upload className="w-3.5 h-3.5" /></button>
      </div>

      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); saveSelection(); setShowColorPicker(!showColorPicker); setShowSizes(false) }}
          className="flex bg-white/5 rounded-xl p-0.5 border border-white/5 items-center px-2 hover:border-blis-red/30 transition-all cursor-pointer h-[38px] group"
        >
          <Palette className="w-3.5 h-3.5 text-gray-400 mr-2 group-hover:text-white transition-colors" />
          <div
            className="w-5 h-5 rounded-full border border-white/20 shadow-inner"
            style={{ backgroundColor: selectedColor }}
          />
        </button>

        <AnimatePresence>
          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-3 p-5 bg-zinc-900 border border-white/10 rounded-[2rem] shadow-2xl z-[100] w-64 space-y-4 ring-1 ring-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Selector Pro</span>
                <button onClick={() => setShowColorPicker(false)} className="text-gray-500 hover:text-white transition-colors"><X className="w-3 h-3" /></button>
              </div>

              <div className="grid grid-cols-6 gap-2 mb-4">
                {['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#d5c108', '#F59E0B', '#10B981', '#3B82F6'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { handleColorChange(color); execCommand('foreColor', color); setShowColorPicker(false) }}
                    className="w-full aspect-square rounded-full border border-white/20 shadow-inner hover:scale-125 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-3 py-3 border-t border-white/10">
                <div className="space-y-1 w-full">
                  <label className="text-[8px] font-bold text-gray-500 uppercase px-1">Personalizado (Hex)</label>
                  <div className="relative w-full flex items-center">
                    <div className="absolute left-1.5 z-10 w-6 h-6 rounded-md overflow-hidden border border-white/20">
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-10 h-10 p-0 border-0 absolute -top-2 -left-2 cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={selectedColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-2 py-2 text-[10px] text-white focus:outline-none focus:border-blis-red font-mono uppercase tracking-widest"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
        <div className="relative">
          <button type="button" onClick={() => setShowEmoji(!showEmoji)} title="Emojis" className="p-2 hover:bg-white/10 text-amber-500 rounded-lg transition-all"><Smile className="w-3.5 h-3.5" /></button>
          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-full left-0 mt-3 p-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[100] grid grid-cols-6 gap-3 w-64 ring-2 ring-black/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-2xl" />
                {Emojis.map(e => (
                  <button
                    key={e}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { execCommand('insertText', e); setShowEmoji(false) }}
                    className="text-2xl hover:scale-125 hover:rotate-6 transition-transform active:scale-95 py-1 flex items-center justify-center filter drop-shadow-md"
                  >
                    {e}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
    </div>
  )

  return (
    <div className={`w-full bg-zinc-950 border border-white/10 rounded-3xl overflow-visible transition-all relative shadow-2xl ${isFull ? 'fixed inset-4 z-[2000] flex flex-col' : 'z-[50]'}`}>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md space-y-6 shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center gap-3 text-white font-black uppercase text-[10px] tracking-widest">
                <div className="p-2 bg-gradient-to-tr from-blis-red to-orange-500 rounded-lg shadow-lg">
                  {modal.type === 'error' ? <AlertCircle className="w-4 h-4 text-white" /> : modal.type === 'embed' ? <FileCode className="w-4 h-4 text-white" /> : <LinkIcon className="w-4 h-4 text-white" />}
                </div>
                {modal.type === 'error' ? 'Aviso del Sistema' : modal.type === 'embed' ? 'Incrustar Contenido' : 'Añadir Enlace'}
              </div>

              <div className="space-y-4">
                <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                  {modal.message || (modal.type === 'embed' ? 'Pega el código iframe o script profesional aquí. Se cargará instantáneamente en el editor.' : 'Introduce la URL de destino completa para el enlace seleccionado.')}
                </p>
                {modal.type !== 'error' && (
                  <textarea id="modal-input" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-xs focus:outline-none focus:border-blis-red min-h-[120px] transition-all resize-none" placeholder={modal.type === 'embed' ? '<iframe src="..." />' : 'https://bliscorp.com/...'} />
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-4 bg-white/5 text-gray-500 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all">Cancelar</button>
                {modal.type !== 'error' && (
                  <button onClick={() => {
                    const input = document.getElementById('modal-input') as HTMLTextAreaElement
                    if (modal.type === 'embed') execCommand('insertHTML', input.value)
                    else execCommand('createLink', input.value)
                    setModal(null)
                  }} className="flex-1 py-4 bg-blis-red text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blis-red/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Aplicar</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isFull && (
        <div className="p-4 bg-black border-b border-white/5 flex justify-between items-center px-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em]">Creative Suite / Editor Moderno</span>
          </div>
          <button onClick={() => setIsFull(false)} className="px-6 py-2 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-[10px] font-black text-gray-400 uppercase tracking-widest border border-white/5 flex items-center gap-2 group"><X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" /> Cerrar</button>
        </div>
      )}

      {Toolbar()}

      {selectedImage && (
        <div id="img-toolbar" className="bg-zinc-900 border-b border-white/5 p-2 px-6 flex items-center justify-between z-[50]">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest hidden sm:block">Ajustes de Imagen</span>
            <div className="flex gap-1.5 items-center bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
              <span className="text-[8px] font-black text-gray-500 uppercase">Tamaño</span>
              <input type="range" min="10" max="100" value={parseInt(selectedImage.style.width || '100')} onChange={(e) => { selectedImage.style.width = `${e.target.value}%`; const val = editorRef.current!.innerHTML; setLocalValue(val); onChange(val) }} className="w-20 sm:w-32 accent-blis-red" />
              <span className="text-[9px] font-black uppercase text-white w-8 text-right">{parseInt(selectedImage.style.width || '100')}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
              <button onMouseDown={(e) => { e.preventDefault(); selectedImage.style.display = 'block'; selectedImage.style.marginLeft = '0'; selectedImage.style.marginRight = 'auto'; const val = editorRef.current!.innerHTML; setLocalValue(val); onChange(val) }} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><AlignLeft className="w-3.5 h-3.5" /></button>
              <button onMouseDown={(e) => { e.preventDefault(); selectedImage.style.display = 'block'; selectedImage.style.marginLeft = 'auto'; selectedImage.style.marginRight = 'auto'; const val = editorRef.current!.innerHTML; setLocalValue(val); onChange(val) }} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><AlignCenter className="w-3.5 h-3.5" /></button>
              <button onMouseDown={(e) => { e.preventDefault(); selectedImage.style.display = 'block'; selectedImage.style.marginLeft = 'auto'; selectedImage.style.marginRight = '0'; const val = editorRef.current!.innerHTML; setLocalValue(val); onChange(val) }} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><AlignRight className="w-3.5 h-3.5" /></button>
            </div>
            <div className="hidden sm:flex bg-white/5 rounded-xl p-0.5 border border-white/5">
              <button onMouseDown={(e) => { e.preventDefault(); const c = selectedImage.style.transform || ''; const m = c.match(/rotate\((\d+)deg\)/); const d = m ? (parseInt(m[1]) + 90) % 360 : 90; selectedImage.style.transform = c.replace(/rotate\([^)]+\)/, '').trim() + ` rotate(${d}deg)`; const val = editorRef.current!.innerHTML; setLocalValue(val); onChange(val) }} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-1 transition-colors px-2"><RotateCw className="w-3.5 h-3.5 mr-1" /><span className="text-[8px] font-black uppercase">Girar</span></button>
              <button onMouseDown={(e) => { e.preventDefault(); const c = selectedImage.style.transform || ''; const m = c.match(/scaleX\((-?\d+)\)/); const s = m ? parseInt(m[1]) * -1 : -1; selectedImage.style.transform = c.replace(/scaleX\([^)]+\)/, '').trim() + ` scaleX(${s})`; const val = editorRef.current!.innerHTML; setLocalValue(val); onChange(val) }} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-1 transition-colors px-2"><FlipHorizontal className="w-3.5 h-3.5 mr-1" /><span className="text-[8px] font-black uppercase">Espejo</span></button>
              <button onMouseDown={(e) => { e.preventDefault(); setCroppingImageSrc(selectedImage.src) }} className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg flex items-center transition-colors px-2"><Scissors className="w-3.5 h-3.5 mr-1" /><span className="text-[8px] font-black uppercase">Cortar</span></button>
            </div>
            <button onMouseDown={(e) => { e.preventDefault(); selectedImage.remove(); setSelectedImageId(null); const val = editorRef.current!.innerHTML; setLocalValue(val); onChange(val) }} className="p-1.5 px-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20"><Trash className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}

      <div className="relative group/editor flex-1 flex flex-col min-h-0 z-[10]">
        {isHtmlMode ? (
          <textarea
            ref={textareaRef}
            value={localValue}
            onChange={(e) => {
              const val = e.target.value
              setLocalValue(val)
              onChange(val)
            }}
            className={`w-full px-12 py-10 bg-zinc-950/50 text-[14px] text-emerald-400/80 font-mono focus:outline-none leading-[1.8] overflow-y-auto scroll-smooth border-t border-white/5 mt-4 border-r-0 border-l-0 border-b-0
                        ${isFull ? 'flex-1 w-full mx-auto' : 'min-h-[220px] resize-y'}`}
            placeholder="<h1>Escribe tu código HTML aquí...</h1>"
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onClick={(e) => {
              saveSelection()
              if ((e.target as HTMLElement).tagName === 'IMG') {
                const img = e.target as HTMLImageElement
                if (!img.id) img.id = `img_${Date.now()}`
                setSelectedImageId(img.id)
                if (!img.style.width) img.style.width = '100%'
              } else {
                setSelectedImageId(null)
              }
            }}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onInput={(e) => {
              const val = e.currentTarget.innerHTML
              setLocalValue(val)
              onChange(val)
            }}
            className={`w-full px-12 py-10 text-[15px] text-gray-200 focus:outline-none font-medium leading-[1.8] prose prose-invert overflow-y-auto scroll-smooth
                        ${isFull ? 'flex-1 w-full mx-auto' : 'min-h-[220px] resize-y'}
                        prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
                        prose-h1:text-4xl prose-h2:text-2xl prose-blockquote:border-l-4 prose-blockquote:border-blis-red prose-blockquote:bg-white/5 prose-blockquote:p-4 prose-blockquote:rounded-r-xl
                        [&_ul]:list-disc [&_ul]:pl-8 [&_ul]:mb-6 [&_ul_li]:mb-2 [&_ul_li::marker]:text-white/40
                        [&_ol]:list-decimal [&_ol]:pl-8 [&_ol]:mb-6 [&_ol_li]:mb-2 [&_ol_li::marker]:text-white/40 [&_ol_li::marker]:font-bold
                        [&_img]:rounded-xl [&_img]:shadow-2xl [&_img]:transition-all
                        ${selectedImage ? '[&_img]:opacity-50' : ''}`}
            style={{
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
              wordWrap: 'break-word',
            }}
          />
        )}

        {!isFull && (
          <div className="absolute bottom-3 right-3 p-1.5 text-gray-800 pointer-events-none group-hover/editor:text-white/20 transition-all">
            <GripHorizontal className="w-5 h-5 rotate-[-45deg]" />
          </div>
        )}
      </div>

      {(!localValue || localValue === '<br>') && !isFull && (
        <div className="absolute top-[80px] left-12 pointer-events-none text-gray-800 text-[10px] font-black uppercase tracking-[0.4em] opacity-40 select-none">{placeholder}</div>
      )}

      {croppingImageSrc && (
        <ImageCropper
          src={croppingImageSrc}
          onCrop={(base64) => {
            if (selectedImageId && editorRef.current) {
              const img = editorRef.current.querySelector(`#${selectedImageId}`) as HTMLImageElement
              if (img) {
                img.src = base64
                img.removeAttribute('style')
                img.style.width = '100%'
                img.style.display = 'block'
                img.style.margin = '0 auto'
                const val = editorRef.current.innerHTML
                setLocalValue(val)
                onChange(val)
              }
            }
            setCroppingImageSrc(null)
          }}
          onCancel={() => setCroppingImageSrc(null)}
        />
      )}
    </div>
  )
}

