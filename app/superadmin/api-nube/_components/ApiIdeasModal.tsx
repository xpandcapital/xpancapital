"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Lightbulb, X } from "lucide-react"
import type { ApiIdeas } from '../_types'

interface ApiIdeasModalProps {
  isOpen: boolean
  ideas: ApiIdeas | null
  appName: string
  onClose: () => void
}

export function ApiIdeasModal({ isOpen, ideas, appName, onClose }: ApiIdeasModalProps) {
  if (!isOpen || !ideas) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Lightbulb className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{ideas.title}</h2>
                <p className="text-sm text-gray-500">Ideas y posibilidades de implementacion</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {ideas.ideas.map((cat, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">{cat.category}</h3>
                <ul className="space-y-2">
                  {cat.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex gap-3 text-sm text-gray-300">
                      <span className="text-purple-400 mt-1">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/10 bg-black/20">
            <button onClick={onClose} className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors">
              Cerrar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}