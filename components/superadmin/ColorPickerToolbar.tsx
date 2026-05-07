"use client";

import { useState } from "react";
import { X, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ColorPickerToolbarProps {
  showColorPicker: boolean
  setShowColorPicker: (v: boolean) => void
  selectedColor: string
  onColorChange: (hex: string) => void
  onSaveSelection: () => void
  onCloseSizes: () => void
}

export function ColorPickerToolbar({
  showColorPicker,
  setShowColorPicker,
  selectedColor,
  onColorChange,
  onSaveSelection,
  onCloseSizes,
}: ColorPickerToolbarProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onSaveSelection(); setShowColorPicker(!showColorPicker); onCloseSizes(); }}
        className="flex bg-white/5 rounded-xl p-0.5 border border-white/5 items-center px-2 hover:border-blis-red/30 transition-all cursor-pointer h-[38px] group"
      >
        <Palette className="w-3.5 h-3.5 text-gray-400 mr-2 group-hover:text-white transition-colors" />
        <div className="w-5 h-5 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: selectedColor }} />
      </button>

      <AnimatePresence>
        {showColorPicker && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full left-0 mt-3 p-5 bg-zinc-900 border border-white/10 rounded-[2rem] shadow-2xl z-[100] w-64 space-y-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Selector Pro</span>
              <button onClick={() => setShowColorPicker(false)} className="text-gray-500 hover:text-white transition-colors"><X className="w-3 h-3" /></button>
            </div>

            <div className="grid grid-cols-6 gap-2 mb-4">
              {['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#BE0B3C', '#F59E0B', '#10B981', '#3B82F6'].map(color => (
                <button key={color} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onColorChange(color); setShowColorPicker(false); }} className="w-full aspect-square rounded-full border border-white/20 shadow-inner hover:scale-125 transition-transform" style={{ backgroundColor: color }} />
              ))}
            </div>

            <div className="flex flex-col gap-3 py-3 border-t border-white/10">
              <div className="space-y-1 w-full">
                <label className="text-[8px] font-bold text-gray-500 uppercase px-1">Personalizado (Hex)</label>
                <div className="relative w-full flex items-center">
                  <div className="absolute left-1.5 z-10 w-6 h-6 rounded-md overflow-hidden border border-white/20">
                    <input type="color" value={selectedColor} onChange={(e) => onColorChange(e.target.value)} className="w-10 h-10 p-0 border-0 absolute -top-2 -left-2 cursor-pointer" />
                  </div>
                  <input type="text" value={selectedColor} onChange={(e) => onColorChange(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-2 py-2 text-[10px] text-white focus:outline-none focus:border-blis-red font-mono uppercase tracking-widest" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
