"use client"

import { Barcode as BarcodeIcon, Trash2, Edit2, Save } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { Product } from '../../_types'

interface BulkEditActionsProps {
  selectedCount: number
  isBulkEditing: boolean
  onToggleBulkEdit: () => void
  onPrintLabels: () => void
  onBulkDelete: () => void
}

export function BulkEditActions({
  selectedCount,
  isBulkEditing,
  onToggleBulkEdit,
  onPrintLabels,
  onBulkDelete
}: BulkEditActionsProps) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 bg-white/[0.03] border border-white/5 rounded-2xl p-1"
          >
            <button
              onClick={onPrintLabels}
              className="p-2 sm:p-2.5 rounded-xl transition-all text-emerald-500 hover:bg-emerald-500/10"
              title="Imprimir Selección"
            >
              <BarcodeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onBulkDelete}
              className="p-2 sm:p-2.5 rounded-xl transition-all text-red-500 hover:bg-red-500/10"
              title="Borrar Múltiples"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onToggleBulkEdit}
        className={`p-2 sm:p-2.5 rounded-xl transition-all shrink-0 ${isBulkEditing ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/[0.03] border border-white/5 text-gray-500 hover:text-white'}`}
        title={isBulkEditing ? "Guardar Cambios" : "Edición Masiva"}
      >
        <motion.div animate={{ rotate: isBulkEditing ? 180 : 0 }}>
          {isBulkEditing ? <Save className="w-4 h-4"/> : <Edit2 className="w-4 h-4" />}
        </motion.div>
      </button>
    </div>
  )
}