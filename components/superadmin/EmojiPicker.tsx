"use client";

import { Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EmojiPickerProps {
  showEmoji: boolean
  setShowEmoji: (v: boolean) => void
  onInsertEmoji: (emoji: string) => void
}

const Emojis = [
  '😀', '🤣', '😍', '😎', '🤔', '😴', '🤩', '🥳', '😱', '😡', '🤡', '😇',
  '🔥', '⭐', '✅', '🚀', '💡', '💎', '🎯', '📍', '📢', '⚠️', '✨', '🎓',
  '🏆', '💻', '📱', '📈', '🎨', '🛠️', '🧪', '📅', '⏰', '🔒', '🔑', '❤️',
  '👀', '🙌', '👏', '🤝', '💯', '🌟', '🎈'
];

export function EmojiPicker({ showEmoji, setShowEmoji, onInsertEmoji }: EmojiPickerProps) {
  return (
    <div className="flex bg-white/5 rounded-xl p-0.5 border border-white/5">
      <div className="relative">
        <button type="button" onClick={() => setShowEmoji(!showEmoji)} title="Emojis" className="p-2 hover:bg-white/10 text-amber-500 rounded-lg transition-all"><Smile className="w-3.5 h-3.5" /></button>
        <AnimatePresence>
          {showEmoji && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute top-full left-0 mt-3 p-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[100] grid grid-cols-6 gap-3 w-64 ring-2 ring-black/50">
              {Emojis.map(e => (
                <button key={e} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onInsertEmoji(e); setShowEmoji(false); }} className="text-2xl hover:scale-125 hover:rotate-6 transition-transform active:scale-95 py-1 flex items-center justify-center filter drop-shadow-md">{e}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
