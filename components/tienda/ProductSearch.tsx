"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, SlidersHorizontal, ShoppingCart, Star, Filter } from "lucide-react";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";
import { useToast } from "@/components/ui/Toast";
import { ProductDef } from "@/lib/types/shop";

interface ProductSearchProps {
  products: ProductDef[];
}

const CATEGORIES = ["Todos", "Cursos"];
const SORT_OPTIONS = [
  { label: "Relevancia", value: "relevance" },
  { label: "Precio: menor a mayor", value: "price_asc" },
  { label: "Precio: mayor a menor", value: "price_desc" },
  { label: "Más vendidos", value: "popular" },
];

export function ProductSearch({ products }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sort, setSort] = useState("relevance");
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToCart, openCart } = useShop();
  const { showToast } = useToast();

  // Filtrar y ordenar
  const results = useMemo(() => {
    let filtered = products.filter(p => {
      const matchQuery = !query || 
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase());
      const matchCat = selectedCategory === "Todos" || 
        p.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchPrice = p.price <= maxPrice;
      return matchQuery && matchCat && matchPrice;
    });

    if (sort === "price_asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
    if (sort === "popular") filtered = [...filtered].sort((a, b) => parseInt(b.sales) - parseInt(a.sales));

    return filtered;
  }, [products, query, selectedCategory, maxPrice, sort]);

  // Abrir con Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleAdd = (product: ProductDef) => {
    addToCart({ ...product });
    openCart();
    showToast(`"${product.title}" agregado al carrito`, "success");
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón de búsqueda */}
      <button
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl text-gray-400 text-sm transition-all group"
      >
        <Search className="w-4 h-4 group-hover:text-blis-red transition-colors flex-shrink-0" />
        <span className="flex-1 text-left text-[12px]">Buscar productos...</span>
        <kbd className="hidden sm:flex items-center gap-1 text-[9px] text-gray-600 bg-white/5 border border-white/10 px-2 py-1 rounded-lg font-mono">
          Ctrl K
        </kbd>
      </button>

      {/* Modal de búsqueda */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4"
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Buscar cursos de trading..."
                  className="flex-1 bg-transparent text-white placeholder-gray-500 text-base outline-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(f => !f)}
                    className={`p-2 rounded-xl transition-all ${showFilters ? "bg-blis-red/20 text-blis-red border border-blis-red/30" : "bg-white/5 text-gray-400 hover:text-white border border-white/10"}`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-white/5 overflow-hidden"
                  >
                    <div className="p-4 space-y-4">
                      {/* Categorías */}
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Categoría</p>
                        <div className="flex flex-wrap gap-2">
                          {CATEGORIES.map(cat => (
                            <button
                              key={cat}
                              onClick={() => setSelectedCategory(cat)}
                              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                                selectedCategory === cat
                                  ? "bg-blis-red border-blis-red text-white"
                                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Precio máximo */}
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">
                          Precio máximo: <span className="text-white">${maxPrice}</span>
                        </p>
                        <input
                          type="range" min={0} max={1000} step={10} value={maxPrice}
                          onChange={e => setMaxPrice(Number(e.target.value))}
                          className="w-full accent-blis-red"
                        />
                      </div>

                      {/* Ordenar */}
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Ordenar por</p>
                        <div className="flex flex-wrap gap-2">
                          {SORT_OPTIONS.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => setSort(opt.value)}
                              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                                sort === opt.value
                                  ? "bg-white/10 border-white/30 text-white"
                                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Resultados */}
              <div className="max-h-[420px] overflow-y-auto">
                {results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Filter className="w-8 h-8 mb-3 opacity-30" />
                    <p className="text-sm font-bold">Sin resultados para "{query}"</p>
                    <p className="text-xs mt-1">Intenta con otro término o categoría</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {results.slice(0, 8).map(product => (
                      <div key={product.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.03] transition-colors group">
                        {/* Imagen */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/5 flex-shrink-0 bg-zinc-900">
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>

                        {/* Info */}
                        <Link
                          href={`/tienda/producto/${product.slug || product.id}`}
                          onClick={() => setIsOpen(false)}
                          className="flex-1 min-w-0"
                        >
                          <p className="text-sm font-bold text-white line-clamp-1 group-hover:text-blis-red transition-colors">{product.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-500 uppercase">{product.category}</span>
                            <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-amber-400" /> {product.rating}
                            </span>
                          </div>
                        </Link>

                        {/* Precio + agregar */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            {product.originalPrice && (
                              <p className="text-[9px] text-gray-600 line-through">${product.originalPrice}</p>
                            )}
                            <p className="text-sm font-black text-white">${product.price}</p>
                          </div>
                          <button
                            onClick={() => handleAdd(product)}
                            className="w-8 h-8 rounded-xl bg-blis-red/10 border border-blis-red/30 flex items-center justify-center hover:bg-blis-red transition-all group/btn"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 text-blis-red group-hover/btn:text-white transition-colors" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {results.length > 8 && (
                      <div className="px-5 py-3 text-center">
                        <p className="text-[11px] text-gray-500">
                          Mostrando 8 de <span className="text-white font-bold">{results.length}</span> resultados
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-600">
                <span>{results.length} productos encontrados</span>
                <span>ESC para cerrar</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
