"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Search,
  Package,
  ChevronRight,
  Loader2,
  Filter
} from 'lucide-react'
import { useProductosEntregas } from './_hooks/useProductosEntregas'
import { EntregasPanel } from './_components/EntregasPanel'

export default function ProductosEntregasPage() {
  const { productos, loading, error } = useProductosEntregas()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  const filteredProducts = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedProduct = productos.find(p => p.id === selectedProductId)

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Entregas Digitales
          </h1>
          <p className="text-gray-400 mt-2">
            Gestiona videos tutoriales, archivos y instrucciones para tus productos digitales
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-blis-red"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 font-bold transition-colors">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blis-red" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <p className="text-red-400 font-bold">{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-12 text-center">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos digitales'}
            </h2>
            <p className="text-gray-500">
              {searchTerm
                ? 'Intenta con otro término de búsqueda'
                : 'Crea productos de tipo "digital" para gestionar sus entregas'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <motion.button
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedProductId(product.id)}
                className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 text-left hover:border-blis-red/30 transition-all group"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0 relative">
                    {product.imagen_principal ? (
                      <Image
                        src={product.imagen_principal}
                        alt={product.nombre}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="bg-blis-red/20 text-blis-red text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                      {product.categoria?.nombre || 'Digital'}
                    </span>
                    <h3 className="text-white font-black text-sm mt-2 uppercase tracking-tight line-clamp-2 group-hover:text-blis-red transition-colors">
                      {product.nombre}
                    </h3>
                    <div className="flex items-center gap-2 mt-3 text-gray-500">
                      <ChevronRight className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Gestionar</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedProductId && selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setSelectedProductId(null)}
            />
            <EntregasPanel
              productoId={selectedProductId}
              productoNombre={selectedProduct.nombre}
              onClose={() => setSelectedProductId(null)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
