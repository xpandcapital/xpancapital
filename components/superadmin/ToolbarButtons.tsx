"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bold, Italic, Underline, List, ListOrdered,
  Heading1, Heading2, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Strikethrough, Undo, Redo, Eraser,
  FileCode, Upload, Search, Sparkles
} from "lucide-react";
import { ColorPickerToolbar } from "./ColorPickerToolbar";
import { EmojiPicker } from "./EmojiPicker";

interface ToolbarButtonsProps {
  isHtmlMode: boolean
  setIsHtmlMode: (v: boolean) => void
  execCommand: (command: string, val?: string) => void
  saveSelection: () => void
  showSizes: boolean
  setShowSizes: (v: boolean) => void
  showColorPicker: boolean
  setShowColorPicker: (v: boolean) => void
  selectedColor: string
  handleColorChange: (hex: string) => void
  showEmoji: boolean
  setShowEmoji: (v: boolean) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  setModal: (m: { type: 'link' | 'embed' | 'error' | 'loading', message?: string } | null) => void
  showInlineAI: boolean
  setShowInlineAI: (v: boolean) => void
  inlineTitle: string
  setInlineTitle: (v: string) => void
  inlineIdea: string
  setInlineIdea: (v: string) => void
  elapsedSeconds: number
  onAIGenerate?: (title: string, idea: string) => void
  isGeneratingAI?: boolean
  onCancelAIGenerate?: () => void
  onImageSearch?: () => void
}

export function ToolbarButtons({
  isHtmlMode, setIsHtmlMode, execCommand, saveSelection,
  showSizes, setShowSizes,
  showColorPicker, setShowColorPicker, selectedColor, handleColorChange,
  showEmoji, setShowEmoji,
  fileInputRef, setModal,
  showInlineAI, setShowInlineAI, inlineTitle, setInlineTitle,
  inlineIdea, setInlineIdea, elapsedSeconds,
  onAIGenerate, isGeneratingAI, onCancelAIGenerate, onImageSearch,
}: ToolbarButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 p-3 px-6 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 overflow-visible z-10 w-full rounded-t-3xl">
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
            onClick={(e) => { e.preventDefault(); saveSelection(); setShowSizes(!showSizes); setShowColorPicker(false); }}
            className="bg-transparent text-gray-400 focus:outline-none hover:text-white cursor-pointer h-[30px] px-3 flex items-center justify-center min-w-max transition-all"
            title="Tamaño de Letra"
          >
            <div className="flex items-baseline font-serif font-black tracking-tighter">
              <span className="text-[10px]">a</span>
              <span className="text-[14px]">A</span>
            </div>
          </button>
          <AnimatePresence>
            {showSizes && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full left-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-[200] w-32 overflow-hidden flex flex-col">
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('fontSize', '3'); setShowSizes(false); }} className="px-4 py-3 text-left hover:bg-white/5 text-[10px] font-bold text-gray-300 uppercase tracking-widest">A Normal</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('fontSize', '1'); setShowSizes(false); }} className="px-4 py-3 text-left hover:bg-white/5 text-[8px] font-bold text-gray-400 uppercase tracking-widest border-t border-white/5">A Pequeño</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('fontSize', '5'); setShowSizes(false); }} className="px-4 py-3 text-left hover:bg-white/5 text-[12px] font-black text-white uppercase tracking-widest border-t border-white/5">A Grande</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('fontSize', '7'); setShowSizes(false); }} className="px-4 py-3 text-left hover:bg-white/5 text-[14px] font-black text-purple-400 uppercase tracking-widest border-t border-white/5">A Enorme</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('undo'); }} title="Deshacer" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Undo className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('redo'); }} title="Rehacer" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Redo className="w-3.5 h-3.5" /></button>
      </div>

      <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }} title="Negrita" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Bold className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }} title="Cursiva" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Italic className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('underline'); }} title="Subrayado" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Underline className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('strikeThrough'); }} title="Tachado" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Strikethrough className="w-3.5 h-3.5" /></button>
        <div className="w-px h-6 bg-white/10 mx-1 self-center" />
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<P>'); }} title="Párrafo Normal" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all font-serif font-bold text-xs">P</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<H1>'); }} title="Título H1" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Heading1 className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<H2>'); }} title="Subtítulo H2" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Heading2 className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('formatBlock', '<BLOCKQUOTE>'); }} title="Cita Blockquote" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Quote className="w-3.5 h-3.5" /></button>
        <div className="w-px h-6 bg-white/10 mx-1 self-center" />
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('removeFormat'); }} title="Limpiar Formato" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Eraser className="w-3.5 h-3.5" /></button>
      </div>

      <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyLeft'); }} title="Izquierda" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignLeft className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyCenter'); }} title="Centro" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignCenter className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyRight'); }} title="Derecha" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignRight className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('justifyFull'); }} title="Justificar" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><AlignJustify className="w-3.5 h-3.5" /></button>
      </div>

      <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertUnorderedList'); }} title="Lista Puntos" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><List className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand('insertOrderedList'); }} title="Lista Números" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><ListOrdered className="w-3.5 h-3.5" /></button>
      </div>

      <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); saveSelection(); setModal({ type: 'embed' }); }} title="Insertar Código (Iframe/Script)" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><FileCode className="w-3.5 h-3.5" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); fileInputRef.current?.click(); }} title="Subir Imagen Local" className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"><Upload className="w-3.5 h-3.5" /></button>
        {onImageSearch && (
          <button type="button" onMouseDown={(e) => { e.preventDefault(); onImageSearch(); }} title="Buscar Imágenes Premium" className="p-2 hover:bg-purple-500/20 text-purple-400 hover:text-white rounded-lg transition-all"><Search className="w-3.5 h-3.5" /></button>
        )}
      </div>

      <ColorPickerToolbar
        showColorPicker={showColorPicker}
        setShowColorPicker={setShowColorPicker}
        selectedColor={selectedColor}
        onColorChange={handleColorChange}
        onSaveSelection={saveSelection}
        onCloseSizes={() => setShowSizes(false)}
      />

      <EmojiPicker
        showEmoji={showEmoji}
        setShowEmoji={setShowEmoji}
        onInsertEmoji={(emoji) => execCommand('insertText', emoji)}
      />

      <div className="flex-1" />

      {onAIGenerate && !showInlineAI && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowInlineAI(true); }}
          className="flex bg-gradient-to-r from-purple-600/20 to-purple-500/10 border border-purple-500/30 rounded-xl items-center px-4 py-2 hover:from-purple-600/30 hover:to-purple-500/20 transition-all text-[11px] font-black tracking-[0.2em] uppercase text-purple-400 gap-2 shadow-[0_0_15px_rgba(168,85,247,0.15)] whitespace-nowrap w-full md:w-auto justify-center md:justify-start relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]" />
          <Sparkles className="w-4 h-4" /> Redactar con IA
        </button>
      )}
    </div>
  );
}
