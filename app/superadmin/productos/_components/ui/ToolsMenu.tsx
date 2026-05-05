"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CategoryManager } from "@/components/superadmin/CategoryManager"
import { StatusManager } from "@/components/superadmin/StatusManager"
import { SkuManager } from "@/components/superadmin/SkuManager"
import { UnitManager } from "@/components/superadmin/UnitManager"
import { CurrencyManager } from "@/components/superadmin/CurrencyManager"
import { LabelManager } from "@/components/superadmin/LabelManager"
import { ViewManager } from "@/components/superadmin/ViewManager"
import { BusinessEngineManager } from "@/components/superadmin/BusinessEngineManager"
import { ShippingManager } from "@/components/superadmin/ShippingManager"

interface ToolsMenuProps {
  show: boolean
  onClose: () => void
}

export function ToolsMenu({ show, onClose }: ToolsMenuProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 10, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 10, scale: 0.95 }}
          className="absolute top-0 right-full mr-2 bg-zinc-950 border border-white/10 rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[1000] min-w-[280px] backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-1 p-2">
            <CategoryManager />
            <StatusManager />
            <SkuManager />
            <UnitManager />
            <CurrencyManager />
            <ShippingManager />
            <BusinessEngineManager />
            <LabelManager />
            <ViewManager />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
